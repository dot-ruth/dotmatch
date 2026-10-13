# DotMatch Apply Assistant (Chrome extension)

Semi-automatic form filling for job applications. It pre-fills the boring fields from
your DotMatch profile so you can concentrate on the questions that actually matter —
and it **never submits an application for you**.

## Install (unpacked)

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Pin "DotMatch Apply Assistant" to your toolbar.

## Set it up

1. Start your DotMatch backend, e.g. from `backend/`:

   ```powershell
   python3 -m uvicorn main:app --port 8001
   ```

2. Click the extension icon and fill in:
   - **API base URL** — defaults to `http://localhost:8001`.
   - **Name, email, phone, city** — used for personal-information fields.
   - **LinkedIn / GitHub / portfolio URLs** — used for link fields.
3. Press **Check resume connection**. It should report your uploaded resume's skill
   count (upload one on the dashboard's *Resume* page if not).
4. Press **Save**.

## Use it

1. Open a job application on a supported site.
2. Click the green **DotMatch · fill form** button in the bottom-right corner.
3. Review every field, rewrite the cover letter draft in your own voice, then submit
   the form yourself.

Supported for filling: Greenhouse, Lever, Ashby, Workday, SmartRecruiters, BambooHR,
Workable.

## What it talks to

- `GET  {apiBase}/api/jobs/resume/profile` — your skills and experience, for the
  cover-letter draft.
- `POST {apiBase}/api/jobs/cover-letter` — drafts a letter from your resume plus the
  posting's requirements (looked up by the application page URL).

The API base URL is the only network destination besides the job sites themselves.
Your settings live in `chrome.storage.local` — on this device only, never synced to your browser profile or Google.

## Limits (by design)

- Fields it can't confidently match are left empty — that's intentional.
- CAPTCHAs, multi-step forms, and custom questions are left to you.
- Automating submissions would violate the ATS terms of service; this extension only
  fills what you could type yourself.
