"""Deterministic cover-letter drafts built from the stored resume + a job posting.

No LLM involved: the draft stitches the applicant's real skills and experience onto
the requirements pulled from the posting, so it stays factual and fast.
"""

from services.resume_service import calculate_match_score

MAX_REQUIREMENTS = 2
MAX_SKILLS = 4


def _first_sentence(text: str, limit: int = 140) -> str:
    cleaned = " ".join((text or "").split())
    if not cleaned:
        return ""
    for sep in (". ", "! ", "? "):
        idx = cleaned.find(sep)
        if idx > 30:
            cleaned = cleaned[: idx + 1]
            break
    if len(cleaned) > limit:
        cleaned = cleaned[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"
    return cleaned.strip()


def _short_requirement(item: str) -> str:
    return _first_sentence(item, 120)


def _lower_first(text: str) -> str:
    return text[:1].lower() + text[1:] if text else text


def _experience_phrase(resume: dict) -> str:
    years = resume.get("experience_years")
    titles = resume.get("job_titles") or []
    title = titles[0] if titles else None
    if years and title:
        return f"about {years:g} years as a {title}"
    if years:
        return f"about {years:g} years in software"
    if title:
        return f"as a {title}"
    return "as a software engineer"


def build_cover_letter(
    job: dict,
    resume: dict,
    name: str | None = None,
    requirements: list[str] | None = None,
) -> tuple[str, list[str]]:
    """Return (draft_text, matched_skills) for a job/resume pair."""
    company = ((job.get("company") or {}).get("name") or "your team").strip()
    title = (job.get("title") or "the open role").strip()

    score, matched = calculate_match_score(job, resume)
    skills_pool = matched or resume.get("skills") or job.get("skills") or []
    skills = [s for s in skills_pool if s][:MAX_SKILLS]
    skills_phrase = ", ".join(skills[:-1]) + f" and {skills[-1]}" if len(skills) > 1 else (skills[0] if skills else "")

    reqs = [_short_requirement(r) for r in (requirements or []) if r and r.strip()]
    reqs = [r for r in reqs if r][:MAX_REQUIREMENTS]

    lines: list[str] = []
    lines.append(f"Hi {company} team,")
    lines.append("")
    lines.append(
        f"I'd like to apply for the {title} role. I've been working {_experience_phrase(resume)}"
        + (f", with hands-on experience in {skills_phrase}." if skills_phrase else ".")
    )

    if reqs:
        joined = reqs[0] if len(reqs) == 1 else f"{reqs[0]} and {_lower_first(reqs[1])}"
        lines.append(f"Reading your requirements, the fit I'd point to is {joined}.")

    if matched and skills:
        lines.append(
            f"Of the skills you listed, I already work with {', '.join(matched[:MAX_SKILLS])}"
            + (f" ({score}% match against my resume)." if score else ".")
        )
    elif skills_phrase:
        lines.append(f"Day to day that means {skills_phrase} — the stack I'm most fluent in.")

    lines.append("I'd welcome the chance to talk about how I can contribute to the team. Thanks for your time.")
    lines.append("")
    lines.append("Best,")
    lines.append((name or "").strip() or "—")

    return "\n".join(line for line in lines if line is not None), list(matched or [])
