import logging
import re

logger = logging.getLogger(__name__)

TECH_SKILLS = {
    # Languages
    "python": ["python", "python3", "python2", "py"],
    "javascript": ["javascript", "js", "es6", "es2015", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "java": ["java", "jvm"],
    "go": ["go", "golang"],
    "rust": ["rust", "rustlang"],
    "ruby": ["ruby", "rails", "ruby on rails", "ror"],
    "php": ["php", "laravel", "symfony", "wordpress"],
    "swift": ["swift", "swiftui"],
    "kotlin": ["kotlin", "kt"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", ".net", "dotnet"],
    "scala": ["scala"],
    "elixir": ["elixir", "phoenix"],
    "haskell": ["haskell"],
    "clojure": ["clojure"],
    "zig": ["zig"],
    "lua": ["lua"],
    "r": ["r language", "r programming"],
    "matlab": ["matlab"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "mssql"],
    # Frontend
    "react": ["react", "reactjs", "react.js", "jsx", "tsx"],
    "vue": ["vue", "vuejs", "vue.js", "vue3", "vue2"],
    "angular": ["angular", "angularjs", "ng"],
    "svelte": ["svelte", "sveltekit"],
    "next.js": ["next.js", "nextjs", "next"],
    "nuxt": ["nuxt", "nuxtjs"],
    "remix": ["remix"],
    "html": ["html", "html5"],
    "css": ["css", "css3", "sass", "scss", "less", "tailwind", "tailwindcss", "bootstrap"],
    "jquery": ["jquery"],
    # Backend
    "node.js": ["node.js", "nodejs", "node"],
    "express": ["express", "expressjs"],
    "nestjs": ["nestjs", "nest.js"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi", "fast api"],
    "spring": ["spring", "spring boot", "springboot"],
    "rails": ["rails", "ruby on rails"],
    "graphql": ["graphql", "graphQL", "apollo", "relay"],
    "rest": ["rest", "restapi", "rest api", "restful"],
    "grpc": ["grpc", "gRPC"],
    # Databases
    "postgresql": ["postgresql", "postgres", "psql"],
    "mysql": ["mysql"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "elasticsearch": ["elasticsearch", "elastic", "kibana"],
    "sqlite": ["sqlite", "sqlite3"],
    "dynamodb": ["dynamodb", "dynamo"],
    "cassandra": ["cassandra"],
    "neo4j": ["neo4j"],
    "mariadb": ["mariadb"],
    "firebase": ["firebase"],
    "supabase": ["supabase"],
    # Cloud & DevOps
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks"],
    "gcp": ["gcp", "google cloud", "bigquery", "cloud run", "cloud functions"],
    "azure": ["azure", "microsoft azure"],
    "docker": ["docker", "containerization"],
    "kubernetes": ["kubernetes", "k8s"],
    "terraform": ["terraform"],
    "ansible": ["ansible"],
    "jenkins": ["jenkins"],
    "ci/cd": ["ci/cd", "ci cd", "cicd", "github actions", "gitlab ci", "circleci"],
    "linux": ["linux", "ubuntu", "centos", "debian"],
    "nginx": ["nginx"],
    "apache": ["apache"],
    # Data & ML
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning", "dl"],
    "nlp": ["nlp", "natural language processing"],
    "computer vision": ["computer vision", "cv", "image processing"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch", "torch"],
    "keras": ["keras"],
    "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "spark": ["spark", "pyspark", "apache spark"],
    "hadoop": ["hadoop"],
    "kafka": ["kafka", "apache kafka"],
    "airflow": ["airflow", "apache airflow"],
    "dbt": ["dbt"],
    "snowflake": ["snowflake"],
    "bigquery": ["bigquery"],
    # Tools & Platforms
    "git": ["git", "github", "gitlab", "bitbucket"],
    "jira": ["jira", "confluence"],
    "figma": ["figma"],
    "slack": ["slack"],
    "jira": ["jira"],
    "notion": ["notion"],
    "linear": ["linear"],
    "vercel": ["vercel"],
    "netlify": ["netlify"],
    "heroku": ["heroku"],
    "digitalocean": ["digitalocean", "digital ocean"],
    "cloudflare": ["cloudflare"],
    # Testing
    "jest": ["jest"],
    "cypress": ["cypress"],
    "playwright": ["playwright"],
    "selenium": ["selenium"],
    "pytest": ["pytest"],
    "junit": ["junit"],
    "mocha": ["mocha"],
    # Mobile
    "react native": ["react native"],
    "flutter": ["flutter"],
    "ios": ["ios", "xcode"],
    "android": ["android", "kotlin android"],
    # Methodologies
    "agile": ["agile"],
    "scrum": ["scrum"],
    "microservices": ["microservices", "microservices architecture"],
    "serverless": ["serverless", "lambda"],
    "tdd": ["tdd", "test-driven", "test driven"],
    "ddd": ["ddd", "domain-driven", "domain driven"],
}

JOB_TITLE_KEYWORDS = [
    "software engineer", "software developer",
    "backend engineer", "backend developer", "back-end engineer", "back-end developer",
    "frontend engineer", "frontend developer", "front-end engineer", "front-end developer",
    "fullstack engineer", "fullstack developer", "full-stack engineer", "full-stack developer",
    "full stack engineer", "full stack developer",
    "devops engineer", "devops developer",
    "site reliability engineer", "sre",
    "infrastructure engineer",
    "platform engineer",
    "data engineer",
    "machine learning engineer", "ml engineer",
    "ai engineer",
    "cloud engineer",
    "security engineer",
    "mobile engineer", "mobile developer",
    "ios engineer", "ios developer",
    "android engineer", "android developer",
    "qa engineer", "quality engineer", "test engineer",
    "systems engineer",
    "network engineer",
    "database engineer",
    "solutions engineer",
    "technical lead", "tech lead", "engineering lead",
    "staff engineer", "principal engineer", "distinguished engineer",
    "senior engineer", "senior developer",
    "junior engineer", "junior developer",
    "lead engineer", "lead developer",
    "architect",
    "consultant",
    "developer",
    "engineer",
]

EXPERIENCE_PATTERNS = [
    r"(\d+)\+?\s*(?:-\s*(\d+)\+?)?\s*years?\s*(?:of\s+)?(?:experience|exp)",
    r"(?:experience|exp)\s*[:=]\s*(\d+)\+?\s*(?:-\s*(\d+)\+?)?\s*years?",
    r"(\d+)\+?\s*years?\s*(?:in|with|of)\s*(?:software|engineering|development|programming|web|backend|frontend|fullstack)",
    r"(?:minimum|at\s*least|min)\s*(\d+)\+?\s*years?",
    r"(\d+)\+?\s*years?\s*(?:professional|relevant|work)",
]

EDUCATION_PATTERNS = [
    r"(?:bachelor(?:'s)?|b\.?s\.?|b\.?a\.?|b\.?eng\.?|b\.?tech\.?)\s*(?:degree)?\s*(?:of\s+)?(?:science|arts|engineering|technology|computer)?\s*(?:in\s+([\w\s]+))?",
    r"(?:master(?:'s)?|m\.?s\.?|m\.?a\.?|m\.?eng\.?|m\.?tech\.?|mba)\s*(?:degree)?\s*(?:of\s+)?(?:science|arts|engineering|technology|business|computer)?\s*(?:in\s+([\w\s]+))?",
    r"(?:ph\.?d|doctorate|doctoral|d\.?phil\.?)\s*(?:in\s+([\w\s]+))?",
    r"(?:associate(?:'s)?|a\.?s\.?|a\.?a\.?)\s*(?:degree)?\s*(?:in\s+([\w\s]+))?",
    r"(?:university|college|institute)\s+(?:of\s+)?([\w\s]+?)(?:\s*,|\s*\.|\s*$)",
]


def extract_skills(text: str) -> list[str]:
    """Extract technical skills from resume text with context awareness."""
    text_lower = text.lower()
    found = {}

    for skill_name, patterns in TECH_SKILLS.items():
        for pattern in patterns:
            if pattern in text_lower:
                found[skill_name] = pattern
                break

    priority_order = [
        "python", "javascript", "typescript", "java", "go", "rust", "ruby", "php", "swift", "kotlin",
        "react", "vue", "angular", "svelte", "next.js", "nuxt",
        "node.js", "express", "django", "flask", "fastapi", "spring", "rails",
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
        "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
        "graphql", "rest", "machine learning", "deep learning",
        "tensorflow", "pytorch", "kafka", "spark",
        "git", "ci/cd", "linux", "agile",
    ]

    result = []
    for skill in priority_order:
        if skill in found:
            result.append(skill)

    for skill in found:
        if skill not in result:
            result.append(skill)

    return result[:25]


def extract_job_titles(text: str) -> list[str]:
    """Extract job titles from resume text with better context."""
    text_lower = text.lower()
    titles = []

    for title in JOB_TITLE_KEYWORDS:
        if title in text_lower and title not in titles:
            titles.append(title)

    section_headers = [
        r"(?:experience|work\s+experience|employment|professional\s+experience|work\s+history)",
        r"(?:education|academic|qualification)",
        r"(?:summary|objective|profile|about)",
    ]

    for header_pattern in section_headers:
        match = re.search(header_pattern, text_lower)
        if match:
            section_text = text_lower[match.end():match.end() + 2000]
            for title in JOB_TITLE_KEYWORDS:
                if title in section_text and title not in titles:
                    titles.append(title)

    if not titles:
        lines = text.split("\n")
        for line in lines[:30]:
            line_lower = line.lower().strip()
            if any(kw in line_lower for kw in ["engineer", "developer", "architect", "lead", "manager"]):
                if len(line.strip()) < 80 and line.strip() not in titles:
                    titles.append(line.strip())

    seen = set()
    unique = []
    for t in titles:
        if t not in seen:
            seen.add(t)
            unique.append(t)

    return unique[:8]


def extract_experience_years(text: str) -> float | None:
    """Extract years of experience from resume text."""
    text_lower = text.lower()

    for pattern in EXPERIENCE_PATTERNS:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            groups = match.groups()
            if groups and groups[0]:
                years = float(groups[0])
                if 0 < years <= 50:
                    return years

    year_mentions = re.findall(r"(?:20[0-2]\d)\s*[-–]\s*(?:present|20[0-2]\d|current)", text_lower)
    if year_mentions:
        start_years = []
        for mention in year_mentions:
            start_match = re.search(r"(20[0-2]\d)", mention)
            if start_match:
                start_years.append(int(start_match.group(1)))
        if start_years:
            earliest = min(start_years)
            total_exp = 2025 - earliest
            if 0 < total_exp <= 50:
                return float(total_exp)

    return None


def extract_education(text: str) -> list[str]:
    """Extract education info from resume text."""
    found = []

    for pattern in EDUCATION_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            full_match = match.group(0).strip()
            if len(full_match) > 5:
                cleaned = re.sub(r'\s+', ' ', full_match).title()
                if cleaned not in found:
                    found.append(cleaned)

    if not found:
        education_keywords = [
            r"(?:bachelor|master|phd|doctorate|mba|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?)",
        ]
        for pattern in education_keywords:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                start = max(0, match.start() - 20)
                end = min(len(text), match.end() + 60)
                context = text[start:end].strip()
                cleaned = re.sub(r'\s+', ' ', context).title()
                if cleaned not in found and len(cleaned) > 10:
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

    Strict matching: requires meaningful skill overlap and title relevance.
    Returns (score, matched_skills).
    """
    resume_skills = set(s.lower() for s in resume.get("skills", []))
    job_skills = set(s.lower() for s in job.get("skills", []))
    job_title = (job.get("title") or "").lower()
    job_desc = (job.get("description") or "").lower()
    all_job_text = f"{job_title} {job_desc}"

    matched = []
    for skill in resume_skills:
        skill_lower = skill.lower()
        if skill_lower in job_skills:
            matched.append(skill)
        elif skill_lower in all_job_text:
            matched.append(skill)

    if not resume_skills or len(matched) == 0:
        return 0, []

    skill_ratio = len(matched) / len(resume_skills)

    if skill_ratio < 0.15:
        return 0, matched[:10]

    skill_score = skill_ratio * 50

    title_score = 0
    resume_titles = [t.lower() for t in resume.get("job_titles", [])]
    for title in resume_titles:
        words = [w for w in title.split() if len(w) > 3]
        matches = sum(1 for w in words if w in job_title)
        if matches >= 2:
            title_score = 25
            break
        elif matches == 1:
            title_score = 15
            break

    remote_bonus = 10 if job.get("remote") else 0

    exp_bonus = 0
    if resume.get("experience_years"):
        exp_years = int(resume["experience_years"])
        exp_patterns = [f"{exp_years} year", f"{exp_years}+ year", f"{exp_years-1}-{exp_years+1}"]
        if any(p in job_desc for p in exp_patterns):
            exp_bonus = 15

    total = min(100, int(skill_score + title_score + remote_bonus + exp_bonus))

    if total < 30:
        return 0, matched[:10]

    return total, matched[:10]
