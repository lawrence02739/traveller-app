interface StatCardProps {
  title: string;
  value: string;
  trend: string;
}

export const StatCard = ({ title, value, trend }: StatCardProps): JSX.Element => (
  <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 shadow-soft">
    <p className="text-sm text-[var(--color-subtle)]">{title}</p>
    <div className="mt-3 flex items-end justify-between gap-4">
      <h3 className="text-2xl font-bold text-[var(--color-title)]">{value}</h3>
      <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-strong)]">
        {trend}
      </span>
    </div>
  </div>
);
