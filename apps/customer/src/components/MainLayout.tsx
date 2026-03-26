import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { applyTheme, themes, ThemeName } from '@skyitix/shared';

interface MainLayoutProps {
  children: ReactNode;
}

const themeOptions: Array<{ label: string; value: ThemeName }> = [
  { label: 'Gold', value: 'gold' },
  { label: 'Wine', value: 'wine' },
  { label: 'Blue', value: 'blue' },
  { label: 'Purple', value: 'purple' },
  { label: 'Green', value: 'green' },
  { label: 'Grey', value: 'grey' },
  { label: 'Black', value: 'black' },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const [themeName, setThemeName] = useState<ThemeName>('gold');
  const selectedTheme = useMemo(() => themes[themeName], [themeName]);
  useEffect(() => {
    applyTheme(themes[themeName]);
  }, [themeName]);

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] flex flex-col font-sans">
      <header style={{ backgroundColor: selectedTheme.primarySoft }} className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel-bg)]/95 px-4 sm:px-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <Plane className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-[var(--color-title)]">Skyitix Book</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-[var(--color-title)] hover:text-[var(--color-primary)]">Dashboard</button>
          <button onClick={() => navigate('/search')} className="text-sm font-semibold text-[var(--color-title)] hover:text-[var(--color-primary)]">Book Flight</button>
        </nav>

        <div className="flex items-center gap-4">
          <select
            value={themeName}
            onChange={(e) => setThemeName(e.target.value as ThemeName)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-1.5 text-xs font-bold text-[var(--color-title)] cursor-pointer outline-none"
          >
            {themeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label} Theme</option>
            ))}
          </select>
          <div className="hidden sm:block rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-sm font-bold text-white shadow-sm">
            My Balance: ₹450700 ↻
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0"></div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-panel-muted)] py-6 text-center text-sm text-[var(--color-subtle)]">
        <p>© 2026 Skyitix Customer Portal. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="#" className="hover:text-[var(--color-title)]">Terms</a>
          <a href="#" className="hover:text-[var(--color-title)]">Privacy</a>
          <a href="#" className="hover:text-[var(--color-title)]">Contact</a>
        </div>
      </footer>
    </div>
  );
};
