import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFlights, setSelectedMultiCityIndex } from '../features/flightSlice';
import { setFlightForBooking, setReturnFlightForBooking } from '../features/bookingSlice';
import { AppDispatch, RootState } from '../store';
import { Plane, Info, X, ArrowRightLeft, Loader2, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { Flight, DynamicFilterCategory } from '../types/flight';
import { MainLayout } from '../components/MainLayout';
import { SearchForm } from '../components/SearchForm';

// ─── Time helpers ────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  { label: '00–06', icon: Moon, range: [0, 6] },
  { label: '06–12', icon: Sunrise, range: [6, 12] },
  { label: '12–18', icon: Sun, range: [12, 18] },
  { label: '18–00', icon: Sunset, range: [18, 24] },
] as const;

function getHour(timeStr: string): number {
  // timeStr is "HH:MM"
  if (!timeStr) return 0;
  return parseInt(timeStr.split(':')[0], 10);
}

function timeInSlot(timeStr: string, slot: readonly [number, number]): boolean {
  const h = getHour(timeStr);
  return h >= slot[0] && h < slot[1];
}

// Per-leg filter shape
interface LegF { airlines: string[]; priceMax: number; durMax: number; terminals: string[]; stops: string[]; fares: string[]; cabs: string[]; dep: number[]; arr: number[]; }
const mkF = (): LegF => ({ airlines: [], priceMax: 200000, durMax: 2880, terminals: [], stops: [], fares: [], cabs: [], dep: [], arr: [] });

