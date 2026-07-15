from pydantic import BaseModel


class Company(BaseModel):
    name: str


class Job(BaseModel):
    id: str
    title: str
    company: Company | None
    location: str | None
    remote: bool
    salary_min: int | None
    salary_max: int | None
    url: str | None
    description: str | None
    skills: list[str]
    experience_level: str | None
    employment_type: str | None
    source_type: str | None
    created_at: str


class PaginatedJobs(BaseModel):
    items: list[Job]
    total: int
    offset: int
    limit: int


class DiscoverResult(BaseModel):
    message: str
    new_jobs: int
    sources_checked: int
    errors: list[str]


class JobSource(BaseModel):
    name: str
    type: str
