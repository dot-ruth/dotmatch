export interface JobSourceInfo {
  name: string;
  type: string;
}

/** Single source of truth for aggregated job boards (names + API types). */
export const JOB_SOURCES: JobSourceInfo[] = [
  { name: "RemoteOK", type: "remoteok" },
  { name: "We Work Remotely", type: "weworkremotely" },
  { name: "Remotive", type: "remotive" },
  { name: "Arbeitnow", type: "arbeitnow" },
  { name: "Jobicy", type: "jobicy" },
  { name: "Findwork", type: "findwork" },
  { name: "DevJobsScanner", type: "devjobsscanner" },
  { name: "Himalayas", type: "himalayas" },
  { name: "FreeHire", type: "freehire" },
  { name: "RemoteJobs.org", type: "remotejobs_org" },
  { name: "JobsBase", type: "jobsbase" },
  { name: "Lever", type: "lever" },
  { name: "Ashby", type: "ashby" },
  { name: "Torre", type: "torre" },
  { name: "HN Hiring", type: "hn_hiring" },
];

export const SOURCE_NAMES: string[] = JOB_SOURCES.map((s) => s.name);
