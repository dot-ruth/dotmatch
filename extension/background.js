/* Background service worker: talks to the DotMatch API so content scripts
   never fight the target site's CORS policy. */

const DEFAULTS = {
  apiBase: "http://localhost:8001",
  name: "",
  email: "",
  phone: "",
  city: "",
  linkedin: "",
  github: "",
  portfolio: "",
};

async function getSettings() {
  return chrome.storage.local.get(DEFAULTS);
}

async function fetchJson(url, config) {
  const res = await fetch(url, config);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof body.detail === "string" ? body.detail : `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return body;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "dm:getPayload") {
    (async () => {
      const settings = await getSettings();
      let profile = null;
      let profileError = null;
      try {
        profile = await fetchJson(`${settings.apiBase}/api/jobs/resume/profile`);
      } catch (err) {
        profileError = err instanceof Error ? err.message : String(err);
      }
      sendResponse({ ok: true, settings, profile, profileError });
    })().catch((err) => {
      sendResponse({ ok: false, error: String(err) });
    });
    return true;
  }

  if (msg && msg.type === "dm:coverLetter") {
    (async () => {
      const settings = await getSettings();
      try {
        const result = await fetchJson(`${settings.apiBase}/api/jobs/cover-letter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: msg.url, name: settings.name }),
        });
        sendResponse({ ok: true, text: result.text, matched: result.matched_skills || [] });
      } catch (err) {
        sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) });
      }
    })().catch((err) => {
      sendResponse({ ok: false, error: String(err) });
    });
    return true;
  }

  if (msg && msg.type === "dm:status") {
    (async () => {
      const settings = await getSettings();
      try {
        const profile = await fetchJson(`${settings.apiBase}/api/jobs/resume/profile`);
        sendResponse({
          ok: true,
          connected: true,
          hasResume: Boolean(profile),
          skills: profile ? (profile.skills || []).length : 0,
          name: settings.name,
        });
      } catch (err) {
        sendResponse({
          ok: true,
          connected: false,
          error: err instanceof Error ? err.message : String(err),
          name: settings.name,
        });
      }
    })().catch((err) => {
      sendResponse({ ok: false, error: String(err) });
    });
    return true;
  }

  return false;
});
