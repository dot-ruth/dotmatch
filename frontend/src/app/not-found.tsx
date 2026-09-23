import Link from "next/link";
import Logo from "@/components/Logo";
import { GROTESK } from "@/lib/fonts";

export default function NotFound() {
  return (
    <div id="main" className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark rounded-xl p-10 text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-forest dark:text-forest-muted font-bold mb-3">
          404 · Off the map
        </p>
        <h1
          style={{ fontFamily: GROTESK }}
          className="font-bold tracking-tight text-4xl mb-3 text-balance"
        >
          This trail went cold
        </h1>
        <p className="text-sm text-muted dark:text-muted-dark mb-8">
          The page you asked for is not here. The jobs are still where you left them.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            style={{ fontFamily: GROTESK }}
            className="bg-forest dark:bg-forest-muted text-white font-bold text-sm px-7 py-3 rounded-lg active:translate-y-px transition-all duration-200"
          >
            Browse Jobs
          </Link>
          <Link
            href="/"
            className="border border-border dark:border-border-dark font-bold text-sm px-7 py-3 rounded-lg active:translate-y-px transition-all duration-200"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

