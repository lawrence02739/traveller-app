import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout, StatCard, applyTheme, themes, type ThemeName } from '@skyitix/shared';

const navItems = [
  { label: 'Dashboard' },
  { label: 'My Trips' },
  { label: 'Explore' },
  { label: 'Payments' },
  { label: 'Support', badge: '2' },
];

const themeOptions: Array<{ label: string; value: ThemeName }> = [
  { label: 'Gold', value: 'gold' },
  { label: 'Wine Red', value: 'wine' },
  { label: 'Blue', value: 'blue' },
  { label: 'Purple', value: 'purple' },
  { label: 'Green', value: 'green' },
  { label: 'Grey', value: 'grey' },
  { label: 'Black', value: 'black' },
];

export const CustomerDashboardPage = (): JSX.Element => {
  const [themeName, setThemeName] = useState<ThemeName>('gold');

  useEffect(() => {
    applyTheme(themes[themeName]);
  }, [themeName]);

  const selectedTheme = useMemo(() => themes[themeName], [themeName]);

  return (
    <DashboardLayout
      portalTitle="Skyitix Customer"
      navItems={navItems}
      activeLabel="Dashboard"
      userName="Olivia Martin"
      userRole="Customer"
      pageTitle="Your travel dashboard"
      pageSubtitle="Track upcoming trips, rewards and offers with switchable customer themes."
      headerActions={
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-2">
          {themeOptions.map((option) => {
            const isActive = option.value === themeName;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setThemeName(option.value)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${isActive ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'text-[var(--color-body)]'
                  }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Upcoming Trips" value="03" trend="Next 30 days" />
        <StatCard title="Reward Points" value="8,450" trend="+420" />
        <StatCard title="Saved Cards" value="02" trend="Secure" />
        <StatCard title="Special Offers" value="12" trend="Live now" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr,1fr]">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-title)]">Upcoming Journey</h3>
              <p className="mt-1 text-sm text-[var(--color-body)]">Dubai → Singapore • 18 Sep 2025</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: selectedTheme.primarySoft, color: selectedTheme.primaryStrong }}>
              Confirmed
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['Departure', '08:45 AM'],
              ['Arrival', '04:30 PM'],
              ['Seat', '14A Window'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[var(--color-panel-muted)] p-4">
                <p className="text-xs text-[var(--color-subtle)]">{label}</p>
                <p className="mt-2 font-semibold text-[var(--color-title)]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 shadow-soft">
          <h3 className="text-lg font-bold text-[var(--color-title)]">Theme Preview</h3>
          <div className="mt-6 rounded-[2rem] border border-[var(--color-border)] p-5" style={{ backgroundColor: selectedTheme.pageBg }}>
            <div className="rounded-[1.5rem] p-5" style={{ backgroundColor: selectedTheme.panelBg }}>
              <div className="h-24 rounded-[1.5rem]" style={{ backgroundColor: selectedTheme.primary }} />
              <p className="mt-4 text-sm font-semibold" style={{ color: selectedTheme.title }}>
                Active theme: {selectedTheme.name}
              </p>
              <p className="mt-2 text-sm" style={{ color: selectedTheme.body }}>
                Change to wine red or blue without touching shared static structure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
