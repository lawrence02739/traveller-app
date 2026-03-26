import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@skyitix/shared';

export const CustomerLoginPage = (): JSX.Element => {
  const navigate = useNavigate();

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-soft lg:grid-cols-[0.9fr,1.1fr]">
        <section className="flex items-center p-6 md:p-10">
          <form onSubmit={onSubmit} className="mx-auto w-full max-w-md rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 shadow-soft md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-primary-strong)]">Customer Login</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-title)]">Start your next trip</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">Responsive customer portal with shared components and switchable themes.</p>

            <div className="mt-8 space-y-5">
              <FormField kind="input" label="Email Address" type="email" placeholder="traveler@email.com" />
              <FormField kind="input" label="Password" type="password" placeholder="Enter password" />
              <FormField kind="select" label="Preferred Airport" defaultValue="DXB" options={[{ label: 'Dubai (DXB)', value: 'DXB' }, { label: 'London (LHR)', value: 'LHR' }, { label: 'Singapore (SIN)', value: 'SIN' }]} />
            </div>

            <button type="submit" className="mt-8 w-full rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-[var(--color-on-primary)] transition hover:opacity-95">
              Sign in to customer portal
            </button>
          </form>
        </section>

        <section className="bg-[var(--color-panel-muted)] p-6 md:p-10 lg:p-14">
          <div className="rounded-[2rem] bg-[var(--color-panel-bg)] p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary-strong)]">Skyitix</p>
                <h1 className="mt-2 text-4xl font-bold text-[var(--color-title)]">Customer portal made for mobile first booking flow.</h1>
              </div>
              <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--color-primary)]" />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Shared static header, sidebar and footer',
                'Theme switch between gold, wine and blue',
                'Strict TypeScript structure',
                'No extra input UI package used',
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-[var(--color-border)] p-4 text-sm text-[var(--color-body)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
