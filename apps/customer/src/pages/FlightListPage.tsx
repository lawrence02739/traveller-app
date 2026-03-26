import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFlights, setSelectedMultiCityIndex } from '../features/flightSlice';
import { setFlightForBooking, setReturnFlightForBooking } from '../features/bookingSlice';
import { AppDispatch, RootState } from '../store';
import { Plane, Info, X, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Flight } from '../types/flight';
import { MainLayout } from '../components/MainLayout';
import { SearchForm } from '../components/SearchForm';

export const FlightListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { flights, returnFlights, multiCityFlights, loading, filters, fareFilters, selectedMultiCityIndex, dynamicFilters } = useSelector((state: RootState) => state.flight);
  const booking = useSelector((state: RootState) => state.booking);
  
  const [selectedPopup, setSelectedPopup] = useState<Flight | null>(null);
  const [showModifyPopup, setShowModifyPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('Flight Details');
  
  // Sorting state
  const [sortField, setSortField] = useState<'price' | 'departure' | 'arrival' | 'airline' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Filters State
  const [selectedAirline, setSelectedAirline] = useState<string>('');
  const [priceMax, setPriceMax] = useState<number>(200000);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedFares, setSelectedFares] = useState<string[]>([]);
  const [selectedCabinClasses, setSelectedCabinClasses] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchFlights(filters));
  }, [dispatch, filters]);

  const isMulti = filters.tripType === 'multi_city';
  const isRound = filters.tripType === 'round_trip';

  const currentLegKey = isMulti 
    ? (selectedMultiCityIndex || 0).toString() 
    : (activeTab === 'return' ? 'RETURN' : 'ONWARD');

  const currentDynamicFilters = dynamicFilters ? (dynamicFilters[currentLegKey] || dynamicFilters['ONWARD']) : null;

  const formatHeaderDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' }).toUpperCase();
  };

  const handleSort = (field: 'price' | 'departure' | 'arrival' | 'airline') => {
    if (sortField === field) {
       setSortAsc(!sortAsc);
    } else {
       setSortField(field);
       setSortAsc(true);
    }
  };

  const applySortAndFilter = (list: Flight[]) => {
     let result = [...(list || [])];
     
     if (selectedAirline) {
       result = result.filter(f => f.airline.toLowerCase().includes(selectedAirline.toLowerCase()));
     }
     if (priceMax < 200000) {
       result = result.filter(f => Number(f.minprice) <= priceMax);
     }
     if (selectedStops.length > 0) {
       result = result.filter(f => {
         if (selectedStops.includes('Non Stop') && f.stops === 0) return true;
         if (selectedStops.includes('1 Stop') && f.stops === 1) return true;
         if (selectedStops.includes('2+ Stops') && f.stops >= 2) return true;
         return false;
       });
     }
     if (selectedFares.length > 0) {
       result = result.filter(f => f.allFares?.some(fare => selectedFares.includes(fare)));
     }
     if (selectedCabinClasses.length > 0) {
       result = result.filter(f => selectedCabinClasses.includes(f.class?.toUpperCase()));
     }

     if (sortField) {
       result.sort((a, b) => {
         let valA: string | number = '';
         let valB: string | number = '';
         
         if (sortField === 'price') {
           valA = Number(a.minprice || 0);
           valB = Number(b.minprice || 0);
         } else if (sortField === 'departure') {
           valA = a.departureTime;
           valB = b.departureTime;
         } else if (sortField === 'arrival') {
           valA = a.arrivalTime;
           valB = b.arrivalTime;
         } else if (sortField === 'airline') {
           valA = a.airline;
           valB = b.airline;
         }

         if (valA < valB) return sortAsc ? -1 : 1;
         if (valA > valB) return sortAsc ? 1 : -1;
         return 0;
       });
     }
     
     return result;
  };

  const displayedFlights = applySortAndFilter(flights);
  const displayedReturnFlights = applySortAndFilter(returnFlights);
  const displayedMultiCityFlights = (multiCityFlights || []).map(arr => applySortAndFilter(arr));

  const handleSelect = (flight: Flight, isReturnList: boolean = false, fareIdentifier?: string) => {
    let index = 0;
    if (isRound) {
       index = isReturnList ? 1 : 0;
       if (isReturnList) dispatch(setReturnFlightForBooking({ flight, fareIdentifier }));
       else dispatch(setFlightForBooking({ flight, fareIdentifier }));
    } else if (isMulti) {
       index = selectedMultiCityIndex;
       dispatch(setFlightForBooking({ flight, fareIdentifier, index }));
       if (selectedMultiCityIndex === (multiCityFlights?.length || 0) - 1) {
         navigate('/booking');
       } else {
         dispatch(setSelectedMultiCityIndex(selectedMultiCityIndex + 1));
       }
    } else {
       dispatch(setFlightForBooking({ flight, fareIdentifier }));
       navigate('/booking');
    }
  };

  const handleConfirmSelection = () => {
    if (isRound && ((booking.selectedFlights || []).length < 2 || !(booking.selectedFlights || [])[0] || !(booking.selectedFlights || [])[1])) {
       alert("Please select both onward and return flights");
       return;
    }
    navigate('/booking');
  };

  const renderFlightCard = (flight: Flight, isReturnCard: boolean = false) => {
    const idx = isRound ? (isReturnCard ? 1 : 0) : (isMulti ? selectedMultiCityIndex : 0);
    const isSelected = (booking.selectedFlights || [])[idx]?.flight?.id === flight.id;

    return (
      <div 
        key={flight.id} 
        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 mb-2 ${
          isSelected 
            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-1 scale-[1.01] shadow-lg bg-[var(--color-primary-soft)]/10' 
            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary-soft)] hover:shadow-md'
        }`}
      >
        {isSelected && (
          <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-bl-lg shadow-sm z-10">
             Selected
          </div>
        )}
        <div className="p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-[140px]">
              <div className="h-10 w-10 rounded-lg bg-gray-50 p-1.5 border border-gray-100 group-hover:bg-white transition-colors flex items-center justify-center">
                {flight.icon ? <img src={`https://pics.avs.io/al_64/64/${flight.icon}.png`} alt={flight.airline} className="h-full w-full object-contain" /> : <Plane className="h-5 w-5 text-gray-400" />}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-[var(--color-title)] leading-tight truncate">{flight.airline}</h4>
                <p className="text-[9px] font-bold text-[var(--color-subtle)] uppercase tracking-widest mt-0.5">{flight.flightNumber}</p>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-between px-2 sm:px-4">
              <div className="text-center">
                <p className="text-base font-black text-[var(--color-title)] tracking-tight">{flight.departureTime}</p>
                <p className="text-[10px] font-bold text-[var(--color-body)] mt-0.5">{flight.departureCode}</p>
              </div>

              <div className="flex flex-1 flex-col items-center px-2">
                <p className="text-[9px] font-black text-[var(--color-subtle)] uppercase mb-1 tracking-tighter opacity-70">{flight.duration}</p>
                <div className="relative w-full">
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
                  <Plane className={`absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary)] transition-transform duration-700 ${isReturnCard ? '-rotate-90' : 'rotate-90'}`} />
                </div>
                <p className="mt-1 text-[9px] font-bold uppercase text-orange-500 tracking-wider">
                  {flight.stops === 0 ? 'Non Stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="text-center">
                <p className="text-base font-black text-[var(--color-title)] tracking-tight">{flight.arrivalTime}</p>
                <p className="text-[10px] font-bold text-[var(--color-body)] mt-0.5">{flight.arrivalCode}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 sm:border-l border-[var(--color-border)] pt-3 sm:pt-0 sm:pl-6 gap-2">
              <div className="text-right">
                <p className="text-[9px] font-black text-[var(--color-subtle)] uppercase tracking-wider mb-0.5">Starts From</p>
                <p className="text-lg font-black text-[var(--color-primary-strong)] tracking-tighter">
                  ₹{Number(flight.minprice).toLocaleString('en-IN')}
                </p>
              </div>
              <button 
                onClick={() => handleSelect(flight, isReturnCard)}
                className={`rounded-lg px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                  isSelected 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-[var(--color-primary)] text-white hover:brightness-110 shadow-sm'
                }`}
              >
                {isSelected ? 'Change' : 'Select'}
              </button>
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-2 border-t border-gray-50 pt-2">
            <span className="text-[8px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">{flight.fareIdentifier} FARE</span>
            <span className="text-[8px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded uppercase tracking-wider">{flight.class}</span>
            <button 
              onClick={() => setSelectedPopup(flight)}
              className="text-[8px] font-bold text-[var(--color-primary)] uppercase tracking-wider hover:underline flex items-center gap-1 ml-auto"
            >
              Flight Details <Info className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="bg-[var(--color-page-bg)] pb-24 min-h-screen font-sans">
        {/* Header Summary */}
        <div className="bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-colors duration-300 shadow-md">
          <div className="mx-auto flex h-auto sm:h-[70px] flex-col sm:flex-row max-w-[1400px] items-center justify-between px-6 py-3 sm:py-0">
            <div className="flex flex-wrap w-full sm:w-auto items-center sm:divide-x divide-white/30 text-xs gap-y-2">
              <div className="flex items-center pr-6 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black leading-none">{filters.origin}</span>
                    <span className="text-[12px] font-bold opacity-80 uppercase tracking-widest mt-1">Origin</span>
                  </div>
                  <ArrowRightLeft className="h-6 w-6 opacity-60 mx-3" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-black leading-none">{filters.destination}</span>
                    <span className="text-[12px] font-bold opacity-80 uppercase tracking-widest mt-1">Destination</span>
                  </div>
                </div>
              </div>
              
              <div className="px-8 flex flex-col justify-center w-1/3 sm:w-auto">
                <span className="font-black text-[12px] uppercase tracking-wider opacity-70 mb-0.5">Departure</span>
                <span className="text-[14px] font-bold opacity-100 truncate">{formatHeaderDate(filters.departureDate)}</span>
              </div>

              <div className="px-6 flex flex-col justify-center w-1/3 sm:w-auto">
                <span className="font-bold text-[11px]">Return</span>
                <span className="text-[10px] opacity-90 truncate">{filters.returnDate ? formatHeaderDate(filters.returnDate) : '--'}</span>
              </div>

              <div className="px-6 flex flex-col justify-center w-1/3 sm:w-auto">
                <span className="font-bold text-[11px]">Travellers</span>
                <span className="text-[10px] opacity-90 uppercase truncate">
                  {filters.passengers} PAX | {filters.travelClass}
                </span>
              </div>
            </div>
            
            <div className="w-full sm:w-auto mt-3 sm:mt-0 flex justify-end">
              <button 
                onClick={() => setShowModifyPopup(true)}
                className="rounded-md px-4 py-2 text-[10px] font-black bg-[var(--color-primary-strong)] hover:brightness-110 shadow border border-white/20 transition-all flex items-center gap-2 uppercase tracking-widest"
              >
                MODIFY SEARCH <span className="text-[9px]">▼</span>
              </button>
            </div>
          </div>
        </div>

        {showModifyPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl rounded-2xl bg-[var(--color-panel-bg)] shadow-2xl zoom-in-95 overflow-hidden flex flex-col max-h-[90vh] pb-6 border border-[var(--color-border)]">
              <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-bold text-[var(--color-title)] uppercase tracking-tight">Modify Your Search</h3>
                <button onClick={() => setShowModifyPopup(false)} className="rounded-full p-2 hover:bg-gray-100 transition-colors"><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              <div className="p-4 overflow-y-auto">
                <SearchForm onSearchCallback={() => setShowModifyPopup(false)} />
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto mt-6 flex flex-col lg:flex-row max-w-7xl gap-6 px-4 relative items-start">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-[260px] shrink-0 lg:sticky top-[90px] z-10">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-md overflow-hidden relative">
              <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="text-2xl font-black text-[var(--color-title)] tracking-tight">Filters</h3>
                <button 
                  onClick={() => { 
                    setSelectedAirline(''); 
                    setPriceMax(200000); 
                    setSelectedStops([]);
                    setSelectedFares([]);
                    setSelectedCabinClasses([]);
                  }}
                  className="text-[10px] font-black text-[var(--color-primary)] uppercase hover:underline"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                {/* Airline Filter */}
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Airlines</p>
                   {currentDynamicFilters?.listOfAirLines?.length ? (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                         {currentDynamicFilters.listOfAirLines.map(al => {
                            const isChecked = selectedAirline === al;
                            return (
                               <label key={al} className="flex items-center gap-2 cursor-pointer group">
                                  <input 
                                    type="radio" 
                                    name="airline"
                                    checked={isChecked}
                                    onChange={() => setSelectedAirline(al === selectedAirline ? '' : al)}
                                    className="h-3 w-3 border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                                  />
                                  <span className={`text-[10px] font-bold transition-colors ${isChecked ? 'text-[var(--color-primary-strong)]' : 'text-gray-500'}`}>{al}</span>
                               </label>
                            );
                         })}
                      </div>
                   ) : (
                      <input 
                        type="text" 
                        placeholder="Search airlines..." 
                        className="text-[10px] p-2 border border-gray-100 rounded-lg w-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-bold"
                        value={selectedAirline}
                        onChange={e => setSelectedAirline(e.target.value)}
                      />
                   )}
                </div>

                {/* Price Range */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Max Price</p>
                  <input 
                    type="range" min="1000" max="200000" step="1000" 
                    value={priceMax} 
                    onChange={e => setPriceMax(Number(e.target.value))} 
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]" 
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] font-bold text-gray-400">₹1,000</span>
                    <span className="text-[11px] font-black text-[var(--color-primary-strong)]">₹{priceMax >= 200000 ? 'Any' : (priceMax).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Stops Filter */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stops</p>
                  <div className="space-y-2">
                    {(currentDynamicFilters?.noOfStops || [0, 1, 2]).map(stop => {
                      const label = stop === 0 ? 'Non Stop' : stop === 1 ? '1 Stop' : `${stop}+ Stops`;
                      const isChecked = selectedStops.includes(label);
                      return (
                        <label key={stop} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) setSelectedStops(selectedStops.filter(i => i !== label));
                              else setSelectedStops([...selectedStops, label]);
                            }}
                            className="h-4 w-4 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                          />
                          <span className={`text-[10px] font-bold transition-colors ${isChecked ? 'text-[var(--color-primary-strong)]' : 'text-gray-500'}`}>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Fare Filter */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Fare Types</p>
                  <div className="space-y-2">
                    {(currentDynamicFilters?.istOfFareIdentifiers || fareFilters || []).map(fare => {
                       const isChecked = selectedFares.includes(fare);
                       return (
                        <label key={fare} className="flex items-center gap-2 cursor-pointer group">
                           <input 
                             type="checkbox" 
                             checked={isChecked}
                             onChange={() => {
                               if (isChecked) setSelectedFares(selectedFares.filter(f => f !== fare));
                               else setSelectedFares([...selectedFares, fare]);
                             }}
                             className="h-4 w-4 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                           />
                           <span className={`text-[10px] font-black uppercase tracking-wider ${isChecked ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>{fare}</span>
                        </label>
                       );
                    })}
                  </div>
                </div>

                {/* Cabin Class Filter */}
                {currentDynamicFilters?.listOfCabinClasses && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cabin Class</p>
                    <div className="space-y-2">
                      {currentDynamicFilters.listOfCabinClasses.map(cc => {
                         const isChecked = selectedCabinClasses.includes(cc);
                         return (
                          <label key={cc} className="flex items-center gap-2 cursor-pointer group">
                             <input 
                               type="checkbox" 
                               checked={isChecked}
                               onChange={() => {
                                 if (isChecked) setSelectedCabinClasses(selectedCabinClasses.filter(c => c !== cc));
                                 else setSelectedCabinClasses([...selectedCabinClasses, cc]);
                               }}
                               className="h-4 w-4 rounded border-gray-200 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                             />
                             <span className={`text-[10px] font-black uppercase tracking-wider ${isChecked ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>{cc}</span>
                          </label>
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 w-full space-y-4">
            {/* Sort Bar */}
            <div className="hidden sm:flex rounded-xl bg-white h-10 shadow-sm border border-[var(--color-border)] text-[9px] font-black uppercase tracking-widest text-gray-400 items-center px-4">
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
              ) : (
                <>
                  {isMulti ? (
                    <div className="flex flex-col gap-4">
                       {/* Multi-city Trip Tabs */}
                       <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto no-scrollbar">
                          {filters.trips?.map((trip, idx) => (
                             <button
                                key={idx}
                                onClick={() => dispatch(setSelectedMultiCityIndex(idx))}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                   selectedMultiCityIndex === idx 
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-6 w-6 rounded bg-[var(--color-primary)] text-white text-[10px] font-black flex items-center justify-center shadow-sm">1</span>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Onward Flights</h3>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <div className="space-y-2">
                          {displayedFlights.length > 0 ? displayedFlights.map(f => renderFlightCard(f, false)) : <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 font-bold text-sm">No onward flights.</div>}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-6 w-6 rounded bg-[var(--color-primary)] text-white text-[10px] font-black flex items-center justify-center shadow-sm">2</span>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Return Flights</h3>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <div className="space-y-2">
                          {displayedReturnFlights.length > 0 ? displayedReturnFlights.map(f => renderFlightCard(f, true)) : <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 font-bold text-sm">No return flights.</div>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {displayedFlights.length > 0 ? displayedFlights.map(f => renderFlightCard(f)) : <div className="p-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-black text-sm uppercase tracking-widest">No flights found matching your criteria</div>}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selection Sticky Bar for Round Trip */}
        {isRound && ((booking.selectedFlights || [])[0] || (booking.selectedFlights || [])[1]) && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-5px_25px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-500">
             <div className="mx-auto max-w-[1400px] px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 divide-x divide-gray-50">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Onward Flight</span>
                      <span className="text-xs font-bold text-[var(--color-title)] truncate max-w-[150px]">
                         {(booking.selectedFlights || [])[0] ? `${(booking.selectedFlights || [])[0].flight.airline} (${(booking.selectedFlights || [])[0].flight.departureTime})` : 'Select...'}
                      </span>
                   </div>
                   <div className="flex flex-col pl-6">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Return Flight</span>
                      <span className="text-xs font-bold text-[var(--color-title)] truncate max-w-[150px]">
                         {(booking.selectedFlights || [])[1] ? `${(booking.selectedFlights || [])[1].flight.airline} (${(booking.selectedFlights || [])[1].flight.departureTime})` : 'Select...'}
                      </span>
                   </div>
                   <div className="pl-6 hidden sm:flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Price</span>
                      <span className="text-xl font-bold text-[var(--color-primary-strong)]">
                         ₹{(Number((booking.selectedFlights || [])[0]?.flight?.minprice || 0) + Number((booking.selectedFlights || [])[1]?.flight?.minprice || 0)).toLocaleString('en-IN')}
                      </span>
                   </div>
                </div>
                <button 
                   onClick={handleConfirmSelection}
                   disabled={!(booking.selectedFlights || [])[0] || !(booking.selectedFlights || [])[1]}
                   className="rounded-lg bg-[var(--color-primary)] text-white px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
                >
                   Continue to Booking
                </button>
             </div>
          </div>
        )}

        {/* Compact Flight Details Popup */}
        {selectedPopup && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 animate-in fade-in duration-300">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl zoom-in-95 overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
              <div className="flex items-center justify-between p-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                      <img src={`https://pics.avs.io/al_64/64/${selectedPopup.icon}.png`} alt="" className="h-5 w-5 object-contain" />
                   </div>
                   <h3 className="text-base font-black text-[var(--color-title)] tracking-tight">{selectedPopup.airline} <span className="text-[10px] text-gray-400">({selectedPopup.flightNumber})</span></h3>
                </div>
                <button onClick={() => setSelectedPopup(null)} className="rounded-full p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4 text-[var(--color-subtle)]" />
                </button>
              </div>
              
              <div className="flex border-b border-gray-50 px-6 gap-6">
                {['Flight Details', 'Fare Details', 'Baggage'].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-subtle)] hover:text-[var(--color-title)]'}`}
                    >
                      {tab}
                    </button>
                ))}
              </div>

              <div className="p-4 flex-1 overflow-y-auto bg-gray-50/20">
                {activeTab === 'Flight Details' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                        <div className="text-center">
                          <p className="text-lg font-black text-[var(--color-title)]">{selectedPopup.departureTime}</p>
                          <p className="text-[9px] font-bold text-[var(--color-subtle)] uppercase">{selectedPopup.departureCode}</p>
                        </div>
                        <div className="flex-1 px-4 text-center">
                           <span className="text-[9px] font-bold text-gray-400 block mb-1">{selectedPopup.duration}</span>
                           <div className="h-px bg-dashed border-t border-dashed border-gray-100 relative">
                              <Plane className="h-3 w-3 text-[var(--color-primary)] absolute left-1/2 -ml-1.5 -mt-1.5 rotate-90 bg-white" />
                           </div>
                           <span className="text-[9px] font-bold text-orange-500 uppercase mt-1 block">{selectedPopup.stops === 0 ? 'Non-Stop' : `${selectedPopup.stops} Stop(s)`}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-[var(--color-title)]">{selectedPopup.arrivalTime}</p>
                          <p className="text-[9px] font-bold text-[var(--color-subtle)] uppercase">{selectedPopup.arrivalCode}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">From</p>
                          <p className="text-xs font-bold text-[var(--color-title)]">{selectedPopup.departureLocation}</p>
                          <p className="text-[9px] text-gray-400">{selectedPopup.terminaldeparture || 'Terminal T1'}</p>
                       </div>
                       <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">To</p>
                          <p className="text-xs font-bold text-[var(--color-title)]">{selectedPopup.arrivalLocation}</p>
                          <p className="text-[9px] text-gray-400">{selectedPopup.terminalarrival || 'Terminal T1'}</p>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Fare Details' && (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                          <tr>
                             <th className="px-4 py-2">Fare Type</th>
                             <th className="px-4 py-2">Class</th>
                             <th className="px-4 py-2 text-right">Price</th>
                             <th className="px-4 py-2 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                           {(selectedPopup.pricingOptions || []).map((po, idx) => (
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
                                          VIEW BREAKDOWN <Info className="h-2.5 w-2.5" />
                                       </div>
                                       <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-56 bg-white border border-gray-100 shadow-2xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-bottom-1 duration-150">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-1.5 mb-2">Price Breakdown</p>
                                          <div className="space-y-1.5">
                                             <div className="flex justify-between text-[10px] items-center">
                                                <span className="text-gray-500 font-bold">Base Fare</span>
                                                <span className="text-[var(--color-title)] font-black">₹{(po.breakdown?.baseFare || 0).toLocaleString('en-IN')}</span>
                                             </div>
                                             <div className="flex justify-between text-[10px] items-center">
                                                <span className="text-gray-500 font-bold">Taxes & Fees</span>
                                                <span className="text-[var(--color-title)] font-black">₹{(po.breakdown?.taxAndCharges || 0).toLocaleString('en-IN')}</span>
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
                                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Per Adult</span>
                                    </div>
                                 </td>
                                 <td className="px-4 py-4 text-right">
                                    <button 
                                       onClick={() => { handleSelect(selectedPopup, false, po.fareIdentifier); setSelectedPopup(null); }}
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
                
                {activeTab === 'Baggage' && (
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
