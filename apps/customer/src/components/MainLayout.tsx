import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, LogOut, ChevronDown, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../features/authSlice';
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
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>('gold');
  const selectedTheme = useMemo(() => themes[themeName], [themeName]);
  useEffect(() => {
    applyTheme(themes[themeName]);
  }, [themeName]);

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] flex flex-col font-sans">
      <header style={{ backgroundColor: selectedTheme.primarySoft }} className="h-16 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel-bg)]/95 px-4 sm:px-6 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
            <Plane className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-[var(--color-title)]">traveller app</span>
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
          <div className="hidden sm:block rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-sm font-bold text-[var(--color-on-primary)] shadow-sm">
            My Balance: ₹450700 ↻
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] font-black text-xs shadow-sm">
                {(user?.firstName?.[0] || user?.name?.[0] || 'U').toUpperCase()}
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-[1000]"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-black text-[var(--color-title)] truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-black text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all">
                      <User className="h-4 w-4" /> Account Profile
                    </button>
                    <button
                      onClick={() => {
                        dispatch(logout());
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-black text-red-500 hover:bg-red-50 transition-all mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full m-0">
        {children}
      </main>

      <footer style={{ backgroundColor: selectedTheme.primarySoft }} className="sticky h-8 bottom-0 z-50 text-center py-2 text-xs font-medium text-[var(--color-subtle)] border-t border-[var(--color-border)]">
        <p className='text-center'>@footer</p>
      </footer>
    </div>
  );
};
