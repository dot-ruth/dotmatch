import logging
import re
from datetime import datetime

logger = logging.getLogger(__name__)

TECH_SKILLS = [
    "python", "javascript", "typescript", "react", "reactjs", "react.js",
    "node", "nodejs", "node.js", "vue", "vuejs", "vue.js", "angular",
    "next", "nextjs", "next.js", "nuxt", "nuxtjs",
    "java", "kotlin", "scala", "go", "golang", "rust", "ruby", "rails",
    "php", "laravel", "swift", "objective-c",
    "html", "css", "sass", "scss", "tailwind", "tailwindcss",
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
    "sqlite", "mariadb", "dynamodb", "cassandra",
    "aws", "gcp", "azure", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "ci/cd", "github actions",
    "graphql", "rest", "restapi", "rest api", "grpc",
    "django", "fastapi", "flask", "spring", "spring boot",
    "express", "expressjs", "nestjs", "rails",
    "machine learning", "ml", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "data science", "data engineering", "etl",
    "git", "github", "gitlab", "bitbucket",
    "linux", "unix", "bash", "shell",
    "agile", "scrum", "jira",
    "figma", "sketch", "adobe xd",
    "ios", "android", "react native", "flutter", "xamarin",
    "microservices", "serverless", "lambda",
    "kafka", "rabbitmq", "redis",
    "nginx", "apache", "caddy",
    "monitoring", "prometheus", "grafana", "datadog", "splunk",
]

JOB_TITLE_PATTERNS = [
    r"(?:senior|sr\.?|junior|jr\.?|lead|staff|principal|chief)?\s*(?:software|backend|frontend|fullstack|full-stack|full\s*stack|devops|site\s*reliability|infrastructure|platform|data|machine\s*learning|ml|ai|cloud|security|mobile|ios|android|embedded|systems)\s*(?:engineer|developer|architect|scientist|analyst)",
    r"(?:software|backend|frontend|fullstack|full-stack|full\s*stack|devops|data|ml|ai)\s*(?:engineer|developer)",
    r"developer",
    r"engineer",
    r"architect",
    r"scientist",
]


def extract_skills(text: str) -> list[str]:
    """Extract technical skills from resume text."""
    text_lower = text.lower()
    found = []
    for skill in TECH_SKILLS:
        if skill in text_lower and skill not in found:
            found.append(skill)
    return found[:20]


def extract_job_titles(text: str) -> list[str]:
    """Extract job titles from resume text."""
    text_lower = text.lower()
    titles = []
    for pattern in JOB_TITLE_PATTERNS:
        matches = re.findall(pattern, text_lower)
        for m in matches:
            title = m.strip()
            if title and title not in titles:
                titles.append(title)
    return titles[:5]


def extract_experience_years(text: str) -> float | None:
    """Try to extract years of experience from resume text."""
    patterns = [
        r"(\d+)\+?\s*years?\s*(?:of\s+)?experience",
        r"experience\s*:\s*(\d+)\+?\s*years?",
        r"(\d+)\+?\s*years?\s*(?:in|with|of)\s*(?:software|engineering|development|programming)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return None


def extract_education(text: str) -> list[str]:
    """Extract education info from resume text."""
    patterns = [
        r"(?:bachelor|b\.?s\.?|b\.?a\.?|undergraduate)\s*(?:degree)?\s*(?:in\s+[\w\s]+)?",
        r"(?:master|m\.?s\.?|m\.?a\.?|graduate)\s*(?:degree)?\s*(?:in\s+[\w\s]+)?",
        r"(?:ph\.?d|doctorate|doctoral)\s*(?:in\s+[\w\s]+)?",
        r"(?:associate|a\.?s\.?)\s*(?:degree)?\s*(?:in\s+[\w\s]+)?",
        r"(?:university|college|institute)\s+(?:of\s+)?[\w\s]+",
    ]
    found = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            cleaned = m.strip().title()
            if cleaned and cleaned not in found and len(cleaned) > 5:
                found.append(cleaned)
    return found[:5]


def parse_resume_text(text: str) -> dict:
    """Parse resume text and extract structured data."""
    return {
        "skills": extract_skills(text),
        "job_titles": extract_job_titles(text),
        "experience_years": extract_experience_years(text),
        "education": extract_education(text),
    }


def calculate_match_score(job: dict, resume: dict) -> tuple[int, list[str]]:
    """Calculate how well a job matches the resume profile.

    Returns (score, matched_skills).
    """
    resume_skills = set(s.lower() for s in resume.get("skills", []))
    job_skills = set(s.lower() for s in job.get("skills", []))
    job_title = (job.get("title") or "").lower()
    job_desc = (job.get("description") or "").lower()

    matched = []
    for skill in resume_skills:
        if skill in job_skills or skill in job_title or skill in job_desc:
            matched.append(skill)

    if not resume_skills:
        return 0, []

    skill_score = len(matched) / len(resume_skills) * 60

    title_score = 0
    resume_titles = [t.lower() for t in resume.get("job_titles", [])]
    for title in resume_titles:
        words = title.split()
        if any(w in job_title for w in words if len(w) > 2):
            title_score = 20
            break

    remote_bonus = 10 if job.get("remote") else 0

    exp_bonus = 0
    if resume.get("experience_years"):
        exp_text = f"{resume['experience_years']} year"
        if exp_text in job_desc or f"{int(resume['experience_years'])}+" in job_desc:
            exp_bonus = 10

    total = min(100, int(skill_score + title_score + remote_bonus + exp_bonus))
    return total, matched[:10]
