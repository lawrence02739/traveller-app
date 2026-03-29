import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearBooking } from '../features/bookingSlice';
import { RootState, AppDispatch } from '../store';
import {
  CheckCircle2,
  User, Plane, Loader2,
  Clock, AlertCircle, Check, ChevronsLeft, ChevronsRight,
  Armchair, Briefcase, Coffee
} from 'lucide-react';
import { MainLayout } from '../components/MainLayout';
import { FormField } from '@skyitix/shared';
import { Flight } from '../types/flight';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { flightApi } from '../api/flight.api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { Razorpay: any; } }

const STEPS = ['Flight Itinerary', 'Traveller Information', 'Seats & Extras', 'Review and Confirm', 'Payment'];

const PassengerSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  firstName: Yup.string().min(2, 'Min 2 chars').required('Required'),
  lastName: Yup.string().min(2, 'Min 2 chars').required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().matches(/^\+?[\d\s-]{10,15}$/, 'Invalid number').required('Required'),
  dob: Yup.string().optional(),
  nationality: Yup.string().optional(),
});

export const BookingFlowPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedFlights } = useSelector((state: RootState) => state.booking);
  const filters = useSelector((state: RootState) => state.flight.filters);

  const [step, setStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pnr, setPnr] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay'>('razorpay');

  // Ancillary Selection State
  const [selectedSeats, setSelectedSeats] = useState<{ [fId: string]: string }>({});
  const [selectedBaggage, setSelectedBaggage] = useState<{ [fId: string]: number }>({});
  const [selectedMeals, setSelectedMeals] = useState<{ [fId: string]: string }>({});

  useEffect(() => {
    const validate = async () => {
      if (!selectedFlights?.length || !selectedFlights[0]?.flight) return;
      setIsValidating(true);
      try {
        await Promise.all(selectedFlights.map(item =>
          flightApi.reviewBooking({ flightId: item.flight.id, fareType: item.fareIdentifier })
        ));
      } catch (err) { console.error("Validation failed", err); }
      finally { setIsValidating(false); }
    };
    validate();
  }, [selectedFlights]);

  const formik = useFormik({
    initialValues: { title: 'Mr', firstName: '', lastName: '', email: '', phone: '', dob: '', nationality: 'Indian' },
    validationSchema: PassengerSchema,
    onSubmit: () => { setStep(s => s + 1); window.scrollTo(0, 0); },
  });

  if ((!selectedFlights?.length) && !isSuccess) {
    return (
      <MainLayout>
        <div className="bg-[var(--color-page-bg)] min-h-screen">
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="mx-auto h-20 w-20 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-[var(--color-title)]">No flights selected</h2>
            <p className="mt-3 text-sm text-[var(--color-body)]">Your session may have expired. Please search again.</p>
            <button onClick={() => navigate('/flights')} className="mt-8 rounded bg-[var(--color-primary)] px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow hover:brightness-110">
              Back to Search
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalBasePrice = (selectedFlights || []).reduce((s, f) => s + Number(f.flight.minprice || 0), 0);
  const ancillaryPrice = (selectedFlights || []).reduce((s, f) => {
    const bPrice = selectedBaggage[f.flight.id] ? (selectedBaggage[f.flight.id] * 300) : 0;
    const mPrice = selectedMeals[f.flight.id] ? 650 : 0;
    return s + bPrice + mPrice;
  }, 0);
  const taxes = 35484.5;
  const platformFee = 2175.5;
  const totalPrice = totalBasePrice + ancillaryPrice + taxes + platformFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === 'wallet') {
        setTimeout(() => {
          setPnr(Math.random().toString(36).substring(2, 8).toUpperCase());
          setIsSuccess(true);
          setIsProcessing(false);
          dispatch(clearBooking());
        }, 1500);
      } else {
        // Razorpay logic (placeholder)
        setTimeout(() => {
          setPnr('RZP' + Math.random().toString(36).substring(2, 6).toUpperCase());
          setIsSuccess(true);
          setIsProcessing(false);
          dispatch(clearBooking());
        }, 2000);
      }
    } catch { alert("Failed to start payment."); setIsProcessing(false); }
  };

  const getNextLabel = () => {
    switch (step) {
      case 0: return "PROCEED TO TRAVELLER INFO";
      case 1: return "PROCEED TO SEATS & EXTRAS";
      case 2: return "PROCEED TO REVIEW";
      case 3: return "PROCEED TO PAYMENT";
      case 4: return "CONFIRM AND PAY";
      default: return "NEXT";
    }
  };

  const handleNext = () => {
    if (step === 0 || step === 2 || step === 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else if (step === 1) {
      formik.handleSubmit();
    } else if (step === 4) {
      handlePayment();
    }
  };

  const SegmentCard = ({ item, idx }: { item: { flight: Flight; fareIdentifier: string }; idx: number }) => {
    const isReturning = idx > 0;
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-sm overflow-hidden mb-4">
        <div className="flex items-center justify-between p-4 bg-[var(--color-panel-muted)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${isReturning ? 'bg-orange-500' : 'bg-[var(--color-primary)]'}`}>
              <Plane className={`h-4 w-4 ${isReturning ? 'rotate-180' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-black text-[var(--color-title)] uppercase tracking-wider">
                {isReturning ? 'Return Flight' : 'Departure Flight'}
              </p>
              <p className="text-[10px] text-[var(--color-subtle)] font-bold">{item.flight.departureDate?.split('T')[0] || filters.departureDate}</p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] px-3 py-1 rounded-full uppercase">{item.fareIdentifier}</span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="flex items-center gap-4 col-span-2">
            <img src={`https://pics.avs.io/al_64/64/${item.flight.icon}.png`} className="h-10 w-10 object-contain rounded border border-[var(--color-border)] p-1 bg-white" alt="logo" />
            <div>
              <p className="text-sm font-black text-[var(--color-title)]">{item.flight.airline} · {item.flight.flightNumber}</p>
              <p className="text-[10px] text-[var(--color-body)] font-medium uppercase mt-0.5">{item.flight.class} · {item.flight.duration}</p>
            </div>
          </div>
          <div className="flex justify-between md:contents">
            <div className="text-center">
              <p className="text-lg font-black text-[var(--color-title)] leading-none">{item.flight.departureTime}</p>
              <p className="text-[10px] font-bold text-[var(--color-primary)] mt-1">{item.flight.departureCode}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-4">
              <div className="h-px w-full bg-[var(--color-border)] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-panel-bg)] px-2">
                  <Plane className="h-3 w-3 text-[var(--color-subtle)] rotate-90" />
                </div>
              </div>
              <p className="text-[8px] font-bold text-[var(--color-subtle)] uppercase mt-1 tracking-tighter">{item.flight.stops === 0 ? 'Non Stop' : `${item.flight.stops} Stop(s)`}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-[var(--color-title)] leading-none">{item.flight.arrivalTime}</p>
              <p className="text-[10px] font-bold text-[var(--color-primary)] mt-1">{item.flight.arrivalCode}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-[var(--color-panel-muted)]/50 border-t border-[var(--color-border)] flex gap-4 overflow-x-auto">
          {selectedSeats[item.flight.id] && (
            <div className="text-[10px] font-bold flex items-center gap-1.5 text-[var(--color-primary)] bg-[var(--color-panel-bg)] px-3 py-1 rounded border border-[var(--color-primary)]/20 shadow-sm">
              <Armchair className="h-3 w-3" /> Seat: {selectedSeats[item.flight.id]}
            </div>
          )}
          {selectedBaggage[item.flight.id] > 0 && (
            <div className="text-[10px] font-bold flex items-center gap-1.5 text-[var(--color-primary)] bg-[var(--color-panel-bg)] px-3 py-1 rounded border border-[var(--color-primary)]/20 shadow-sm">
              <Briefcase className="h-3 w-3" /> +{selectedBaggage[item.flight.id]}kg Bag
            </div>
          )}
          {selectedMeals[item.flight.id] && (
            <div className="text-[10px] font-bold flex items-center gap-1.5 text-[var(--color-primary)] bg-[var(--color-panel-bg)] px-3 py-1 rounded border border-[var(--color-primary)]/20 shadow-sm">
              <Coffee className="h-3 w-3" /> {selectedMeals[item.flight.id]}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="bg-[var(--color-page-bg)] min-h-screen py-16 px-4">
          <div className="max-w-xl mx-auto bg-[var(--color-panel-bg)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
            <div className="bg-[var(--color-primary)] p-12 text-center text-white">
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-2 uppercase tracking-wide">Booking Confirmed!</h2>
              <p className="text-white/80 font-bold tracking-widest text-xs uppercase">Your trip is officially booked</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center p-6 bg-[var(--color-panel-muted)] rounded-2xl border border-[var(--color-border)]">
                <div>
                  <p className="text-[10px] font-black text-[var(--color-subtle)] uppercase mb-1">PNR NUMBER</p>
                  <p className="text-2xl font-black text-[var(--color-primary-strong)] tracking-widest">{pnr}</p>
                </div>
                <div className="h-16 w-16 bg-white p-2 rounded-lg border border-[var(--color-border)]">
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">QR CODE</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[var(--color-title)] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[var(--color-page-bg)] min-h-screen font-sans pb-24">
        {/* ── Top Stepper Navbar ── */}
        <div className="bg-[var(--color-primary)] w-full sticky top-0 z-40 shadow-lg">
          <div className="flex w-full items-center max-w-7xl mx-auto">
            {STEPS.map((s, i) => {
              const active = i === step;
              const past = i < step;
              return (
                <div key={s} className="flex flex-1 items-center px-4 py-4 relative group">
                  <div className="flex items-center gap-3 z-10">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black border-2 transition-all duration-300 ${past ? 'bg-green-500 border-green-500 text-white' : active ? 'bg-white border-white text-[var(--color-primary)] shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-transparent border-white/20 text-white/20'
                      }`}>
                      {past ? <Check className="h-4 w-4" strokeWidth={4} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${active || past ? 'text-white' : 'text-white/30'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 px-4 pointer-events-none translate-x-8">
                      <div className={`h-[2px] w-full transition-all duration-500 ${past ? 'bg-green-500' : 'bg-white/10'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {step < 4 && (
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-8 space-y-6">
                {/* STEP 0: Itinerary */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-[var(--color-title)] uppercase tracking-tight">Review Itinerary</h2>
                      {isValidating && <span className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]"><Loader2 className="h-4 w-4 animate-spin" /> Live Validation...</span>}
                    </div>
                    {selectedFlights.map((item, idx) => <SegmentCard key={idx} item={item} idx={idx} />)}
                  </div>
                )}

                {/* STEP 1: Travellers */}
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-black text-[var(--color-title)] uppercase">Traveller Details</h2>
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-8 shadow-xl shadow-[var(--color-primary)]/5">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="h-12 w-12 rounded-2xl bg-[var(--color-primary-soft)] flex items-center justify-center shadow-inner"><User className="h-6 w-6 text-[var(--color-primary)]" /></div>
                          <div>
                            <p className="text-sm font-black text-[var(--color-title)] uppercase tracking-wider">Primary Passenger</p>
                            <p className="text-[10px] font-bold text-[var(--color-subtle)] uppercase">Adult 1</p>
                          </div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--color-body)] uppercase ml-1">Title</label>
                            <select name="title" value={formik.values.title} onChange={formik.handleChange} className="w-full bg-[var(--color-page-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--color-title)] outline-none focus:border-[var(--color-primary)]">
                              <option>Mr</option><option>Mrs</option><option>Ms</option>
                            </select>
                          </div>
                          <FormField kind="input" label="First Name" name="firstName" value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : undefined} />
                          <FormField kind="input" label="Last Name" name="lastName" value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.lastName && formik.errors.lastName ? formik.errors.lastName : undefined} />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 mt-6 pt-6 border-t border-[var(--color-border)]">
                          <FormField kind="input" type="email" label="Email Address" name="email" value={formik.values.email} onChange={formik.handleChange} />
                          <FormField kind="input" type="tel" label="Phone Number" name="phone" value={formik.values.phone} onChange={formik.handleChange} />
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* STEP 2: Seats & Extras */}
                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-black text-[var(--color-title)] uppercase">Customize Trip</h2>
                    {selectedFlights.map((item, i) => (
                      <div key={i} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-xl overflow-hidden group">
                        <div className="bg-[var(--color-panel-muted)] px-8 py-4 border-b border-[var(--color-border)] flex justify-between items-center group-hover:bg-[var(--color-primary-soft)]/20 transition-colors">
                          <p className="text-xs font-black text-[var(--color-title)] uppercase tracking-[0.2em]">{item.flight.departureCode} → {item.flight.arrivalCode}</p>
                          <span className="text-[10px] font-bold text-[var(--color-primary)] bg-white px-3 py-1 rounded-full shadow-sm">{item.flight.airline}</span>
                        </div>
                        <div className="p-8 grid gap-10 md:grid-cols-3">
                          <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--color-subtle)]"><Armchair className="h-4 w-4 text-[var(--color-primary)]" /> Select Seat</label>
                            <div className="grid grid-cols-4 gap-2">
                              {['6A', '6B', '6C', '6D', '7A', '7B', '7C', '7D'].map(s => (
                                <button key={s} onClick={() => setSelectedSeats(prev => ({ ...prev, [item.flight.id]: s }))} className={`h-9 w-9 rounded-lg text-[10px] font-black transition-all ${selectedSeats[item.flight.id] === s ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-[var(--color-page-bg)] text-[var(--color-body)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}>{s}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--color-subtle)]"><Briefcase className="h-4 w-4 text-[var(--color-primary)]" /> Extra Bag</label>
                            <div className="space-y-3">
                              {([0, 5, 10, 20]).map(b => (
                                <button key={b} onClick={() => setSelectedBaggage(prev => ({ ...prev, [item.flight.id]: b }))} className={`w-full p-3 rounded-xl border text-[10px] font-black flex justify-between transition-all ${selectedBaggage[item.flight.id] === b || (!selectedBaggage[item.flight.id] && b === 0) ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary-strong)]' : 'bg-[var(--color-page-bg)] border-[var(--color-border)] text-[var(--color-body)]'}`}>
                                  <span>{b === 0 ? 'Basic (15kg)' : `+${b}kg Baggage`}</span>
                                  <span className="opacity-60">{b === 0 ? 'FREE' : `₹${b * 300}`}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--color-subtle)]"><Coffee className="h-4 w-4 text-[var(--color-primary)]" /> Meals</label>
                            <div className="space-y-3">
                              {(['No Meal', 'Standard Veg', 'Standard Non-Veg']).map(m => (
                                <button key={m} onClick={() => setSelectedMeals(prev => ({ ...prev, [item.flight.id]: m }))} className={`w-full p-3 rounded-xl border text-[10px] font-black flex justify-between transition-all ${selectedMeals[item.flight.id] === m || (!selectedMeals[item.flight.id] && m === 'No Meal') ? 'bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary-strong)]' : 'bg-[var(--color-page-bg)] border-[var(--color-border)] text-[var(--color-body)]'}`}>
                                  <span>{m}</span>
                                  <span className="opacity-60">{m === 'No Meal' ? 'FREE' : '₹650'}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 3: Review */}
                {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-black text-[var(--color-title)] uppercase">Summary Review</h2>
                    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-8 shadow-xl">
                      <h3 className="text-xs font-black text-[var(--color-subtle)] uppercase tracking-widest border-b border-[var(--color-border)] pb-4 mb-6">Confirmed Selections</h3>
                      {selectedFlights.map((item, idx) => (
                        <div key={idx} className="mb-6 pb-6 border-b border-[var(--color-page-bg)] last:border-0 last:pb-0">
                          <p className="text-sm font-black text-[var(--color-title)]">{item.flight.airline} · {item.flight.flightNumber} ({item.flight.departureCode}→{item.flight.arrivalCode})</p>
                          <div className="flex gap-4 mt-3">
                            {selectedSeats[item.flight.id] && <div className="text-[10px] font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] px-3 py-1 rounded-full flex items-center gap-1.5"><Armchair className="h-3 w-3" /> Seat {selectedSeats[item.flight.id]}</div>}
                            {selectedBaggage[item.flight.id] > 0 && <div className="text-[10px] font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] px-3 py-1 rounded-full flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> +{selectedBaggage[item.flight.id]}kg Bag</div>}
                            {selectedMeals[item.flight.id] && selectedMeals[item.flight.id] !== 'No Meal' && <div className="text-[10px] font-bold bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] px-3 py-1 rounded-full flex items-center gap-1.5"><Coffee className="h-3 w-3" /> {selectedMeals[item.flight.id]}</div>}
                          </div>
                        </div>
                      ))}
                      <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
                        <p className="text-[10px] font-black text-[var(--color-subtle)] uppercase mb-2">PASSENGER</p>
                        <p className="text-base font-black text-[var(--color-title)]">{formik.values.title} {formik.values.firstName} {formik.values.lastName}</p>
                        <p className="text-xs font-bold text-[var(--color-body)]">{formik.values.email} · {formik.values.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-2xl overflow-hidden">
                  <div className="bg-[var(--color-panel-muted)] p-6 border-b border-[var(--color-border)]">
                    <h3 className="text-xs font-black text-[var(--color-title)] uppercase tracking-widest">Price Breakdown</h3>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-body)] font-medium">Standard Fare</span>
                      <span className="font-black text-[var(--color-title)]">₹{totalBasePrice.toLocaleString('en-IN')}</span>
                    </div>
                    {ancillaryPrice > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--color-body)] font-medium">Extras & Add-ons</span>
                        <span className="font-black text-green-600">+ ₹{ancillaryPrice.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-body)] font-medium">Fee & Taxes</span>
                      <span className="font-black text-[var(--color-title)]">₹{taxes.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-6 mt-6 bg-[var(--color-primary-soft)]/30 rounded-2xl flex justify-between items-end border border-[var(--color-primary)]/10">
                      <span className="text-[10px] font-black text-[var(--color-primary-strong)] uppercase">Total Amount</span>
                      <span className="text-2xl font-black text-[var(--color-primary)]">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Payment */}
          {step === 4 && (
            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto items-stretch animate-in fade-in duration-700">
              <div className="w-full lg:w-72 space-y-3 bg-[var(--color-panel-muted)] p-8 rounded-3xl border border-[var(--color-border)]">
                <h4 className="text-[10px] font-black text-[var(--color-subtle)] uppercase tracking-widest mb-4 px-2">PAYMENT MODE</h4>
                <div onClick={() => setPaymentMethod('wallet')} className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 font-black text-xs uppercase tracking-widest border-2 ${paymentMethod === 'wallet' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/30' : 'bg-transparent text-[var(--color-body)] border-transparent hover:bg-white/40'}`}>Wallet</div>
                <div onClick={() => setPaymentMethod('razorpay')} className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 font-black text-xs uppercase tracking-widest border-2 ${paymentMethod === 'razorpay' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/30' : 'bg-transparent text-[var(--color-body)] border-transparent hover:bg-white/40'}`}>Razor Pay</div>
              </div>

              <div className="flex-1 bg-[var(--color-panel-bg)] p-12 rounded-3xl border border-[var(--color-border)] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-primary)]" />
                <h3 className="text-sm font-black text-[var(--color-subtle)] uppercase tracking-[0.3em] mb-12">SECURE PAYMENT GATEWAY</h3>
                <div className="max-w-md space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--color-body)]">Total Base Amount</span>
                    <span className="text-lg font-black text-[var(--color-title)]">₹{totalBasePrice + ancillaryPrice + taxes}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <span>Platform Processing Fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="pt-8 mt-8 border-t border-[var(--color-border)] flex justify-between items-center">
                    <span className="text-base font-black text-[var(--color-title)]">NET PAYABLE</span>
                    <span className="text-3xl font-black text-[var(--color-primary)]">₹{totalPrice}</span>
                  </div>
                  <div className="bg-[var(--color-panel-muted)] p-8 rounded-2xl mt-12 flex flex-col gap-6">
                    <div className="flex items-center justify-between text-xs font-black text-[var(--color-body)]">
                      <span>Balance</span>
                      <span className="text-[var(--color-title)]">₹4,399,817.00</span>
                    </div>
                    <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-[var(--color-primary)] text-white py-5 rounded-xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-[var(--color-primary)]/40 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-3">
                      {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                      {paymentMethod === 'wallet' ? 'Confirm & Process via Wallet' : 'Proceed with Razorpay'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {!isSuccess && (
          <div className="fixed bottom-8 left-0 right-0 bg-[var(--color-primary)] text-white px-8 py-4 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-white/10">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-white/20 disabled:opacity-20 transition-all"
            >
              <ChevronsLeft className="h-4 w-4" /> Go Back
            </button>
            <div className="hidden md:flex items-center gap-3 text-[10px] font-black opacity-80 uppercase tracking-widest">
              <Clock className="h-4 w-4" />
              <span>Session ends in <span className="text-white">01:10</span></span>
            </div>
            <button
              disabled={isProcessing || isValidating}
              onClick={handleNext}
              className="flex items-center gap-2 bg-white text-[var(--color-primary)] px-8 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-white/90 active:scale-95 transition-all shadow-xl"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              {getNextLabel()} <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
