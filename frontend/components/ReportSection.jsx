export default function ReportSection({
  title,
  subtitle,
  icon,
  colorClass = "text-verde-italia",
  borderClass = "border-verde-italia",
  children,
  badge,
}) {
  return (
    <section className="card animate-fade-in-up">
      {/* Section header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${colorClass} bg-current/10`}
              style={{ background: "currentColor" }}
            >
              <span className="text-white">{icon}</span>
            </div>
          )}
          <div>
            <h2 className={`text-lg font-bold ${colorClass}`}>{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="shrink-0 text-sm font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Colored top border accent */}
      <div
        className={`h-0.5 w-12 rounded-full mb-5 ${borderClass}`}
        style={{ background: "currentColor" }}
      />

      {/* Content */}
      <div>{children}</div>
    </section>
  );
}
