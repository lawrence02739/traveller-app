import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFlights, selectFlight } from '../features/flightSlice';
import { AppDispatch, RootState } from '../store';
import { Plane, Info, X } from 'lucide-react';
import { Flight } from '../types/flight';
import { MainLayout } from '../components/MainLayout';
import { SearchForm } from '../components/SearchForm';

export const FlightListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { flights, returnFlights, multiCityFlights, loading, filters } = useSelector((state: RootState) => state.flight);
  
  const [selectedPopup, setSelectedPopup] = useState<Flight | null>(null);
  const [showModifyPopup, setShowModifyPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('Flight Details');
  
  // Sorting state
  const [sortField, setSortField] = useState<'price' | 'departure' | 'arrival' | 'airline' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Filters State
  const [selectedAirline, setSelectedAirline] = useState<string>('');
  const [priceMax, setPriceMax] = useState<number>(100000);

  useEffect(() => {
    dispatch(fetchFlights(filters));
  }, [dispatch, filters]);

  const handleBook = (flight: Flight) => {
    dispatch(selectFlight(flight));
    navigate(`/book/${flight.id}`);
  };

  const isMulti = filters.tripType === 'multi_city';
  const isRound = filters.tripType === 'round_trip';

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
     let result = [...list];
     
     // Filter
     if (selectedAirline) {
       result = result.filter(f => f.airline.toLowerCase().includes(selectedAirline.toLowerCase()));
     }
     if (priceMax < 100000) {
       result = result.filter(f => Number(f.minprice) <= priceMax);
     }

     // Sort
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
  // For multi-city, we map each array
  const displayedMultiCityFlights = multiCityFlights.map(arr => applySortAndFilter(arr));

  const renderFlightCard = (flight: Flight) => (
    <div key={flight.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-sm overflow-hidden p-4 sm:p-6 pb-2 mb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between pb-6 gap-6 sm:gap-2">
        <div className="flex w-full sm:w-auto sm:flex-1 items-center gap-4">
          <div className="h-10 w-10 shrink-0 rounded bg-[var(--color-primary-soft)] flex items-center justify-center">
            <Plane className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-title)]">{flight.airline}</p>
            <p className="text-xs text-[var(--color-subtle)]">{flight.flightNumber}</p>
          </div>
        </div>

        <div className="flex flex-1 w-full justify-between sm:justify-center items-center gap-4">
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-[var(--color-title)]">{flight.departureTime}</p>
            <p className="text-xs text-[var(--color-subtle)]">{flight.departureCode || filters.origin}</p>
          </div>

          <div className="flex flex-col items-center px-4">
            <p className="text-xs font-semibold text-[var(--color-body)] mb-1">{flight.duration}</p>
            <div className="h-[2px] w-16 sm:w-24 bg-green-500 rounded-full indicator" />
            <p className="text-[10px] text-[var(--color-subtle)] mt-1 tracking-widest uppercase">{flight.stops === 0 ? 'Non Stop' : `${flight.stops} Stop(s)`}</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-[var(--color-title)]">{flight.arrivalTime}</p>
            <p className="text-xs text-[var(--color-subtle)]">{flight.arrivalCode || filters.destination}</p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-0 border-t border-[var(--color-border)]">
        {(flight.pricingOptions || []).map((fare, idx) => {
          let badgeColor = 'bg-gray-500';
          if (fare.fareIdentifier === 'PUBLISHED') badgeColor = 'bg-green-500';
          if (fare.fareIdentifier === 'SME') badgeColor = 'bg-emerald-600';
          if (fare.fareIdentifier === 'FLEXI_PLUS') badgeColor = 'bg-blue-500';
          if (fare.fareIdentifier === 'STRETCH') badgeColor = 'bg-[#F15A3F]';

          return (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-border)] py-4 last:border-0 hover:bg-[var(--color-panel-muted)] -mx-4 sm:-mx-6 px-4 sm:px-6 transition-colors gap-4">
              <div className="flex items-center justify-between sm:justify-start sm:w-48 gap-3">
                <span className="text-xs font-bold text-[var(--color-title)]">{fare.class}</span>
                <span className={`${badgeColor} rounded px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm`}>{fare.fareIdentifier}</span>
              </div>
              
              <button onClick={() => setSelectedPopup(flight)} className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-strong)] text-left sm:text-center transition-colors">
                View Flight Details
              </button>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="flex items-start">
                  <span className="text-xl font-extrabold text-[var(--color-title)]">₹{fare.price}</span>
                  <Info className="ml-1 h-3 w-3 text-[var(--color-subtle)]" />
                </div>
                <button 
                  onClick={() => {
                    if (isMulti || isRound) {
                       // Typically we append to a selected flights list or navigate 
                       dispatch(selectFlight(flight));
                       navigate(`/book/${flight.id}`);
                    } else {
                       handleBook(flight);
                    }
                  }}
                  className="rounded-lg bg-[var(--color-primary-strong)] px-6 py-2.5 text-sm font-bold text-[var(--color-on-primary)] shadow-md hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                >
                  {isMulti || isRound ? 'Select' : 'Book Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="bg-[var(--color-page-bg)] pb-12 min-h-screen">
        <div className="bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-colors duration-300">
          <div className="mx-auto flex h-auto sm:h-[72px] flex-col sm:flex-row max-w-7xl items-center justify-between px-6 py-4 sm:py-0">
            {isMulti ? (
              <div className="flex flex-wrap w-full sm:w-auto items-center text-sm gap-y-4">
                {[1,2,3].map((num) => (
                   <div key={num} className="flex flex-col items-center justify-center px-4 border-r border-white/20 last:border-0 hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">
                     <span className="font-bold flex items-center gap-1">Trip {num}</span>
                     <span className="text-[10px]">Select Flight</span>
                   </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap w-full sm:w-auto items-center sm:divide-x divide-white/20 text-sm gap-y-4">
                <div className="flex items-center pr-6 w-1/2 sm:w-auto">
                  <div className="text-left sm:text-center font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{filters.origin}</span>
                      <Plane className="h-4 w-4 rotate-45" />
                      <span className="text-lg">{filters.destination}</span>
                    </div>
                  </div>
                </div>
                <div className="sm:px-6 flex flex-col justify-center w-1/2 sm:w-auto">
                  <span className="font-bold">Departure Date</span>
                  <span className="text-xs font-normal">{formatHeaderDate(filters.departureDate)}</span>
                </div>
                {isRound && (
                  <div className="sm:px-6 flex flex-col justify-center w-1/2 sm:w-auto">
                    <span className="font-bold">Return Date</span>
                    <span className="text-xs font-normal">{formatHeaderDate(filters.returnDate || '') || 'Not Selected'}</span>
                  </div>
                )}
                <div className="sm:px-6 flex flex-col justify-center w-1/2 sm:w-auto">
                  <span className="font-bold">Travellers & Class</span>
                  <span className="text-xs font-normal uppercase">{filters.passengers} TRAVELLERS | {filters.travelClass}</span>
                </div>
              </div>
            )}
            
            <div className="w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
              <button 
                onClick={() => setShowModifyPopup(true)}
                className="rounded px-4 py-2 text-xs font-bold bg-[var(--color-primary-strong)] hover:scale-[1.03] shadow-md transition-all flex items-center gap-2"
              >
                MODIFY SEARCH <span>▼</span>
              </button>
            </div>
          </div>
        </div>

        {showModifyPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-6xl rounded-2xl bg-[var(--color-panel-bg)] shadow-2xl zoom-in-95 overflow-hidden flex flex-col max-h-[90vh] pb-10 border border-[var(--color-border)]">
              <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-bold text-[var(--color-title)]">Modify Search</h3>
                <button onClick={() => setShowModifyPopup(false)} className="rounded-full p-2 hover:bg-[var(--color-panel-muted)]"><X className="h-5 w-5 text-[var(--color-subtle)]" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <SearchForm onSearchCallback={() => setShowModifyPopup(false)} />
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto mt-6 flex flex-col lg:flex-row max-w-7xl gap-6 px-4 sm:px-6 relative items-start">
          <div className="flex-1 w-full relative z-0">
            <div className="hidden sm:flex mb-4 rounded-t-lg bg-[var(--color-panel-bg)] p-4 shadow-sm text-sm font-bold text-[var(--color-title)] justify-between items-center px-8 border-b-2 border-[var(--color-primary)] transition-colors">
              <div className="flex-1 text-left cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('airline')}>
                Airlines {sortField === 'airline' ? (sortAsc ? '↑' : '↓') : '↕'}
              </div>
              <div className="flex-1 text-center cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('departure')}>
                Departure {sortField === 'departure' ? (sortAsc ? '↑' : '↓') : '↕'}
              </div>
              <div className="flex-1 text-center cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('price')}>
                Price {sortField === 'price' ? (sortAsc ? '↑' : '↓') : '↕'}
              </div>
              <div className="flex-1 text-right cursor-pointer hover:text-[var(--color-primary)]" onClick={() => handleSort('arrival')}>
                Arrival {sortField === 'arrival' ? (sortAsc ? '↑' : '↓') : '↕'}
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <>
                  <div className="rounded-xl border border-dashed border-[var(--color-primary-soft)] bg-[var(--color-panel-bg)]/50 p-6 h-48 w-full animate-pulse"></div>
                  <div className="rounded-xl border border-dashed border-[var(--color-primary-soft)] bg-[var(--color-panel-bg)]/50 p-6 h-48 w-full animate-pulse delay-75"></div>
                </>
              ) : (
                <>
                  {isMulti ? (
                    displayedMultiCityFlights.map((list, listIdx) => (
                      <div key={listIdx} className="mb-8">
                        <h3 className="text-xl font-bold text-[var(--color-title)] mb-4">Trip {listIdx + 1} Flights</h3>
                        {list.length > 0 ? list.map(renderFlightCard) : <p className="text-[var(--color-subtle)]">No flights found.</p>}
                      </div>
                    ))
                  ) : isRound ? (
                    <>
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-[var(--color-title)] mb-4">Onward Flights ({filters.origin} to {filters.destination})</h3>
                        {displayedFlights.length > 0 ? displayedFlights.map(renderFlightCard) : <p className="text-[var(--color-subtle)]">No flights found.</p>}
                      </div>
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-[var(--color-title)] mb-4">Return Flights ({filters.destination} to {filters.origin})</h3>
                        {displayedReturnFlights.length > 0 ? displayedReturnFlights.map(renderFlightCard) : <p className="text-[var(--color-subtle)]">No flights found.</p>}
                      </div>
                    </>
                  ) : (
                    displayedFlights.length > 0 ? displayedFlights.map(renderFlightCard) : <p className="text-[var(--color-subtle)]">No flights found.</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[300px] shrink-0 lg:sticky top-[88px] z-10">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 shadow-sm">
              <h3 className="mb-6 text-xl font-bold text-[var(--color-title)]">Flight Filters</h3>

              <div className="space-y-6 divide-y divide-[var(--color-border)]">
                <div className="pt-4 first:pt-0">
                  <div className="flex flex-col gap-2 font-semibold text-[var(--color-title)]">
                    <span className="flex justify-between items-center cursor-pointer">
                      <span>Airlines</span><span>▼</span>
                    </span>
                    <input 
                      type="text" 
                      placeholder="Filter airline..." 
                      className="mt-2 text-sm p-2 border border-[var(--color-border)] rounded w-full bg-[var(--color-page-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      value={selectedAirline}
                      onChange={e => setSelectedAirline(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex flex-col gap-2 font-semibold text-[var(--color-title)]">
                    <span className="flex justify-between items-center cursor-pointer">
                      <span>Fare Range Max</span><span>▲</span>
                    </span>
                    <input 
                      type="range" min="1000" max="100000" step="500" 
                      value={priceMax} 
                      onChange={e => setPriceMax(Number(e.target.value))} 
                      className="w-full accent-[var(--color-primary)] mt-2" 
                    />
                    <div className="flex justify-between text-xs font-semibold text-[var(--color-subtle)]">
                      <span>₹0</span>
                      <span>₹{priceMax >= 100000 ? 'Any' : priceMax}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-3xl rounded-2xl bg-[var(--color-panel-bg)] shadow-2xl zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-bold text-[var(--color-title)]">Flight Details</h3>
                <button onClick={() => setSelectedPopup(null)} className="rounded-full p-2 hover:bg-[var(--color-panel-muted)] transition-colors">
                  <X className="h-5 w-5 text-[var(--color-subtle)]" />
                </button>
              </div>
              
              <div className="flex border-b border-[var(--color-border)] px-6 gap-8 text-[var(--color-title)]">
                {['Flight Details', 'Fare Details', 'Fare Rules', 'Baggage Details'].map((tab, i) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-subtle)] hover:text-[var(--color-title)]'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 bg-[var(--color-page-bg)] flex-1 overflow-y-auto">
                <div className="bg-[var(--color-panel-bg)] p-4 text-sm font-bold border border-[var(--color-border)] rounded-md mb-6 shadow-sm text-[var(--color-title)]">
                  {selectedPopup.departureCode || filters.origin} → {selectedPopup.arrivalCode || filters.destination} | {formatHeaderDate(selectedPopup.departureDate)}
                </div>
                
                {activeTab === 'Flight Details' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-[var(--color-panel-bg)] p-8 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-[var(--color-primary-soft)] flex items-center justify-center">
                        <Plane className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-lg text-[var(--color-title)]">{selectedPopup.airline}</h4>
                        <p className="text-sm text-[var(--color-subtle)]">{selectedPopup.flightNumber}</p>
                      </div>
                    </div>

                    <div className="flex-1 flex justify-center w-full">
                      <div className="flex items-center full-w justify-between gap-4 w-full">
                        <div className="text-center w-1/3">
                          <p className="text-2xl font-black text-[var(--color-title)]">{selectedPopup.departureTime}</p>
                          <p className="text-xs text-[var(--color-subtle)] mt-2">{selectedPopup.departure}<br/>Terminal {selectedPopup.terminaldeparture || 'N/A'}</p>
                        </div>

                        <div className="flex flex-col items-center px-4 flex-1">
                          <div className="flex items-center w-full justify-center text-[var(--color-subtle)]">
                            <hr className="flex-1 border-dashed border-[var(--color-border)]" />
                            <div className="bg-[var(--color-panel-muted)] text-[var(--color-body)] rounded-full px-2 py-1 mx-2 flex text-[10px] items-center font-bold font-sans">
                              {selectedPopup.duration}
                            </div>
                            <hr className="flex-1 border-dashed border-[var(--color-border)]" />
                          </div>
                          <p className="text-xs text-[var(--color-subtle)] font-semibold tracking-wider mt-2">{selectedPopup.stops === 0 ? 'Non Stop' : `${selectedPopup.stops} Stop(s)`}</p>
                        </div>

                        <div className="text-center w-1/3">
                          <p className="text-2xl font-black text-[var(--color-title)]">{selectedPopup.arrivalTime}</p>
                          <p className="text-xs text-[var(--color-subtle)] mt-2">{selectedPopup.arrival}<br/>Terminal {selectedPopup.terminalarrival || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Fare Details' && (
                  <div className="bg-[var(--color-panel-bg)] rounded-xl border border-[var(--color-border)] p-6">
                    {(selectedPopup.pricingOptions || []).map((po, idx) => (
                      <div key={idx} className="mb-6 last:mb-0 border-b border-[var(--color-border)] pb-4 last:border-0">
                         <h4 className="font-bold text-lg mb-2 text-[var(--color-title)]">{po.fareIdentifier} ({po.class})</h4>
                         <div className="flex justify-between text-sm py-1 border-b border-dashed border-[var(--color-border)]"><span className="text-[var(--color-subtle)]">Base Fare</span> <span className="font-bold text-[var(--color-title)]">₹{po.breakdown.baseFare}</span></div>
                         <div className="flex justify-between text-sm py-1 border-b border-dashed border-[var(--color-border)]"><span className="text-[var(--color-subtle)]">Taxes & Charges</span> <span className="font-bold text-[var(--color-title)]">₹{po.breakdown.taxAndCharges}</span></div>
                         <div className="flex justify-between text-sm py-2"><span className="font-bold text-[var(--color-title)]">Total Price</span> <span className="font-bold text-lg text-[var(--color-primary-strong)]">₹{po.price}</span></div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'Baggage Details' && (
                   <div className="bg-[var(--color-panel-bg)] rounded-xl border border-[var(--color-border)] p-6">
                     <p className="text-sm text-[var(--color-subtle)] mb-4">Baggage allowance may vary depending on the chosen fare class. Typical allowances:</p>
                     <ul className="list-disc pl-5 text-sm font-semibold text-[var(--color-title)] space-y-2">
                        <li>Cabin Baggage: 7 KG</li>
                        <li>Check-in Baggage: 15 KG (for Published / Flexible)</li>
                     </ul>
                   </div>
                )}

                 {activeTab === 'Fare Rules' && (
                   <div className="bg-[var(--color-panel-bg)] rounded-xl border border-[var(--color-border)] p-6">
                     <p className="text-sm text-[var(--color-subtle)]">Fare rules apply based on the airline policy for the selected class.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating actions for multi-city / round trip */}
        {(isMulti || isRound) && (
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-panel-bg)] border-t border-[var(--color-border)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] py-4 px-6 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div className="flex items-center text-sm font-bold text-[var(--color-title)]">
                  <span>{isMulti ? 'Multi-City Booking' : 'Round Trip Booking'}</span>
               </div>
               <div className="flex items-center gap-6">
                 <button onClick={() => navigate('/book/confirm')} className="bg-[var(--color-primary)] hover:brightness-110 text-[var(--color-on-primary)] px-8 py-3 rounded-lg font-bold shadow-md transition-all">Confirm Booking</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
