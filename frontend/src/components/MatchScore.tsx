"use client";

interface MatchScoreProps {
  score: number;
}

/** Single threshold scale for match scores (ring + text classes). */
export function scoreClasses(score: number) {
  if (score >= 80) return { ring: "stroke-emerald-500 dark:stroke-emerald-400", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 50) return { ring: "stroke-amber-500 dark:stroke-amber-400", text: "text-amber-600 dark:text-amber-400" };
  return { ring: "stroke-red-500 dark:stroke-red-400", text: "text-red-600 dark:text-red-400" };
}

export default function MatchScore({ score }: MatchScoreProps) {
  const colors = scoreClasses(score);
  const size = 40;
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-surface-deep dark:text-surface-dark-deep"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colors.ring} transition-all duration-500`}
        />
      </svg>
      <span className={`absolute font-mono font-medium text-[10px] ${colors.text}`}>
        {score}
      </span>
    </div>
  );
}
