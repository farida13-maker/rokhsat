const ITEMS = [
  { className: "bg-cypress-soft", label: "روز کاری" },
  { className: "bg-copper", label: "استحقاقی" },
  { className: "bg-ink", label: "استعلاجی" },
  { className: "border border-dashed border-copper bg-card", label: "بدون حقوق" },
  { className: "half-day", label: "نیم‌روز" },
  { className: "bg-sand", label: "تعطیل رسمی" },
  { className: "bg-weekend", label: "جمعه" },
];

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
      {ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={`size-4 rounded-md ${item.className}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
