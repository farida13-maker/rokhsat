export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="var(--color-card)" />
      <path
        d="M10 28V15.2c3.4 2.5 5.4 2.6 8.2-.3 2.8 2.9 4.8 2.8 8.2.3V28"
        fill="none"
        stroke="var(--color-cypress)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 22.2h16.4" stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
