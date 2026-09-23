import LegalPage, { LegalSection } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Last updated · 2026" title="Privacy Policy">
      <LegalSection title="No accounts, no tracking">
        DotMatch has no sign-ups and runs no analytics or advertising trackers.
        Browsing and searching the job board does not identify you in any way.
      </LegalSection>
      <LegalSection title="Resumes you upload">
        If you upload a resume, its text is held in the server&apos;s memory only, for the
        sole purpose of extracting skills and scoring job matches. It is never sold,
        shared with third parties, or used for anything else. Restarting the server
        wipes it.
      </LegalSection>
      <LegalSection title="Third-party links">
        Apply links take you to external employer and job-board sites, which have their
        own privacy policies. We are not responsible for their practices.
      </LegalSection>
    </LegalPage>
  );
}

