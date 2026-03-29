import { Plane, Building, Train, Car, Bus, Umbrella } from 'lucide-react';
import { MainLayout } from '../components/MainLayout';
import { SearchForm } from '../components/SearchForm';

const NAV_SERVICES = [
  { icon: Plane, label: 'Flight', active: true },
  { icon: Building, label: 'Hotel', active: false },
  { icon: Train, label: 'Train', active: false },
  { icon: Car, label: 'Cabs', active: false },
  { icon: Bus, label: 'Bus', active: false },
  { icon: Umbrella, label: 'Holiday', active: false },
];

export const FlightSearchPage = () => {
  return (
    <MainLayout>
      {/* Primary Colored Background Area w/ seamless generic connection */}
      <div className="relative h-[270px] w-full bg-[var(--color-primary)] transition-colors duration-300">
        <div className="mx-auto flex max-w-lg justify-center gap-1 pt-8 px-4">
          <div className="flex flex-wrap sm:flex-nowrap items-center rounded-lg bg-black/10 p-1 backdrop-blur-sm overflow-x-auto w-full sm:w-auto">
            {NAV_SERVICES.map((srv) => (
              <button
                key={srv.label}
                className={`flex flex-col flex-1 sm:flex-none items-center justify-center gap-1 rounded-md px-2 sm:px-4 py-2 transition-all min-w-[60px] ${srv.active ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] shadow-sm' : 'text-white/90 hover:bg-white/10'
                  }`}
              >
                <srv.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{srv.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-[140px] max-w-6xl px-4 relative z-10 pb-20 fade-in zoom-in">
        <SearchForm />
      </div>
    </MainLayout>
  );
};
