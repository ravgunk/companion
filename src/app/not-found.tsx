import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-base)]">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
          404
        </p>
        <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-[14px] text-[var(--text-tertiary)]">
          This route does not exist.
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 rounded-md border border-[var(--border-default)] px-4 py-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
      >
        Back to workspace
      </Link>
    </div>
  );
}
