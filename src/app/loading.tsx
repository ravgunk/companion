export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-base)]">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
