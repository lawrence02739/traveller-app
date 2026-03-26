import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@skyitix/shared';

export const AdminLoginPage = (): JSX.Element => {
  const navigate = useNavigate();

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-soft lg:grid-cols-[1.15fr,0.85fr]">
        <section className="bg-[var(--color-panel-muted)] p-6 md:p-10 lg:p-14">
          <div className="inline-flex items-center gap-3 rounded-full bg-[var(--color-panel-bg)] px-4 py-2">
            <div className="h-10 w-10 rounded-2xl bg-[var(--color-primary)]" />
            <div>
              <p className="font-bold text-[var(--color-title)]">Skyitix</p>
              <p className="text-xs text-[var(--color-subtle)]">Admin Management Portal</p>
            </div>
          </div>

          <div className="mt-10 max-w-xl">
            <p className="inline-flex rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-strong)]">
              Yellow inspired static theme
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-[var(--color-title)] md:text-5xl">
              Manage bookings, flights and portal operations in one place.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[var(--color-body)]">
              Type-safe React Vite workspace with shared components, static header and sidebar design, Tailwind CSS and mobile responsive layout.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['125', 'Bookings'],
                ['80', 'Active users'],
                ['$15k', 'Revenue'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5">
                  <p className="text-2xl font-bold text-[var(--color-title)]">{value}</p>
                  <p className="mt-2 text-sm text-[var(--color-subtle)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 md:p-10">
          <form onSubmit={onSubmit} className="mx-auto w-full max-w-md rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 shadow-soft md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-primary-strong)]">Admin Login</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-title)]">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">Use your official account to access analytics, booking controls and operational dashboards.</p>

            <div className="mt-8 space-y-5">
              <FormField kind="input" label="Work Email" type="email" placeholder="admin@skyitix.com" />
              <FormField kind="input" label="Password" type="password" placeholder="Enter secure password" />
              <FormField kind="input" label="Login Date" type="date" />
            </div>

            <button type="submit" className="mt-8 w-full rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-[var(--color-on-primary)] transition hover:opacity-95">
              Sign in to admin dashboard
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
