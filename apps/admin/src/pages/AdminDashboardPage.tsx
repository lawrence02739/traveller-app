import { DashboardLayout, StatCard } from '@skyitix/shared';

const navItems = [
  { label: 'Dashboard' },
  { label: 'Bookings' },
  { label: 'Schedule' },
  { label: 'Payments' },
  { label: 'Messages', badge: '8' },
  { label: 'Flight Tracking' },
  { label: 'Users' },
];

export const AdminDashboardPage = (): JSX.Element => {
  return (
    <DashboardLayout
      portalTitle="Skyitix Admin"
      navItems={navItems}
      activeLabel="Dashboard"
      userName="Mariam Septimus"
      userRole="Admin"
      pageTitle="Flight Booking Management Dashboard"
      pageSubtitle="Monitor performance, ticket sales and latest booking trends."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Completed Flights" value="125" trend="+12.8%" />
        <StatCard title="Active Users" value="80" trend="+6.4%" />
        <StatCard title="Canceled Flights" value="25" trend="-1.2%" />
        <StatCard title="Revenue" value="$15,000" trend="+9.2%" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-title)]">Ticket Sales</h3>
              <p className="text-sm text-[var(--color-body)]">12,500 this week</p>
            </div>
            <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-strong)]">This week</span>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3">
            {[65, 88, 76, 98, 70, 92, 83].map((value, index) => (
              <div key={value} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className={`w-full rounded-t-2xl ${index === 3 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-title)]/85'}`}
                  style={{ height: `${value}%` }}
                />
                <span className="text-xs text-[var(--color-subtle)]">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 shadow-soft">
          <h3 className="text-lg font-bold text-[var(--color-title)]">Popular Airlines</h3>
          <div className="mt-6 space-y-4">
            {[
              ['Skyitix Airlines', '35%'],
              ['FlyJet Airways', '30%'],
              ['AeroJet', '20%'],
              ['Nimbus & Co', '15%'],
            ].map(([name, percent]) => (
              <div key={name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-body)]">{name}</span>
                  <span className="font-semibold text-[var(--color-title)]">{percent}</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--color-panel-muted)]">
                  <div className="h-3 rounded-full bg-[var(--color-primary)]" style={{ width: percent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
