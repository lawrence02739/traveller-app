import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setFilters } from '../features/flightSlice';
import { ArrowRightLeft, X, Search, Calendar as CalendarIcon } from 'lucide-react';

const AIRPORTS = [
  { "id": 332, "code": "BAK", "cityCode": "BAK", "city": "Baku", "countryCode": "AZ", "country": "Azerbaijan", "name": null },
  { "id": 3040, "code": "TMS", "cityCode": "TMS", "city": "Sao Tome Is", "countryCode": "ST", "country": "Sao Tome and Principe", "name": null },
  { "id": 1828, "code": "BKB", "cityCode": "BKB", "city": "Bikaner", "countryCode": "IN", "country": "India", "name": null },
  { "id": 4146, "code": "PVF", "cityCode": "PVF", "city": "Placerville", "countryCode": "US", "country": "United States", "name": null },
  { "id": 1369, "code": "SEW", "cityCode": "SEW", "city": "Siwa", "countryCode": "EG", "country": "Egypt", "name": null },
  { "id": 4742, "code": "HPY", "cityCode": "HPY", "city": "Baytown", "countryCode": "US", "country": "United States", "name": null },
  { "id": 985, "code": "PUX", "cityCode": "PUX", "city": "Puerto Varas", "countryCode": "CL", "country": "Chile", "name": null },
  { "id": 466, "code": "PPB", "cityCode": "PPB", "city": "Presidente Prudente", "countryCode": "BR", "country": "Brazil", "name": "A De Barros" },
  { "id": 1681, "code": "AAH", "cityCode": "AAH", "city": "Aachen", "countryCode": "DE", "country": "Germany", "name": "Aachen Merzbruck Arpt" },
  { "id": 1320, "code": "AAL", "cityCode": "AAL", "city": "Aalborg", "countryCode": "DK", "country": "Denmark", "name": "Aalborg Arpt" }
];

const PREFERRED_AIRLINES = [
  { code: "9F", name: "9F Air" },
  { code: "I8", name: "Aboriginal Air Services" },
  { code: "9B", name: "AccessRail" },
  { code: "WZ", name: "Acvila Air" },
  { code: "KI", name: "Adam Air" },
  { code: "Z7", name: "ADC Airlines" },
  { code: "JP", name: "Adria Airways" },
  { code: "DF", name: "Aebal" },
  { code: "A3", name: "Aegean Air" }
];

// --- Custom Interactive Components --- //

