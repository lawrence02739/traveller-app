import type { DashboardLayoutProps } from './types';

export const DashboardLayout = ({
  portalTitle,
  navItems,
  activeLabel,
  userName,
  userRole,
  pageTitle,
  pageSubtitle,
  headerActions,
  children,
}: DashboardLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] p-3 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl grid-cols-1 gap-4 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel-muted)] p-3 shadow-soft md:grid-cols-[260px,1fr] md:p-4">
        <aside className="rounded-[1.5rem] bg-[var(--color-panel-bg)] p-5">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-bold text-[var(--color-on-primary)]">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-title)]">{portalTitle}</h1>
              <p className="text-xs text-[var(--color-subtle)]">React TS Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.label === activeLabel;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]'
                      : 'text-[var(--color-body)] hover:bg-[var(--color-panel-muted)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-[var(--color-panel-muted)] px-2 py-0.5 text-xs">{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl bg-[var(--color-primary-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--color-title)]">Static shared sidebar</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-body)]">
              Shared component for admin and customer. Mobile friendly and easy to extend.
            </p>
          </div>
        </aside>

        <main className="rounded-[1.5rem] bg-[var(--color-panel-bg)] p-4 md:p-6">
          <header className="mb-6 flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-subtle)]">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--color-title)]">{pageTitle}</h2>
              <p className="mt-2 text-sm text-[var(--color-body)]">{pageSubtitle}</p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {headerActions}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--color-title)]">{userName}</p>
                <p className="text-xs text-[var(--color-subtle)]">{userRole}</p>
              </div>
            </div>
          </header>

          <section>{children}</section>

          <footer className="mt-8 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-subtle)]">
            Shared static footer • Skyitix yellow-inspired dashboard shell.
          </footer>
        </main>
      </div>
    </div>
  );
};
