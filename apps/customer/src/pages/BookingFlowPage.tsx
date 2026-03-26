import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { clearBooking } from '../features/bookingSlice';
import { RootState, AppDispatch } from '../store';
import { CheckCircle2, ChevronRight, CreditCard, ShieldCheck, User, Plane, Info, Loader2 } from 'lucide-react';
import { FormField } from '@skyitix/shared';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { flightApi } from '../api/flight.api';

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any; // External SDK, keeping as any for now but rule is now a warning
  }
}

const STEPS = ['Itinerary', 'Passenger', 'Review', 'Payment'];

const PassengerSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'Requires at least 2 characters').required('First name is required'),
  lastName: Yup.string().min(2, 'Requires at least 2 characters').required('Last name is required'),
  email: Yup.string().email('Must be a valid email').required('Email is required'),
  phone: Yup.string().matches(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number format').required('Phone number is required'),
});

export const BookingFlowPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { selectedFlights } = useSelector((state: RootState) => state.booking);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pnr, setPnr] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Auto-validate itinerary on mount
  useEffect(() => {
    const validate = async () => {
      if (!selectedFlights || selectedFlights.length === 0 || !selectedFlights[0]?.flight) return;
      
      setIsValidating(true);
      try {
        // Validate each selected flight if needed, currently reviewing the primary leg
        await Promise.all(
          selectedFlights.map(item => 
            flightApi.reviewBooking({
              flightId: item.flight.id,
              fareType: item.fareIdentifier
            })
          )
        );
      } catch (err) {
        console.error("Itinerary validation failed", err);
      } finally {
        setIsValidating(false);
      }
    };
    validate();
  }, [selectedFlights]);

  const [passenger, setPassenger] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const formik = useFormik({
    initialValues: passenger,
    validationSchema: PassengerSchema,
    onSubmit: (values) => {
      setPassenger(values);
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    },
  });

  if ((!selectedFlights || selectedFlights.length === 0) && !isSuccess) {
    return (
      <MainLayout>
        <div className="text-center py-16 bg-gray-50 rounded-2xl m-6 border border-dashed border-gray-200">
          <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[var(--color-title)]">Booking session expired</h2>
          <p className="mt-2 text-sm text-[var(--color-subtle)]">Please search and select your flights again.</p>
          <button onClick={() => navigate('/flights')} className="mt-8 rounded-lg bg-[var(--color-primary)] px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md hover:brightness-110">Back to Search</button>
        </div>
      </MainLayout>
    );
  }

  const totalPrice = (selectedFlights || []).reduce((sum, f) => sum + Number(f.flight.minprice || 0), 0);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Acknowledge
      const primaryItem = selectedFlights[0];
      const ackPayload = {
        bookingId: primaryItem.flight.id,
        sri: primaryItem.flight.pricingOptions?.find(po => po.fareIdentifier === primaryItem.fareIdentifier)?.sri,
        msri: primaryItem.flight.pricingOptions?.find(po => po.fareIdentifier === primaryItem.fareIdentifier)?.msri,
        passengers: [{ 
          title: 'Mr', 
          firstName: passenger.firstName, 
          lastName: passenger.lastName, 
          type: 'ADULT',
          email: passenger.email,
          phone: passenger.phone
        }],
        fareType: primaryItem.fareIdentifier
      };
      
      const ackResponse = await flightApi.acknowledgeBooking(ackPayload);
      const bookingRef = ackResponse?.bookingRef || `BT-${Date.now()}`;

      // 2. Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_placeholder",
        amount: totalPrice * 100,
        currency: "INR",
        name: "Skyitix Travel",
        description: `Booking: ${selectedFlights[0].flight.departureCode} - ${selectedFlights[0].flight.arrivalCode}`,
        handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const confirmPayload = {
              bookingRef,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            };
            const confirmResponse = await flightApi.confirmBooking(confirmPayload);
            setPnr(confirmResponse?.pnr || Math.random().toString(36).substring(2, 8).toUpperCase());
            setIsSuccess(true);
            window.scrollTo(0, 0);
          } catch {
            alert("Payment recorded but confirmation failed. Contact support.");
          } finally {
             setIsProcessing(false);
          }
        },
        prefill: {
          name: `${passenger.firstName} ${passenger.lastName}`,
          email: passenger.email,
          contact: passenger.phone
        },
        theme: { color: "#0F52BA" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch {
      alert("Failed to initiate booking. Try again.");
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-xl py-16 text-center animate-in zoom-in duration-500">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-8 border border-green-200">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-[var(--color-title)] tracking-tight">Booking confirmed!</h1>
          <p className="mt-4 text-sm text-[var(--color-body)]">
            A copy of your e-ticket has been sent to <span className="text-[var(--color-primary-strong)] font-bold">{passenger.email}</span>
          </p>
          
          <div className="mt-10 rounded-3xl border-2 border-dashed border-gray-100 bg-white p-8">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">PNR / ORDER REFERENCE</p>
            <p className="text-4xl font-mono font-black tracking-widest text-[var(--color-primary-strong)]">{pnr}</p>
          </div>

          <div className="mt-12 flex gap-3 justify-center">
            <button onClick={() => { dispatch(clearBooking()); navigate('/'); }} className="rounded-xl bg-[var(--color-primary)] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:brightness-110">DONE</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 font-sans">
        {/* Compact Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              return (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-black text-[10px] transition-all ${
                      isActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' :
                      isPast ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]' :
                      'border-gray-200 bg-white text-gray-300'
                    }`}>
                      {isPast ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>{step}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 rounded-full ${isPast ? 'bg-[var(--color-primary)]' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8">
            {currentStep === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                     <h2 className="text-xl font-black text-[var(--color-title)] uppercase tracking-tight">Review Itinerary</h2>
                     {isValidating && <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400"><Loader2 className="h-3 w-3 animate-spin" /> VALIDATING...</span>}
                  </div>
                  
                  <div className="space-y-6">
                    {selectedFlights.map((item, idx) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-dashed border-gray-100 py-1">
                        <div className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm ${idx === 0 ? 'bg-blue-600' : 'bg-orange-500'}`} />
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                                <img src={`https://pics.avs.io/al_64/64/${item.flight.icon}.png`} alt="" className="h-5 w-5 object-contain" />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-[var(--color-title)]">{item.flight.airline} <span className="text-gray-400 font-bold ml-1">{item.flight.flightNumber}</span></p>
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{item.fareIdentifier} FARE</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                             <div className="text-center">
                                <p className="text-sm font-black text-[var(--color-title)]">{item.flight.departureTime}</p>
                                <p className="text-[9px] font-bold text-gray-400">{item.flight.departureCode}</p>
                             </div>
                             <div className="flex flex-col items-center min-w-[60px]">
                                <span className="text-[8px] font-black text-gray-300 uppercase">{item.flight.duration}</span>
                                <div className="w-8 h-[1px] bg-gray-100 flex items-center justify-center"><Plane className={`h-2 w-2 text-gray-200 ${idx === 1 ? '-rotate-90' : 'rotate-90'}`} /></div>
                             </div>
                             <div className="text-center">
                                <p className="text-sm font-black text-[var(--color-title)]">{item.flight.arrivalTime}</p>
                                <p className="text-[9px] font-bold text-gray-400">{item.flight.arrivalCode}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                   <button onClick={() => setCurrentStep(1)} className="rounded-lg bg-[var(--color-primary)] px-10 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:brightness-110 flex items-center gap-2">
                     Next: Traveler Details <ChevronRight className="h-4 w-4" />
                   </button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <form onSubmit={formik.handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-[var(--color-title)] uppercase tracking-tight mb-6">Traveler Details</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField kind="input" label="First Name" placeholder="First Name" name="firstName" value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : undefined} />
                    <FormField kind="input" label="Last Name" placeholder="Last Name" name="lastName" value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.lastName && formik.errors.lastName ? formik.errors.lastName : undefined} />
                    <FormField kind="input" type="email" label="Email" placeholder="email@example.com" name="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined} />
                    <FormField kind="input" type="tel" label="Phone" placeholder="Mobile Number" name="phone" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.phone && formik.errors.phone ? formik.errors.phone : undefined} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => setCurrentStep(0)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Back</button>
                  <button type="submit" className="rounded-lg bg-[var(--color-primary)] px-10 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:brightness-110 flex items-center gap-2">
                    Review Booking <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
                   <h2 className="text-xl font-black text-[var(--color-title)] uppercase tracking-tight mb-6">Confirm Details</h2>
                   <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex items-center gap-6">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User className="h-6 w-6" /></div>
                      <div>
                         <p className="text-sm font-black text-[var(--color-title)] uppercase">{passenger.firstName} {passenger.lastName}</p>
                         <p className="text-[10px] font-bold text-gray-400">{passenger.email} | {passenger.phone}</p>
                      </div>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <button onClick={() => setCurrentStep(1)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Back</button>
                  <button onClick={() => setCurrentStep(3)} className="rounded-lg bg-emerald-600 px-10 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:brightness-110 flex items-center gap-2">
                    Proceed to Payment <CreditCard className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm text-center">
                   <ShieldCheck className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                   <h2 className="text-xl font-black text-[var(--color-title)] uppercase tracking-tight mb-2">Secure Checkout</h2>
                   <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">You will be redirected to Razorpay to complete your payment of ₹{totalPrice.toLocaleString('en-IN')}.</p>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <button onClick={() => setCurrentStep(2)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Back</button>
                  <button onClick={handlePayment} disabled={isProcessing} className="rounded-lg bg-[var(--color-primary)] px-12 py-3.5 text-[11px] font-black uppercase tracking-[0.1em] text-white shadow-xl hover:brightness-110 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all">
                     {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                     PAY ₹{totalPrice.toLocaleString('en-IN')} NOW
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Fare Summary</h3>
              <div className="space-y-3">
                 {selectedFlights.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                       <span className="text-gray-400 uppercase">Flight {i+1}</span>
                       <span className="text-[var(--color-title)]">₹{Number(item.flight.minprice).toLocaleString('en-IN')}</span>
                    </div>
                 ))}
                 <div className="border-t border-dashed border-gray-100 pt-3 mt-3 flex justify-between items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase">Total Payable</span>
                    <span className="text-2xl font-black text-[var(--color-primary-strong)] tracking-tighter">₹{totalPrice.toLocaleString('en-IN')}</span>
                 </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-3">
                 <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[9px] text-blue-700 font-medium leading-relaxed">Book with confidence. Your data is encrypted and payment is secured by Razorpay.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