// ─── Component ───────────────────────────────────────────────────────────────
export const FlightListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    flights,
    returnFlights,
    multiCityFlights,
    loading,
    filters,
    fareFilters,
    selectedMultiCityIndex,
    dynamicFilters,
  } = useSelector((state: RootState) => state.flight);

  const booking = useSelector((state: RootState) => state.booking);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedPopup, setSelectedPopup] = useState<Flight | null>(null);
  const [popupTab, setPopupTab] = useState('Flight Details');   // renamed from activeTab
  const [showModifyPopup, setShowModifyPopup] = useState(false);

  // "filterLeg" controls which leg's dynamic filter options are shown in sidebar
  // For one-way: 'ONWARD'; for round-trip: 'ONWARD' | 'RETURN'; for multi-city: '0', '1', …
  const [filterLeg, setFilterLeg] = useState<string>('ONWARD');

  // ── Sorting state ─────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<'price' | 'departure' | 'arrival' | 'airline' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // ── Per-leg filter state (ONWARD/RETURN/0/1/…) ─────────────────────────
  const [legFilters, setLegFilters] = useState<Record<string, LegF>>({ ONWARD: mkF(), RETURN: mkF() });
  const curF: LegF = { ...mkF(), ...(legFilters[filterLeg] || {}) };
  const setF = (u: Partial<LegF>) =>
    setLegFilters(p => ({ ...p, [filterLeg]: { ...(p[filterLeg] ?? mkF()), ...u } }));

  // ── Trip-type shorthands ──────────────────────────────────────────────────
  const isMulti = filters.tripType === 'multi_city';
  const isRound = filters.tripType === 'round_trip';

  // Sync filterLeg when trip type changes
  useEffect(() => {
    if (isMulti) setFilterLeg('0');
    else setFilterLeg('ONWARD');
  }, [filters.tripType, isMulti]);

  // Sync filterLeg with selected multi-city index
  useEffect(() => {
    if (isMulti) setFilterLeg(String(selectedMultiCityIndex));
  }, [selectedMultiCityIndex, isMulti]);

  useEffect(() => {
    dispatch(fetchFlights(filters));
  }, [dispatch, filters]);

  // ── Dynamic filters for the currently active sidebar leg ──────────────────
  const currentDynamicFilters: DynamicFilterCategory | null =
    dynamicFilters ? (dynamicFilters[filterLeg] ?? dynamicFilters['ONWARD'] ?? null) : null;

  // Compute price bounds for current leg's dynamic filters
  const getDynMax = (leg: string) => {
    const df = dynamicFilters ? (dynamicFilters[leg] ?? dynamicFilters['ONWARD']) : null;
    return df?.listOfFares?.length ? Math.max(...df.listOfFares) : 200000;
  };
  const dynPriceMax = getDynMax(filterLeg);

  // Compute duration bounds
  const dynDurMax = currentDynamicFilters?.totalDuration?.length ? Math.max(...currentDynamicFilters.totalDuration) : 1440;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatHeaderDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr)
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' })
      .toUpperCase();
  };

  const handleSort = (field: 'price' | 'departure' | 'arrival' | 'airline') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const resetFilters = () => setF(mkF());

  const toggleItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  // ── Core filter + sort (per-leg) ─────────────────────────────────────────
  const applyFilters = useCallback((list: Flight[], f: LegF, dynMax: number): Flight[] => {
    let r = [...(list || [])];
    if (f?.airlines?.length) r = r.filter(x => f.airlines.some(a => x.airline.toLowerCase().includes(a.toLowerCase())));

    // Price
    const priceLimit = f?.priceMax ?? 200000;
    if (priceLimit < dynMax) r = r.filter(x => Number(x.minprice) <= priceLimit);

    // Duration
    const durLimit = f?.durMax ?? 2880;
    if (durLimit < 2880) r = r.filter(x => {
      if (!x.duration) return true;
      const hMatch = x.duration.match(/(\d+)h/);
      const mMatch = x.duration.match(/(\d+)m/);
      const mins = (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
      return mins <= durLimit;
    });

    // Terminals
    if (f?.terminals?.length) r = r.filter(x => f.terminals.includes(x.terminaldeparture));

    // Stops
    if (f?.stops?.length) r = r.filter(x => {
      if (f.stops.includes('Non Stop') && x.stops === 0) return true;
      if (f.stops.includes('1 Stop') && x.stops === 1) return true;
      if (f.stops.includes('2+ Stops') && x.stops >= 2) return true;
      return false;
    });

    if (f?.fares?.length) r = r.filter(x => x.allFares?.some(fa => f.fares.includes(fa)));
    if (f?.cabs?.length) r = r.filter(x => f.cabs.includes(x.class?.toUpperCase()));
    if (f?.dep?.length) r = r.filter(x => f.dep.some(i => timeInSlot(x.departureTime, TIME_SLOTS[i].range)));
    if (f?.arr?.length) r = r.filter(x => f.arr.some(i => timeInSlot(x.arrivalTime, TIME_SLOTS[i].range)));

    if (sortField) r.sort((a, b) => {
      let va: string | number = '', vb: string | number = '';
      if (sortField === 'price') { va = Number(a.minprice || 0); vb = Number(b.minprice || 0); }
      else if (sortField === 'departure') { va = a.departureTime; vb = b.departureTime; }
      else if (sortField === 'arrival') { va = a.arrivalTime; vb = b.arrivalTime; }
      else if (sortField === 'airline') { va = a.airline; vb = b.airline; }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
    return r;
  }, [sortField, sortAsc]);

  const onwardF: LegF = { ...mkF(), ...(legFilters['ONWARD'] || {}) };
  const returnF: LegF = { ...mkF(), ...(legFilters['RETURN'] || {}) };
  const displayedFlights = applyFilters(flights, onwardF, getDynMax('ONWARD'));
  const displayedReturnFlights = applyFilters(returnFlights, returnF, getDynMax('RETURN'));
  const displayedMultiCityFlights = (multiCityFlights || []).map((arr, i) =>
    applyFilters(arr, { ...mkF(), ...(legFilters[String(i)] || {}) }, getDynMax(String(i))));

  // ── Flight selection ──────────────────────────────────────────────────────
  const handleSelect = (flight: Flight, isReturnList = false, fareIdentifier?: string) => {
    if (isRound) {
      if (isReturnList) dispatch(setReturnFlightForBooking({ flight, fareIdentifier }));
      else dispatch(setFlightForBooking({ flight, fareIdentifier }));
    } else if (isMulti) {
      dispatch(setFlightForBooking({ flight, fareIdentifier, index: selectedMultiCityIndex }));
      if (selectedMultiCityIndex === (multiCityFlights?.length || 0) - 1) navigate('/booking');
      else dispatch(setSelectedMultiCityIndex(selectedMultiCityIndex + 1));
    } else {
      dispatch(setFlightForBooking({ flight, fareIdentifier }));
      navigate('/booking');
    }
  };

  const handleConfirmSelection = () => {
    const sel = booking.selectedFlights || [];
    if (isRound && (!sel[0] || !sel[1])) { alert('Please select both onward and return flights'); return; }
    navigate('/booking');
  };

  // Fare badge colour map
  const fareBadge: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-700', SPECIAL_RETURN: 'bg-blue-100 text-blue-700',
    ECO_VALUE: 'bg-teal-100 text-teal-700', SME: 'bg-cyan-100 text-cyan-700',
    CORPORATE: 'bg-indigo-100 text-indigo-700', FUEL_PLUS: 'bg-orange-100 text-orange-700',
    STRETCH: 'bg-red-100 text-red-700',
  };

  // ── Flight card (expanded — all fare rows inline) ─────────────────────────
  const renderFlightCard = (flight: Flight, isReturnCard = false) => {
    const idx = isRound ? (isReturnCard ? 1 : 0) : (isMulti ? selectedMultiCityIndex : 0);
    const sel = booking.selectedFlights || [];
    const isSelected = sel[idx]?.flight?.id === flight.id;

    return (
      <div
        key={flight.id}
        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 mb-2 ${isSelected
          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-1 scale-[1.01] shadow-lg bg-[var(--color-primary-soft)]/10'
          : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary-soft)] hover:shadow-md'
          }`}
      >
        {isSelected && (
          <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-bl-lg shadow-sm z-10">
            Selected
          </div>
        )}

        {/* ── Flight header ── */}
        <div className="p-3 flex items-center gap-3 bg-white">
          <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
            {flight.icon ? <img src={`https://pics.avs.io/al_64/64/${flight.icon}.png`} alt={flight.airline} className="h-full w-full object-contain p-0.5" /> : <Plane className="h-4 w-4 text-gray-400" />}
          </div>
          <div className="min-w-[90px]">
            <p className="font-bold text-xs text-[var(--color-title)] leading-tight">{flight.airline}</p>
            <p className="text-2xs text-gray-400 font-bold uppercase">{flight.flightNumber}</p>
          </div>
          <div className="flex flex-1 items-center justify-center gap-1 px-2">
            <div className="text-center">
              <p className="text-sm font-black text-[var(--color-title)]">{flight.departureTime}</p>
              <p className="text-2xs text-gray-500 font-bold">{flight.departureCode}</p>
              <p className="text-2xs text-gray-300 truncate max-w-[70px] font-medium">{flight.departureLocation}</p>
            </div>
            <div className="flex-1 flex flex-col items-center px-2">
              <p className="text-2xs text-gray-400 font-bold mb-0.5">{flight.duration}</p>
              <div className="relative w-full h-px bg-gray-200">
                <Plane className={`absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary)] ${isReturnCard ? '-rotate-90' : 'rotate-90'}`} />
              </div>
              <p className="text-2xs text-orange-500 font-bold uppercase mt-0.5">{flight.stops === 0 ? 'Non Stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-[var(--color-title)]">{flight.arrivalTime}</p>
              <p className="text-2xs text-gray-500 font-bold">{flight.arrivalCode}</p>
              <p className="text-2xs text-gray-300 truncate max-w-[70px] font-medium">{flight.arrivalLocation}</p>
            </div>
          </div>
        </div>

        {/* ── Fare rows ── */}
        <div className="border-t border-gray-100">
          {(flight.pricingOptions || []).map((po, i) => {
            const isRowSel = isSelected && sel[idx]?.fareIdentifier === po.fareIdentifier;
            const badge = fareBadge[po.fareIdentifier] || 'bg-gray-100 text-gray-600';
            return (
              <div key={i} className={`flex flex-col lg:flex-row lg:items-center px-3 py-3 gap-y-2 lg:gap-2 border-b border-gray-50 last:border-b-0 transition-colors ${isRowSel ? 'bg-[var(--color-primary)]/5' : 'hover:bg-gray-50/60'}`}>
                {/* Left: Classes and Labels */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-2xs font-black uppercase text-gray-400 w-16 shrink-0">{po.class}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full shrink-0 ${badge}`}>{po.fareIdentifier}</span>
                  <button onClick={() => { setSelectedPopup(flight); setPopupTab('Flight Details'); }} className="text-[10px] text-blue-500 hover:underline font-bold whitespace-nowrap">View Flight Details</button>
                </div>

                {/* Spacer (Desktop only) */}
                <div className="flex-1 hidden xl:block" />

                {/* Right: Price and Action */}
                <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 lg:border-transparent mt-1 lg:mt-0">
                  <p className="text-sm lg:text-base font-black text-[var(--color-title)] whitespace-nowrap">₹{po.price.toLocaleString('en-IN')}</p>
                  <button
                    onClick={() => handleSelect(flight, isReturnCard, po.fareIdentifier)}
                    className="bg-[var(--color-primary)] text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm"
                  >
                    {isRowSel ? 'Change' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Time slot toggle button ───────────────────────────────────────────────
  const TimeSlotBtn = ({
    index, active, onClick,
  }: { index: number; active: boolean; onClick: () => void }) => {
    const slot = TIME_SLOTS[index];
    const Icon = slot.icon;
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${active
          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
          : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
          }`}
      >
        <Icon className="h-3.5 w-3.5 mb-0.5" />
        <span>{slot.label}</span>
      </button>
    );
  };

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const renderSidebar = () => (
    <div className="space-y-6">
      {/* Leg Switcher (Round Trip or Multi-City) */}
      {(isRound || isMulti) && (
        <div className="mb-4">
          {isRound ? (
            <div className="flex gap-2">
              {['ONWARD', 'RETURN'].map(leg => (
                <button
                  key={leg}
                  onClick={() => setFilterLeg(leg)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterLeg === leg
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gray-300'
                    }`}
                >
                  {leg === 'ONWARD' ? 'Outbound' : 'Return'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {(filters.trips || []).map((trip, idx) => (
                <button
                  key={idx}
                  onClick={() => { setFilterLeg(String(idx)); dispatch(setSelectedMultiCityIndex(idx)); }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterLeg === String(idx)
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gray-300'
                    }`}
                >
                  {trip.origin}→{trip.destination}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-5">
        {/* Airlines */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Airlines</p>
          {currentDynamicFilters?.listOfAirLines?.length ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {currentDynamicFilters.listOfAirLines.map(al => (
                <label key={al} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={curF.airlines.includes(al)}
                    onChange={() => setF({ airlines: toggleItem(curF.airlines, al) })}
                    className="h-3.5 w-3.5 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className={`text-2xs font-bold ${curF.airlines.includes(al) ? 'text-[var(--color-primary-strong)]' : 'text-gray-500'}`}>{al}</span>
                </label>
              ))}
            </div>
          ) : (
            <input type="text" placeholder="Search airlines…"
              className="text-xs p-2 border border-gray-100 rounded-lg w-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-bold"
              value={curF.airlines[0] || ''}
              onChange={e => setF({ airlines: e.target.value ? [e.target.value] : [] })} />
          )}
        </div>

        {/* Cabin Classes */}
        {currentDynamicFilters?.listOfCabinClasses?.length ? (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Cabin Classes</p>
            <div className="space-y-1.5">
              {currentDynamicFilters.listOfCabinClasses.map(cc => (
                <label key={cc} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={curF.cabs.includes(cc)}
                    onChange={() => setF({ cabs: toggleItem(curF.cabs, cc) })}
                    className="h-3.5 w-3.5 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className={`text-2xs font-black uppercase ${curF.cabs.includes(cc) ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>{cc}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {/* Fare Types */}
        {(currentDynamicFilters?.istOfFareIdentifiers || fareFilters || []).length > 0 && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Fare Identifier</p>
            <div className="space-y-1.5">
              {(currentDynamicFilters?.istOfFareIdentifiers || fareFilters || []).map(fare => (
                <label key={fare} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={curF.fares.includes(fare)}
                    onChange={() => setF({ fares: toggleItem(curF.fares, fare) })}
                    className="h-3.5 w-3.5 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className={`text-2xs font-black uppercase ${curF.fares.includes(fare) ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>{fare}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Fare Range */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Fare Range</p>
          <input type="range" min={1000} max={dynPriceMax} step={500} value={curF.priceMax}
            onChange={e => setF({ priceMax: Number(e.target.value) })}
            className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-2xs font-bold text-gray-400">₹1,000</span>
            <span className="text-xs font-black text-[var(--color-primary-strong)]">₹{curF.priceMax >= dynPriceMax ? 'Any' : curF.priceMax.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Stops */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Stops</p>
          <div className="space-y-1.5">
            {(currentDynamicFilters?.noOfStops?.length ? currentDynamicFilters.noOfStops : [0, 1, 2]).map(stop => {
              const label = stop === 0 ? 'Non Stop' : stop === 1 ? '1 Stop' : `${stop}+ Stops`;
              return (
                <label key={stop} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={curF.stops.includes(label)}
                    onChange={() => setF({ stops: toggleItem(curF.stops, label) })}
                    className="h-3.5 w-3.5 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className={`text-2xs font-bold ${curF.stops.includes(label) ? 'text-[var(--color-primary-strong)]' : 'text-gray-500'}`}>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Departure Times */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Departure Times</p>
          <div className="grid grid-cols-4 gap-1">
            {TIME_SLOTS.map((_, i) => <TimeSlotBtn key={i} index={i} active={curF.dep.includes(i)} onClick={() => setF({ dep: toggleItem(curF.dep, i) })} />)}
          </div>
        </div>

        {/* Arrival Times */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Arrival Times</p>
          <div className="grid grid-cols-4 gap-1">
            {TIME_SLOTS.map((_, i) => <TimeSlotBtn key={i} index={i} active={curF.arr.includes(i)} onClick={() => setF({ arr: toggleItem(curF.arr, i) })} />)}
          </div>
        </div>

        {/* Duration Range */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Total Duration</p>
          <input type="range" min={30} max={dynDurMax} step={30} value={curF.durMax}
            onChange={e => setF({ durMax: Number(e.target.value) })}
            className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-2xs font-bold text-gray-400">Min</span>
            <span className="text-xs font-black text-[var(--color-primary-strong)]">{Math.floor(curF.durMax / 60)}h {curF.durMax % 60}m</span>
          </div>
        </div>

        {/* Departure Terminals */}
        {Object.keys(currentDynamicFilters?.listOfDepartureTerminal || {}).length > 0 && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Departure Terminal</p>
            <div className="space-y-1.5">
              {Object.entries(currentDynamicFilters!.listOfDepartureTerminal).map(([city, terms]) => (
                <div key={city} className="space-y-1">
                  <p className="text-2xs font-black text-gray-300 uppercase tracking-widest">{city}</p>
                  {terms.map(term => (
                    <label key={term} className="flex items-center gap-2 cursor-pointer ml-1">
                      <input type="checkbox" checked={curF.terminals.includes(term)}
                        onChange={() => setF({ terminals: toggleItem(curF.terminals, term) })}
                        className="h-3.5 w-3.5 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                      <span className={`text-2xs font-bold ${curF.terminals.includes(term) ? 'text-[var(--color-primary-strong)]' : 'text-gray-500'}`}>{term}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="bg-[var(--color-page-bg)] min-h-screen font-sans">

        {/* ── Search Summary Header ── */}
        <div className="fixed top-16 z-50 bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md w-full">
          <div className="mx-auto flex flex-col lg:flex-row max-w-[1400px] items-center justify-between px-4 sm:px-6 py-4 lg:py-0 lg:h-[75px] xl:h-[90px] lg:gap-1 xl:gap-8">
            <div className="flex flex-wrap items-center md:divide-x lg:divide-x divide-white/10 text-xs gap-y-4 w-full lg:w-auto">
              {/* Route */}
              <div className="flex items-center pr-2 md:pr-4 lg:pr-4 xl:pr-8 w-full md:w-auto">
                <div className="flex items-center gap-2 md:gap-4 lg:gap-3 xl:gap-6">
                  <div className="flex flex-col">
                    <span className="text-xl md:text-2xl lg:text-2xl xl:text-4xl font-black leading-none">{filters.origin}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Origin</span>
                  </div>
                  <ArrowRightLeft className="h-4 w-4 md:h-6 md:w-6 lg:h-5 lg:w-5 xl:h-7 xl:w-7 opacity-40 mx-1 md:mx-3" />
                  <div className="flex flex-col">
                    <span className="text-xl md:text-2xl lg:text-2xl xl:text-4xl font-black leading-none">{filters.destination}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">Destination</span>
                  </div>
                </div>
              </div>

              {/* Departure */}
              <div className="px-2 md:px-4 lg:px-4 xl:px-8 flex flex-col justify-center border-l md:border-l-0 lg:border-l-0 border-white/10">
                <span className="font-black text-[9px] md:text-[10px] lg:text-[10px] xl:text-xs uppercase tracking-wider opacity-60 mb-0.5">Departure</span>
                <span className="text-xs md:text-sm lg:text-sm xl:text-lg font-black opacity-100 whitespace-nowrap">{formatHeaderDate(filters.departureDate)}</span>
              </div>

              {/* Return (if applicable) */}
              {isRound && (
                <div className="px-2 md:px-4 lg:px-4 xl:px-8 flex flex-col justify-center border-l md:border-l-0 lg:border-l-0 border-white/10">
                  <span className="font-black text-[9px] md:text-[10px] lg:text-[10px] xl:text-xs uppercase tracking-wider opacity-60 mb-0.5">Return</span>
                  <span className="text-xs md:text-sm lg:text-sm xl:text-lg font-black opacity-100 whitespace-nowrap">{filters.returnDate ? formatHeaderDate(filters.returnDate as string) : '--'}</span>
                </div>
              )}

              {/* Travellers */}
              <div className="px-2 md:px-4 lg:px-4 xl:px-8 flex flex-col justify-center border-l md:border-l-0 lg:border-l-0 border-white/10">
                <span className="font-black text-[9px] md:text-[10px] lg:text-[10px] xl:text-xs uppercase tracking-wider opacity-60 mb-0.5">Travellers</span>
                <span className="text-xs md:text-sm lg:text-sm xl:text-lg font-black opacity-100 uppercase whitespace-nowrap">
                  {filters.passengers} PAX | {filters.travelClass}
                </span>
              </div>
            </div>

            {/* Modify Action */}
            <div className="w-full lg:w-auto flex justify-center lg:justify-end mt-4 lg:mt-0 pb-2 lg:pb-0">
              <button
                onClick={() => setShowModifyPopup(true)}
                className="w-full sm:w-auto rounded-xl px-4 py-2 lg:px-2.5 lg:py-1.5 xl:px-5 xl:py-2.5 text-[10px] xl:text-xs font-black bg-[var(--color-primary-strong)] hover:brightness-110 shadow-lg border border-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest whitespace-nowrap"
              >
                MODIFY SEARCH <span className="text-[9px] lg:hidden xl:inline">▼</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Modify Search Popup ── */}
        {showModifyPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl rounded-2xl bg-[var(--color-panel-bg)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pb-6 border border-[var(--color-border)]">
              <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-bold text-[var(--color-title)] uppercase tracking-tight">Modify Your Search</h3>
                <button onClick={() => setShowModifyPopup(false)} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                <SearchForm onSearchCallback={() => setShowModifyPopup(false)} />
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <div className="mx-auto mt-[320px] sm:mt-[240px] md:mt-[230px] lg:mt-[95px] xl:mt-[110px] flex flex-col lg:flex-row max-w-[1440px] gap-6 px-4 relative items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 lg:sticky top-[148px] xl:top-[165px] z-10 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col h-auto lg:h-[calc(100vh-270px)] xl:h-[calc(100vh-290px)]">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-[var(--color-title)] uppercase tracking-tight">Filters</h2>
              <button onClick={resetFilters} className="text-[10px] font-black text-[var(--color-primary)] hover:underline uppercase tracking-widest">Reset All</button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {renderSidebar()}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 w-full space-y-4 pb-24">
            {/* Sort Bar */}
            <div className="hidden sm:flex rounded-xl bg-white h-12 shadow-sm border border-[var(--color-border)] text-2xs font-black uppercase tracking-widest text-gray-400 items-center px-4 mb-2">
              <div className="flex-1 cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('airline')}>
                Airlines {sortField === 'airline' ? (sortAsc ? '↑' : '↓') : ''}
              </div>
              <div className="flex-1 text-center cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('departure')}>
                Departure {sortField === 'departure' ? (sortAsc ? '↑' : '↓') : ''}
              </div>
              <div className="flex-1 text-center cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('price')}>
                Price {sortField === 'price' ? (sortAsc ? '↑' : '↓') : ''}
              </div>
              <div className="flex-1 text-right cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('arrival')}>
                Arrival {sortField === 'arrival' ? (sortAsc ? '↑' : '↓') : ''}
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className={`grid gap-4 ${isRound ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-xl border border-dashed border-gray-200 bg-white p-6 h-32 w-full animate-pulse flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-200" />
                    </div>
                  ))}
                </div>
              ) : isMulti ? (
                /* ── Multi-City ── */
                <div className="flex flex-col gap-4">
                  {/* Trip tabs (also in sidebar — clicking sidebar updates both) */}
                  <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto no-scrollbar">
                    {filters.trips?.map((trip, idx) => (
                      <button
                        key={idx}
                        onClick={() => { dispatch(setSelectedMultiCityIndex(idx)); setFilterLeg(String(idx)); }}
                        className={`px-4 py-2 rounded-lg text-2xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedMultiCityIndex === idx
                          ? 'bg-[var(--color-primary)] text-white shadow shadow-primary/20'
                          : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'
                          }`}
                      >
                        Trip {idx + 1}: {trip.origin} → {trip.destination}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {displayedMultiCityFlights[selectedMultiCityIndex]?.length > 0
                      ? displayedMultiCityFlights[selectedMultiCityIndex].map(f => renderFlightCard(f))
                      : <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 font-bold">No flights found for this leg.</div>
                    }
                  </div>
                </div>
              ) : isRound ? (
                /* ── Round Trip ── */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Departure / Onward */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-sm">
                      <span className="h-7 w-7 rounded bg-[var(--color-primary)] text-white text-xs font-black flex items-center justify-center shadow-sm">1</span>
                      <h3 className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest leading-none">Departure Flight</h3>
                      <span className="ml-auto text-2xs text-gray-400 font-bold">{formatHeaderDate(filters.departureDate)}</span>
                    </div>
                    <div className="space-y-2">
                      {displayedFlights.length > 0
                        ? displayedFlights.map(f => renderFlightCard(f, false))
                        : <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 font-bold text-sm">No outbound flights found.</div>
                      }
                    </div>
                  </div>

                  {/* Return */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 shadow-sm">
                      <span className="h-7 w-7 rounded bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-sm">2</span>
                      <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest leading-none">Return Flight</h3>
                      <span className="ml-auto text-2xs text-gray-400 font-bold">{formatHeaderDate(filters.returnDate || '')}</span>
                    </div>
                    <div className="space-y-2">
                      {displayedReturnFlights.length > 0
                        ? displayedReturnFlights.map(f => renderFlightCard(f, true))
                        : <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 font-bold text-sm">No return flights found.</div>
                      }
                    </div>
                  </div>
                </div>
              ) : (
                /* ── One Way ── */
                <div className="grid grid-cols-1 gap-2">
                  {displayedFlights.length > 0
                    ? displayedFlights.map(f => renderFlightCard(f))
                    : <div className="p-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-black text-sm uppercase tracking-widest">No flights found matching your criteria</div>
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Round-Trip sticky confirmation bar ── */}
        {/* ── Selection Summary (Bottom Sticky) ── */}
        {(isRound || isMulti) && ((booking.selectedFlights || [])[0] || (booking.selectedFlights || [])[1]) && (
          <div className="fixed bottom-8 left-0 right-0 z-[60] bg-white border-t border-yellow-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] py-3 px-6 animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto flex flex-col sm:flex-row max-w-[1400px] items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4 sm:gap-8 items-center justify-center sm:justify-start w-full sm:w-auto">
                {[0, 1].map(idx => {
                  const selItem = (booking.selectedFlights || [])[idx];
                  if (!selItem) return null;
                  const f = selItem.flight;
                  return (
                    <div key={idx} className="flex items-center gap-3 py-1 border-r border-gray-100 last:border-0 pr-4 sm:pr-8 last:pr-0">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{idx === 0 ? 'Onward' : 'Return'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[var(--color-title)]">{f.departureCode} → {f.arrivalCode}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase px-1.5 py-0.5 bg-gray-100 rounded">{f.airline}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex flex-col sm:border-l border-gray-100 sm:pl-8">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Price</span>
                  <span className="text-xl font-black text-[var(--color-primary-strong)]">
                    ₹{(
                      Number((booking.selectedFlights || [])[0]?.flight?.minprice || 0) +
                      Number((booking.selectedFlights || [])[1]?.flight?.minprice || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleConfirmSelection}
                  disabled={!(booking.selectedFlights || [])[0] || (isRound && !(booking.selectedFlights || [])[1])}
                  className="w-full sm:w-auto rounded-xl bg-[var(--color-primary)] text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest shadow-xl hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 shadow-primary/20"
                >
                  CONTINUE TO BOOKING
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Flight Details Popup ── */}
        {selectedPopup && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 animate-in fade-in duration-300">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                    {selectedPopup?.icon && <img src={`https://pics.avs.io/al_64/64/${selectedPopup.icon}.png`} alt="" className="h-5 w-5 object-contain" />}
                  </div>
                  <h3 className="text-base font-black text-[var(--color-title)] tracking-tight">
                    {selectedPopup?.airline} <span className="text-[10px] text-gray-400">({selectedPopup?.flightNumber})</span>
                  </h3>
                </div>
                <button onClick={() => setSelectedPopup(null)} className="rounded-full p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4 text-[var(--color-subtle)]" />
                </button>
              </div>

              <div className="flex border-b border-gray-50 px-6 gap-6">
                {['Flight Details', 'Fare Details', 'Baggage'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPopupTab(tab)}
                    className={`py-2 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${popupTab === tab
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--color-subtle)] hover:text-[var(--color-title)]'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4 flex-1 overflow-y-auto bg-gray-50/20">
                {popupTab === 'Flight Details' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                      <div className="text-center">
                        <p className="text-lg font-black text-[var(--color-title)]">{selectedPopup?.departureTime}</p>
                        <p className="text-[9px] font-bold text-[var(--color-subtle)] uppercase">{selectedPopup?.departureCode}</p>
                      </div>
                      <div className="flex-1 px-4 text-center">
                        <span className="text-[9px] font-bold text-gray-400 block mb-1">{selectedPopup?.duration}</span>
                        <div className="h-px bg-dashed border-t border-dashed border-gray-100 relative">
                          <Plane className="h-3 w-3 text-[var(--color-primary)] absolute left-1/2 -ml-1.5 -mt-1.5 rotate-90 bg-white" />
                        </div>
                        <span className="text-[9px] font-bold text-orange-500 uppercase mt-1 block">
                          {selectedPopup?.stops === 0 ? 'Non-Stop' : `${selectedPopup?.stops} Stop(s)`}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-[var(--color-title)]">{selectedPopup?.arrivalTime}</p>
                        <p className="text-[9px] font-bold text-[var(--color-subtle)] uppercase">{selectedPopup?.arrivalCode}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">From</p>
                        <p className="text-xs font-bold text-[var(--color-title)]">{selectedPopup?.departureLocation}</p>
                        <p className="text-[9px] text-gray-400">{selectedPopup?.terminaldeparture || 'Terminal T1'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">To</p>
                        <p className="text-xs font-bold text-[var(--color-title)]">{selectedPopup?.arrivalLocation}</p>
                        <p className="text-[9px] text-gray-400">{selectedPopup?.terminalarrival || 'Terminal T1'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {popupTab === 'Fare Details' && (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                        <tr>
                          <th className="px-4 py-2">Fare Type</th>
                          <th className="px-4 py-2">Breakdown</th>
                          <th className="px-4 py-2 text-right">Price</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(selectedPopup?.pricingOptions || []).map((po, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-black text-[var(--color-title)] uppercase leading-none">{po.class}</span>
                                <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full uppercase tracking-tighter w-fit border border-emerald-100/50">
                                  {po.fareIdentifier}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="group relative w-fit">
                                <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 cursor-help hover:text-blue-700 transition-colors">
                                  VIEW <Info className="h-2.5 w-2.5" />
                                </div>
                                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-56 bg-white border border-gray-100 shadow-2xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-bottom-1 duration-150">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-1.5 mb-2">Price Breakdown</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-gray-500 font-bold">Base Fare</span>
                                      <span className="font-black">₹{(po.breakdown?.baseFare || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-gray-500 font-bold">Taxes & Fees</span>
                                      <span className="font-black">₹{(po.breakdown?.taxAndCharges || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="pt-1.5 mt-1.5 border-t border-gray-50 flex justify-between text-xs font-black">
                                      <span className="text-[var(--color-primary-strong)]">Total</span>
                                      <span className="text-[var(--color-primary-strong)]">₹{po.price.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-base font-black text-[var(--color-title)] tracking-tight">₹{po.price.toLocaleString('en-IN')}</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Per Adult</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => { if (selectedPopup) { handleSelect(selectedPopup, false, po.fareIdentifier); setSelectedPopup(null); } }}
                                className="bg-[var(--color-primary)] text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:brightness-110 shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
                              >
                                Book
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {popupTab === 'Baggage' && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-in fade-in duration-300">
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Check-in Baggage</span>
                      <span className="text-xs font-bold text-[var(--color-title)]">15 KG / Adult</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Cabin Baggage</span>
                      <span className="text-xs font-bold text-[var(--color-title)]">7 KG / Adult</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
