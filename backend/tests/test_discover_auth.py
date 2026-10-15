import time

from fastapi.testclient import TestClient

from main import app, cors_origins
from routes import jobs as jobs_routes
from services.rate_limit import RateLimiter

client = TestClient(app)
loopback_client = TestClient(app, client=("127.0.0.1", 50000))


def _stub_discovery(monkeypatch) -> list[str]:
    calls: list[str] = []

    async def fake_discover() -> dict:
        calls.append("run")
        return {"new_jobs": 1, "sources_checked": 1, "errors": []}

    monkeypatch.setattr(jobs_routes, "discover_all_jobs", fake_discover)
    return calls


def _fresh_limiter(monkeypatch, max_calls: int = 5, window: float = 600) -> None:
    monkeypatch.setattr(jobs_routes, "_DISCOVER_LIMITER", RateLimiter(max_calls, window))


def test_discover_requires_token_when_configured(monkeypatch):
    monkeypatch.setenv("DOTMATCH_DISCOVER_TOKEN", "s3cret")
    monkeypatch.delenv("DOTMATCH_CORS_ORIGINS", raising=False)
    _fresh_limiter(monkeypatch)
    calls = _stub_discovery(monkeypatch)

    assert client.post("/api/jobs/discover").status_code == 401
    assert client.post("/api/jobs/discover", headers={"X-Discover-Token": "wrong"}).status_code == 401
    assert calls == []

    ok = client.post("/api/jobs/discover", headers={"X-Discover-Token": "s3cret"})
    assert ok.status_code == 200
    assert ok.json()["new_jobs"] == 1
    assert calls == ["run"]


def test_discover_is_loopback_only_without_token(monkeypatch):
    monkeypatch.delenv("DOTMATCH_DISCOVER_TOKEN", raising=False)
    _fresh_limiter(monkeypatch)
    calls = _stub_discovery(monkeypatch)

    assert client.post("/api/jobs/discover").status_code == 403

    _fresh_limiter(monkeypatch)
    ok = loopback_client.post("/api/jobs/discover")
    assert ok.status_code == 200
    assert calls == ["run"]


def test_discover_rate_limited_per_client(monkeypatch):
    monkeypatch.setenv("DOTMATCH_DISCOVER_TOKEN", "s3cret")
    _fresh_limiter(monkeypatch, max_calls=3, window=600)
    _stub_discovery(monkeypatch)
    headers = {"X-Discover-Token": "s3cret"}

    statuses = [client.post("/api/jobs/discover", headers=headers).status_code for _ in range(4)]

    assert statuses == [200, 200, 200, 429]


def test_rate_limiter_window_expires():
    limiter = RateLimiter(max_calls=1, window_seconds=0.01)

    assert limiter.check("a") is True
    assert limiter.check("a") is False
    time.sleep(0.02)
    assert limiter.check("a") is True


def test_cors_allows_only_configured_origins():
    allowed = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:3000"

    blocked = client.get("/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in blocked.headers


def test_cors_origins_configuration(monkeypatch):
    assert "http://localhost:3000" in cors_origins()

    monkeypatch.setenv("DOTMATCH_CORS_ORIGINS", "https://app.example, https://jobs.example")
    assert cors_origins() == ["https://app.example", "https://jobs.example"]

    monkeypatch.setenv("DOTMATCH_CORS_ORIGINS", "*")
    assert cors_origins() == ["*"]
