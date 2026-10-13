import DOMPurify from "dompurify";
import type { Job } from "./api";

const REQUIREMENT_HEADINGS = [
  "requirements",
  "requirement",
  "qualifications",
  "qualification",
  "must have",
  "must haves",
  "musthave",
  "what you will need",
  "what youll need",
  "what you need",
  "what were looking for",
  "what we are looking for",
  "who you are",
  "about you",
  "you will have",
  "youll have",
  "candidate requirements",
  "preferred qualifications",
  "preferred requirements",
  "nice to have",
  "nice to haves",
  "desired skills",
  "skills required",
  "skills requirements",
  "minimum qualifications",
  "key requirements",
  "job requirements",
  "role requirements",
  "experience required",
  "education",
  "profile",
];

const ABOUT_HEADINGS = [
  "about the role",
  "about the job",
  "about this role",
  "about this job",
  "about the company",
  "about us",
  "who we are",
  "the role",
  "the job",
  "job description",
  "role description",
  "description",
  "overview",
  "introduction",
  "responsibilities",
  "what you will do",
  "what youll do",
  "what youll be doing",
  "day to day",
  "day to day life",
  "the opportunity",
  "the offer",
  "benefits",
  "perks",
  "what we offer",
  "our offer",
  "compensation",
  "salary",
  "how to apply",
  "apply",
  "process",
  "our stack",
  "tech stack",
  "stack",
  "team",
  "culture",
];

const REQUIREMENT_CUES: RegExp[] = [
  /\b\d{1,2}\+?\s*(?:years|yrs)\b/i,
  /\bexperience\b/i,
  /\bexposure\b/i,
  /\bproficien/i,
  /\bfamiliar/i,
  /\bknowledge of\b/i,
  /\bunderstanding of\b/i,
  /\bdegree\b/i,
  /\bbachelor|\bmaster\b/i,
  /\bability to\b/i,
  /\bstrong (?:understanding|grasp|command)/i,
  /\bmust have\b/i,
  /\byou(?:'|’)ll (?:have|need|know|bring)\b/i,
  /\bexpertise\b/i,
  /\bcomfortable (?:with|working)\b/i,
  /\bhands[- ]on\b/i,
  /\bproven track record\b/i,
  /\bcertification/i,
  /\bfluen/i,
  /\bminimum of\b/i,
];

const BOILERPLATE_CUES =
  /equal opportunity|all qualified applicants|we look forward to hearing|apply now|click (?:here|the link)|send (?:us )?your|privacy policy|salary range for this|salary range|position type|sponsorship|annually|\bW2\b|our benefits|we offer (?:a |competitive)|diversity|disabled veterans|read (?:more|the full)|about the (?:company|employer)|learn more|job type|contract to (?:hire|perm)|base pay/i;

/** Paragraphs that open a new (non-requirement) block of a posting. */
const SECTION_CHANGE_CUES =
  /^(?:pay transparency|compensation|benefits?|perks?|total rewards?|about (?:us|the company|reddit)|who we are|why (?:us|join)|our (?:offer|story|values)|equal opportunity|how to apply|application process|the base salary|we offer|our benefits|what we offer|schedule|job type|employment type|location|remote|about this role|responsibilities)/i;

function normalizeHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_#]/g, "")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/:$/, "");
}

function classifyHeading(text: string): "requirements" | "about" | null {
  const norm = normalizeHeading(text);
  if (!norm) return null;
  if (REQUIREMENT_HEADINGS.includes(norm)) return "requirements";
  if (ABOUT_HEADINGS.includes(norm)) return "about";
  if (norm.startsWith("requirement") || norm.startsWith("qualification")) return "requirements";
  if (norm.startsWith("what youll") || norm.startsWith("what you will") || norm.startsWith("must")) {
    return norm.includes("do") ? "about" : "requirements";
  }
  if (norm.startsWith("benefit") || norm.startsWith("about ") || norm.startsWith("we offer")) return "about";
  return null;
}

export function plainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function splitSentences(text: string): string[] {
  const raw = text.match(/[^.!?]+[.!?]*/g) || [];
  return raw.map((s) => s.replace(/\s+/g, " ").trim()).filter((s) => s.length > 24);
}

