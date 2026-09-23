import LegalPage, { LegalSection } from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Last updated · 2026" title="Terms of Use">
      <LegalSection title="What DotMatch is">
        DotMatch aggregates publicly listed remote software engineering jobs from third-party
        job boards and links you to the original posting. We do not employ you, place you,
        or guarantee any listing&apos;s accuracy — always confirm details with the employer.
      </LegalSection>
      <LegalSection title="Acceptable use">
        Use the service for personal job searching only. Do not scrape it aggressively,
        misrepresent listings, or upload files that are not your own resume.
      </LegalSection>
      <LegalSection title="Resumes">
        Uploaded resumes are processed in memory to extract skills and score matches.
        Do not upload anyone else&apos;s personal data.
      </LegalSection>
      <LegalSection title="No warranties">
        The service is provided as-is, without warranties of any kind. To the extent
        permitted by law, we are not liable for decisions you make based on listings shown here.
      </LegalSection>
    </LegalPage>
  );
}


