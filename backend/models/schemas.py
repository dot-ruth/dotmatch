from pydantic import BaseModel, Field


class Company(BaseModel):
    name: str


class Job(BaseModel):
    id: str
    title: str
    company: Company | None = None
    location: str | None = None
    remote: bool = False
    salary_min: int | None = None
    salary_max: int | None = None
    url: str | None = None
    description: str | None = None
    skills: list[str] = []
    experience_level: str | None = None
    employment_type: str | None = None
    source_type: str | None = None
    posted_at: str | None = None
    deadline: str | None = None
    applied_at: str | None = None
    created_at: str = ""


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


class JobSourceCount(BaseModel):
    source_type: str
    job_count: int


class ResumeProfile(BaseModel):
    id: str
    filename: str
    raw_text: str
    skills: list[str]
    job_titles: list[str]
    experience_years: float | None
    education: list[str]
    created_at: str


class CoverLetterRequest(BaseModel):
    job_id: str | None = None
    url: str | None = None
    name: str | None = None
    requirements: list[str] = Field(default_factory=list)


class CoverLetterResponse(BaseModel):
    text: str
    job_id: str
    matched_skills: list[str]


class MatchedJob(BaseModel):
    job: Job
    match_score: int
    matched_skills: list[str]