/** Drops label-style lines ("Requirements:", "Position Type:") so summaries read as prose. */
function isHeadingLine(line: string): boolean {
  if (line.length > 64) return false;
  if (/[.!?]$/.test(line)) return false;
  return /:$/.test(line) || /^[A-Z0-9][A-Za-z0-9 &'/()|.,-]*$/.test(line);
}

function clamp(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function derivedRequirements(job: Job): string[] {
  const items: string[] = [];
  if (job.experience_level) items.push(`${job.experience_level} experience level`);
  if (job.employment_type) items.push(job.employment_type);
  if (job.skills && job.skills.length > 0) {
    items.push(`Stack: ${job.skills.slice(0, 8).join(", ")}`);
  }
  if (job.remote) {
    items.push(job.location ? `Remote — ${job.location}` : "Remote");
  } else if (job.location) {
    items.push(`Works from ${job.location}`);
  }
  if (job.salary_min && job.salary_max) {
    items.push(`Paid ${Math.round(job.salary_min / 1000)}k–${Math.round(job.salary_max / 1000)}k`);
  }
  return items;
}

/** Short requirement preview shown in list cards. Pure string work so it is SSR-safe. */
export function requirementsSummary(job: Job, maxChars = 190): string {
  const text = plainText(job.description);
  if (text) {
    const body = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !isHeadingLine(line))
      .join(" ");
    const sentences = splitSentences(body)
      .map((s) => s.replace(/^[^A-Za-z0-9"']+/, "").trim())
      .filter((s) => s.length > 24 && !BOILERPLATE_CUES.test(s));
    const required = sentences.filter((s) => REQUIREMENT_CUES.some((c) => c.test(s)));
    const picked = required.length > 0 ? required : sentences;
    if (picked.length > 0) {
      const trimmed = clamp(picked.slice(0, 2).join(" "), maxChars);
      if (trimmed) return trimmed;
    }
  }
  const derived = derivedRequirements(job);
  if (derived.length > 0) return clamp(derived.join(" · "), maxChars);
  return "";
}

export interface JobSections {
  about: string[];
  requirements: string[];
  requirementsFromPosting: boolean;
}

interface RawBlock {
  kind: "heading" | "text" | "bullet";
  value: string;
}

function collectBlocks(root: Node): RawBlock[] {
  const blocks: RawBlock[] = [];

  const pushText = (value: string) => {
    value
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .forEach((line) => blocks.push({ kind: "text", value: line }));
  };

  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        pushText(child.textContent || "");
        return;
      }
      if (child.nodeType !== 1) return;
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "noscript" || tag === "svg") return;
      if (/^h[1-6]$/.test(tag)) {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (text) blocks.push({ kind: "heading", value: text });
        return;
      }
      if (tag === "li") {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (text) blocks.push({ kind: "bullet", value: text });
        return;
      }
      if (tag === "p" || tag === "blockquote" || tag === "pre") {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (text) pushText(text);
        return;
      }
      if (tag === "br") return;
      walk(el);
    });
  };

  walk(root);
  return blocks;
}

function parseHtmlBlocks(raw: string): RawBlock[] {
  if (typeof DOMParser === "undefined") return [{ kind: "text", value: plainText(raw) }];
  const doc = new DOMParser().parseFromString(raw, "text/html");
  return collectBlocks(doc.body);
}

function parseTextBlocks(raw: string): RawBlock[] {
  const blocks: RawBlock[] = [];
  raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .forEach((line) => {
      const looksLikeHeading =
        (line.length <= 60 && /[:：]$/.test(line)) || (line.length <= 48 && /^[A-Z][A-Za-z0-9 &'/-]+$/.test(line));
      if (looksLikeHeading && normalizeHeading(line.replace(/[:：]$/, "")).length > 2) {
        blocks.push({ kind: "heading", value: line.replace(/[:：]$/, "") });
      } else {
        blocks.push({ kind: "text", value: line });
      }
    });
  return blocks;
}

function sanitizeBlock(html: string): string {
  try {
    return DOMPurify.sanitize(html);
  } catch {
    return plainText(html);
  }
}

/**
 * Splits a posting into "what the job is about" and "what it requires".
 * Only call this in the browser: it uses DOMParser.
 */
export function parseJobSections(job: Job): JobSections {
  const raw = (job.description || "").trim();
  if (!raw) return { about: [], requirements: [], requirementsFromPosting: false };

  const blocks = /<[a-z][^>]*>/i.test(raw) ? parseHtmlBlocks(raw) : parseTextBlocks(raw);

  let mode: "about" | "requirements" = "about";
  let sawRequirementHeading = false;
  const about: string[] = [];
  const requirements: string[] = [];
  const seen = new Set<string>();

  const add = (target: "about" | "requirements", value: string, isBullet: boolean) => {
    const key = value.toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    if (target === "requirements") requirements.push(value);
    else if (isBullet) about.push(sanitizeBlock(`<p>• ${value}</p>`));
    else about.push(sanitizeBlock(value));
  };

  for (const block of blocks) {
    if (block.kind === "heading") {
      const cls = classifyHeading(block.value);
      if (cls === "requirements") {
        mode = "requirements";
        sawRequirementHeading = true;
      } else if (cls === "about") {
        mode = "about";
      } else {
        mode = "about";
      }
      continue;
    }
    if (
      mode === "requirements" &&
      ((block.kind === "text" && block.value.length > 260) ||
        SECTION_CHANGE_CUES.test(block.value.slice(0, 60)))
    ) {
      mode = "about";
    }
    if (mode === "requirements") {
      add("requirements", block.value, block.kind === "bullet");
    } else {
      add("about", block.value, block.kind === "bullet");
    }
  }

  if (requirements.length === 0 && !sawRequirementHeading) {
    const text = plainText(raw);
    splitSentences(text)
      .filter((s) => REQUIREMENT_CUES.some((c) => c.test(s)))
      .filter((s) => !BOILERPLATE_CUES.test(s))
      .slice(0, 6)
      .forEach((s) => requirements.push(s));
  }

  if (about.length === 0) {
    about.push(sanitizeBlock(raw));
  }

  return {
    about: about.slice(0, 40),
    requirements: requirements.slice(0, 14),
    requirementsFromPosting: sawRequirementHeading,
  };
}