const CustomAirportDropdown = ({ value, onChange, label, alignRight = false }: { value: typeof AIRPORTS[0]; onChange: (val: typeof AIRPORTS[0]) => void; label: string; alignRight?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = AIRPORTS.filter(a => a.city.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`relative flex-1 p-3 hover:bg-[var(--color-panel-muted)] transition-all cursor-pointer ${open ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-panel-muted)] z-50 rounded' : ''}`} ref={ref}>
      <div onClick={() => { setOpen(true); setSearch(''); }} className="w-full h-full">
        <span className="text-xs text-[var(--color-subtle)] block mb-1">{label} <span className="float-right text-[var(--color-primary)]">▼</span></span>
        <span className="text-sm sm:text-lg font-bold text-[var(--color-title)] block truncate">{value.city}</span>
        <span className="text-xs text-[var(--color-subtle)] truncate block mt-1">{value.code}, {value.name || `${value.city} Arpt`}, {value.countryCode}</span>
      </div>
      {open && (
        <div className={`absolute top-[110%] ${alignRight ? 'right-0' : 'left-0'} w-[280px] sm:w-[320px] z-[110] bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
          <div className="p-3 border-b border-[var(--color-border)] relative">
            <Search className="h-4 w-4 text-[var(--color-subtle)] absolute left-6 top-1/2 -mt-2" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Airport or City"
              className="w-full bg-[var(--color-page-bg)] border border-[var(--color-border)] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-title)]"
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto pattern-list">
            {filtered.map(airport => (
              <div
                key={airport.id}
                onClick={() => { onChange(airport); setOpen(false); }}
                className="flex justify-between items-center px-4 py-3 hover:bg-[var(--color-primary-soft)] border-b last:border-0 border-[var(--color-border)]/50 cursor-pointer group transition-colors"
              >
                <div className="flex-1 overflow-hidden pr-2">
                  <p className="text-sm font-bold text-[var(--color-title)] group-hover:text-[var(--color-primary-strong)] flex items-center gap-2 truncate">
                    {airport.city}, {airport.country}
                  </p>
                  <p className="text-xs text-[var(--color-subtle)] mt-0.5 truncate">{airport.name || `${airport.city} Arpt`}</p>
                </div>
                <span className="text-sm font-bold text-[var(--color-subtle)] group-hover:text-[var(--color-primary)]">{airport.code}</span>
              </div>
            ))}
            {filtered.length === 0 && <div className="p-4 text-center text-[var(--color-subtle)] text-sm">No airports found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomDatePicker = ({ value, onChange, label, alignRight = false }: { value: string; onChange: (date: string) => void; label: string; alignRight?: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDate = value ? new Date(value) : new Date();
  if (!value) currentDate.setFullYear(2026, 2, 25);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className={`relative flex-1 p-3 hover:bg-[var(--color-panel-muted)] transition-all cursor-pointer ${open ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-panel-muted)] z-50 rounded' : ''}`} ref={ref}>
      <div onClick={() => setOpen(!open)} className="w-full h-full flex flex-col justify-center">
        <span className="text-xs text-[var(--color-subtle)] block mb-1">{label} <span className="float-right text-[var(--color-primary)] hidden sm:inline">▼</span></span>
        <div className="flex items-center justify-between">
          <span className={`text-sm sm:text-lg font-bold block truncate ${!value && 'text-[var(--color-subtle)]'}`}>
            {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Date'}
          </span>
          <CalendarIcon className="h-4 w-4 text-[var(--color-subtle)]" />
        </div>
        <span className="text-xs text-[var(--color-subtle)] mt-1 block">
          {value ? new Date(value).toLocaleDateString('en-GB', { weekday: 'long' }) : '---'}
        </span>
      </div>

      {open && (
        <div className={`absolute top-[110%] ${alignRight ? 'right-0' : 'left-0'} z-[110] w-[260px] sm:w-[280px] rounded-xl bg-[var(--color-panel-bg)] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-[var(--color-border)] p-4 animate-in fade-in zoom-in-95 duration-200`}>
          <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)] pb-2 text-[var(--color-title)]">
            <button type="button" className="p-1 hover:bg-[var(--color-panel-muted)] rounded text-[var(--color-subtle)] text-lg leading-none">‹</button>
            <span className="font-bold text-sm">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button type="button" className="p-1 hover:bg-[var(--color-panel-muted)] rounded text-[var(--color-subtle)] text-lg leading-none">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[var(--color-subtle)] mb-2 uppercase tracking-wide">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {blanks.map(b => <div key={`blank-${b}`} className="p-2" />)}
            {days.map(d => {
              const isSelected = value && new Date(value).getDate() === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const sel = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                    onChange(`${sel.getFullYear()}-${String(sel.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
                    setOpen(false);
                  }}
                  className={`p-1 w-8 h-8 flex items-center justify-center mx-auto rounded-full text-sm font-semibold hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary-strong)] transition-colors ${isSelected ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md' : 'text-[var(--color-title)]'
                    }`}
                >
                  {d}
                </button>
              )
            })}
          </div>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)]">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="hover:text-[var(--color-primary-strong)]">Clear</button>
            <button type="button" onClick={() => { onChange('2026-03-25'); setOpen(false); }} className="hover:text-[var(--color-primary-strong)]">Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomAirlineDropdown = ({ value, onChange, label }: { value: string; onChange: (val: string) => void; label: string; }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const airlineName = PREFERRED_AIRLINES.find(a => a.code === value)?.name || "Any Airline";

  return (
    <div className={`relative flex items-center border border-[var(--color-border)] bg-[var(--color-page-bg)] rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-[var(--color-primary)] cursor-pointer ${open ? 'ring-2 ring-[var(--color-primary)] z-50' : ''}`} ref={ref}>
      <span className="text-sm font-semibold text-[var(--color-subtle)] border-r border-[var(--color-border)] pr-3 mr-3">{label}</span>
      <div className="flex-1 flex justify-between items-center min-w-[140px]" onClick={() => setOpen(!open)}>
        <span className="text-sm font-bold text-[var(--color-title)] truncate">{airlineName}</span>
        <span className="text-xs text-[var(--color-primary)] ml-2">▼</span>
      </div>

      {open && (
        <div className="absolute top-[110%] left-0 w-full z-[110] bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[250px] overflow-y-auto pattern-list p-2">
            <div
              onClick={() => { onChange(""); setOpen(false); }}
              className="px-2 py-1.5 text-sm font-bold text-[var(--color-title)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary-strong)] cursor-pointer transition-colors border-b border-[var(--color-border)]/50"
            >
              Any Airline
            </div>
            {PREFERRED_AIRLINES.map(airline => (
              <div
                key={airline.code}
                onClick={() => { onChange(airline.code); setOpen(false); }}
                className="px-2 py-1.5 text-sm font-bold text-[var(--color-title)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary-strong)] cursor-pointer transition-colors border-b border-[var(--color-border)]/50 last:border-0"
              >
                {airline.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main Component --- //

export const SearchForm = ({ onSearchCallback }: { onSearchCallback?: () => void }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [tripType, setTripType] = useState('one_way');

  const [trips, setTrips] = useState([
    { id: 1, from: AIRPORTS[0], to: AIRPORTS[1], date: '2026-03-25' }
  ]);

  const [returnDate, setReturnDate] = useState('');

  const [showTravellers, setShowTravellers] = useState(false);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState('Economy');

  const [preferredAirline, setPreferredAirline] = useState('');
  const [isDirectFlight, setIsDirectFlight] = useState(true);
  const [isConnectingFlight, setIsConnectingFlight] = useState(false);
  const [fareType, setFareType] = useState('REGULAR');

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowTravellers(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReturnDateChange = (val: string) => {
    setReturnDate(val);
    if (val && tripType === 'one_way') setTripType('round_trip');
    if (!val && tripType === 'round_trip') setTripType('one_way');
  };

  const handleSearch = () => {
    dispatch(setFilters({
      trips: trips.map(t => ({ origin: t.from.code, destination: t.to.code, date: t.date })),
      origin: trips[0].from.code,
      destination: trips[0].to.code,
      departureDate: trips[0].date,
      returnDate: returnDate,
      passengers: adults + childrenCount + infants,
      paxInfo: { ADULT: adults, CHILD: childrenCount, INFANT: infants },
      travelClass: travelClass.toUpperCase().replace(' ', '_'),
      tripType: tripType as any,
      preferredAirline: preferredAirline ? [preferredAirline] : [],
      searchModifiers: {
        isDirectFlight,
        isConnectingFlight,
        pft: fareType
      }
    }));
    if (onSearchCallback) onSearchCallback();
    navigate('/flights');
  };

  const addFlight = () => {
    if (trips.length < 5) {
      const lastTrip = trips[trips.length - 1];
      const nextDestIndex = (AIRPORTS.findIndex(c => c.code === lastTrip.to.code) + 1) % AIRPORTS.length;
      setTrips([...trips, {
        id: Date.now(),
        from: lastTrip.to,
        to: AIRPORTS[nextDestIndex],
        date: ''
      }]);
    }
  };

  const removeFlight = (id: number) => {
    if (trips.length > 2) {
      setTrips(trips.filter(t => t.id !== id));
    }
  };

  const updateTrip = (id: number, field: string, val: any) => {
    setTrips(trips.map(t => {
      if (t.id === id) {
        if (field === 'from') return { ...t, from: val };
        if (field === 'to') return { ...t, to: val };
        if (field === 'date') return { ...t, date: val };
      }
      return t;
    }));
  };

  const swapTripCities = (id: number) => {
    setTrips(trips.map(t => {
      if (t.id === id) return { ...t, from: t.to, to: t.from };
      return t;
    }));
  };

  // Only render active rows. If One Way / Round Trip we only want the FIRST row.
  const activeTrips = tripType === 'multi_city' ? trips : trips.slice(0, 1);

  return (
    <div className="rounded-xl bg-white p-6 shadow-xl border border-[var(--color-border)] w-full font-sans">
      <div className="mb-6 flex flex-wrap items-center gap-6">
        {['One Way', 'Round Trip', 'Multi City'].map((type) => {
          const val = type.toLowerCase().replace(' ', '_');
          const isSelected = tripType === val;
          return (
            <label key={type} className="flex cursor-pointer items-center gap-2" onClick={() => {
              setTripType(val);
              if (val === 'one_way') {
                setReturnDate('');
                // Slice back to single trip when returning to 1-way
                setTrips([trips[0]]);
              } else if (val === 'round_trip') {
                setTrips([trips[0]]);
              } else if (val === 'multi_city') {
                setReturnDate('');
                if (trips.length < 2) {
                  const t1 = trips[0];
                  const nextDestIndex = (AIRPORTS.findIndex(c => c.code === t1.to.code) + 1) % AIRPORTS.length;
                  setTrips([
                    t1,
                    { id: Date.now(), from: t1.to, to: AIRPORTS[nextDestIndex], date: '' }
                  ]);
                }
              }
            }}>
              <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${isSelected ? 'border-[var(--color-primary)]' : 'border-[var(--color-subtle)] hover:border-[var(--color-primary)]'}`}>
                {isSelected && <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
              </div>
              <span className={`text-sm tracking-wide ${isSelected ? 'font-black text-[var(--color-title)]' : 'font-medium text-[var(--color-subtle)]'}`}>
                {type}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        {activeTrips.map((trip, idx) => (
          <div key={trip.id} className="flex flex-col lg:flex-row gap-4 relative">

            <div className={`flex flex-col sm:flex-row ${tripType === 'multi_city' ? 'lg:w-[50%]' : 'lg:w-[45%]'} relative border border-[var(--color-border)] rounded-md shadow-sm`}>
              <CustomAirportDropdown value={trip.from} onChange={(v) => updateTrip(trip.id, 'from', v)} label="From" />

              <div className="absolute left-1/2 top-1/2 -ml-4 -mt-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-primary)] shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:scale-110 z-10 transition-transform hidden sm:flex" onClick={() => swapTripCities(trip.id)}>
                <ArrowRightLeft className="h-4 w-4" />
              </div>

              <div className="h-px sm:h-auto sm:w-px bg-[var(--color-border)]" />
              <CustomAirportDropdown value={trip.to} onChange={(v) => updateTrip(trip.id, 'to', v)} label="To" alignRight={true} />
            </div>

            <div className={`flex flex-col sm:flex-row border border-[var(--color-border)] rounded-md shadow-sm ${tripType === 'multi_city' ? 'lg:w-[25%]' : 'lg:w-[30%]'}`}>
              <CustomDatePicker value={trip.date} onChange={(v) => updateTrip(trip.id, 'date', v)} label="Departure" />

              {idx === 0 && tripType !== 'multi_city' && (
                <>
                  <div className="h-px sm:h-auto sm:w-px bg-[var(--color-border)]" />
                  <CustomDatePicker value={returnDate} onChange={handleReturnDateChange} label="Return" alignRight={true} />
                </>
              )}
            </div>

            {idx === 0 && (
              <div className={`relative ${tripType === 'multi_city' ? 'lg:w-[25%]' : 'lg:w-[25%]'}`} ref={popoverRef}>
                <div
                  className="p-3 border border-[var(--color-border)] rounded-md h-full cursor-pointer hover:bg-[var(--color-panel-muted)] transition-colors shadow-sm"
                  onClick={() => setShowTravellers(!showTravellers)}
                >
                  <span className="text-xs text-[var(--color-subtle)] block mb-1">Travellers & Class <span className="float-right text-[var(--color-primary)]">▼</span></span>
                  <span className="text-lg font-bold text-[var(--color-title)] block mt-1">{adults + childrenCount + infants} Travellers</span>
                  <span className="text-xs text-[var(--color-subtle)] uppercase mt-1 block">{travelClass}</span>
                </div>

                {showTravellers && (
                  <div className="absolute right-0 sm:left-0 xl:left-auto xl:right-0 top-[110%] w-[320px] rounded-xl bg-[var(--color-panel-bg)] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-[var(--color-border)] z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-5 space-y-5">
                      <div>
                        <span className="text-xs font-bold text-[var(--color-title)] tracking-wider">ADULTS (12y+)</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button key={num} type="button" onClick={() => setAdults(num)} className={`h-8 w-8 rounded text-sm font-semibold border transition-colors ${adults === num ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-title)] hover:border-[var(--color-primary)]'}`}>
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--color-title)] tracking-wider">CHILDREN (2y - 12y)</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {[0, 1, 2, 3, 4, 5, 6].map(num => (
                            <button key={num} type="button" onClick={() => setChildrenCount(num)} className={`h-8 w-8 rounded text-sm font-semibold border transition-colors ${childrenCount === num ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-title)] hover:border-[var(--color-primary)]'}`}>
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--color-title)] tracking-wider block mb-2">CHOOSE TRAVEL CLASS</span>
                        <div className="flex flex-wrap gap-2">
                          {['Economy', 'Premium Economy', 'Business', 'First Class'].map(cls => (
                            <button key={cls} type="button" onClick={() => setTravelClass(cls)} className={`rounded px-3 py-1.5 text-xs font-semibold border transition-colors ${travelClass === cls ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-title)] hover:border-[var(--color-primary)]'}`}>
                              {cls}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button type="button" onClick={() => setShowTravellers(false)} className="w-full mt-4 rounded-lg bg-[var(--color-primary)] py-3 text-sm font-extrabold text-[var(--color-on-primary)] shadow-sm transition hover:opacity-90">
                        APPLY
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tripType === 'multi_city' && idx > 0 && (
              <div className="flex items-center justify-start lg:w-[15%] pt-2 lg:pt-0">
                <button
                  type="button"
                  onClick={() => removeFlight(trip.id)}
                  disabled={trips.length <= 2}
                  className={`h-10 w-10 border-2 rounded-full flex items-center justify-center transition-all shadow-sm ${trips.length <= 2 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-red-500 text-red-500 hover:bg-red-50 hover:scale-105'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

          </div>
        ))}

        {tripType === 'multi_city' && trips.length < 5 && (
          <div className="flex mt-2">
            <button type="button" onClick={addFlight} className="rounded-lg bg-[var(--color-primary-strong)] px-8 py-3 text-sm font-extrabold text-[var(--color-on-primary)] shadow-md transition-transform hover:scale-105">
              Add Flight
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-6 pb-2">

        {/* Upgraded Airlines Dropdown */}
        <CustomAirlineDropdown value={preferredAirline} onChange={setPreferredAirline} label="Prefered Airlines" />

        <label className="flex items-center gap-2 cursor-pointer ml-4">
          <input type="checkbox" checked={isDirectFlight} onChange={(e) => setIsDirectFlight(e.target.checked)} className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
          <span className="text-sm text-[var(--color-primary-strong)] font-semibold">Direct Flight</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isConnectingFlight} onChange={(e) => setIsConnectingFlight(e.target.checked)} className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
          <span className="text-sm text-[var(--color-body)]">Connecting Flight</span>
        </label>

        <div className="ml-auto flex flex-wrap items-center gap-4 mt-4 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-[var(--color-border)] w-full sm:w-auto">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="fareType" checked={fareType === 'REGULAR'} onChange={() => setFareType('REGULAR')} className="h-5 w-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-primary-strong)] font-semibold">Regular</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="fareType" checked={fareType === 'STUDENT'} onChange={() => setFareType('STUDENT')} className="h-5 w-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-body)]">Student</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="fareType" checked={fareType === 'SENIOR_CITIZEN'} onChange={() => setFareType('SENIOR_CITIZEN')} className="h-5 w-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-body)]">Senior Citizen</span>
          </label>
        </div>
      </div>

      <div className="relative mt-12 flex justify-center h-0 overflow-visible z-20">
        <button
          onClick={handleSearch}
          type="button"
          className="absolute -top-6 rounded-lg bg-[var(--color-primary)] px-20 py-4 text-lg font-black text-[var(--color-on-primary)] shadow-[0_4px_14px_0_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 border border-[var(--color-border)]"
        >
          Search
        </button>
      </div>
    </div>
  );
};
