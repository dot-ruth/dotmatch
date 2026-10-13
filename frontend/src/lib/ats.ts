export type AtsKey =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "workday"
  | "smartrecruiters"
  | "bamboohr"
  | "workable"
  | "jobvite"
  | "icims"
  | "taleo"
  | "linkedin"
  | "indeed";

export interface AtsInfo {
  key: AtsKey;
  label: string;
  host: string;
  fillable: boolean;
  hint: string;
}

interface AtsRule {
  key: AtsKey;
  label: string;
  fillable: boolean;
  suffixes?: string[];
  hosts?: string[];
}

const RULES: AtsRule[] = [
  {
    key: "greenhouse",
    label: "Greenhouse",
    fillable: true,
    suffixes: [".greenhouse.io"],
  },
  { key: "lever", label: "Lever", fillable: true, suffixes: [".lever.co"] },
  { key: "ashby", label: "Ashby", fillable: true, suffixes: [".ashbyhq.com"] },
  {
    key: "workday",
    label: "Workday",
    fillable: true,
    suffixes: [".myworkdayjobs.com", ".workday.com"],
  },
  {
    key: "smartrecruiters",
    label: "SmartRecruiters",
    fillable: true,
    suffixes: [".smartrecruiters.com"],
  },
  { key: "bamboohr", label: "BambooHR", fillable: true, suffixes: [".bamboohr.com"] },
  {
    key: "workable",
    label: "Workable",
    fillable: true,
    hosts: ["jobs.workable.com", "apply.workable.com"],
    suffixes: [".workable.com"],
  },
  { key: "jobvite", label: "Jobvite", fillable: false, suffixes: [".jobvite.com"] },
  { key: "icims", label: "iCIMS", fillable: false, suffixes: [".icims.com"] },
  { key: "taleo", label: "Taleo", fillable: false, suffixes: [".taleo.net"] },
  {
    key: "linkedin",
    label: "LinkedIn",
    fillable: false,
    hosts: ["www.linkedin.com", "linkedin.com"],
  },
  { key: "indeed", label: "Indeed", fillable: false, hosts: ["www.indeed.com", "indeed.com"] },
];

const FILLABLE_HINT =
  "The DotMatch extension can pre-fill this form from your profile — you review and submit.";
const MANUAL_HINT =
  "This form isn't supported by the autofill extension yet, so fill it manually.";

export function detectAts(url: string | null | undefined): AtsInfo | null {
  if (!url) return null;
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  for (const rule of RULES) {
    const hostHit = (rule.hosts || []).some((h) => hostname === h);
    const suffixHit = (rule.suffixes || []).some(
      (s) => hostname === s.slice(1) || hostname.endsWith(s),
    );
    if (hostHit || suffixHit) {
      return {
        key: rule.key,
        label: rule.label,
        host: hostname,
        fillable: rule.fillable,
        hint: rule.fillable ? FILLABLE_HINT : MANUAL_HINT,
      };
    }
  }
  return null;
}

export function isExtensionSupported(url: string | null | undefined): boolean {
  return detectAts(url)?.fillable ?? false;
}
