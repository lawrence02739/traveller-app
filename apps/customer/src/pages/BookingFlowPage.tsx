import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { clearBooking, updateBookingDetails } from '../features/flightSlice';
import { RootState } from '../store';
import { CheckCircle2, ChevronRight, CreditCard, ShieldCheck, User } from 'lucide-react';
import { FormField } from '@skyitix/shared';

const STEPS = ['Passenger', 'Review', 'Payment'];

export const BookingFlowPage = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { flights } = useSelector((state: RootState) => state.flight);
  const flight = flights.find(f => f.id === flightId) || flights[0]; // fallback
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const [passenger, setPassenger] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  if (!flight && !isSuccess) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Flight not found</h2>
          <button onClick={() => navigate('/flights')} className="mt-4 text-[var(--color-primary)]">Back to flights</button>
        </div>
      </MainLayout>
    );
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 2) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    } else {
      // Final submit
      dispatch(updateBookingDetails({
        flight,
        passengers: [{ ...passenger, dob: '2000-01-01', passportNumber: 'Mock' }],
        contactInfo: { email: passenger.email, phone: passenger.phone }
      }));
      setIsSuccess(true);
      window.scrollTo(0, 0);
    }
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl py-12 md:py-20 text-center animate-in zoom-in duration-300">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-8">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-[var(--color-title)]">Booking Confirmed!</h1>
          <p className="mt-4 text-md text-[var(--color-body)]">
            Your flight from {flight?.departureLocation} to {flight?.arrivalLocation} is confirmed.<br />
            We've sent the e-ticket to {passenger.email}
          </p>
          
          <div className="mt-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-subtle)]">Booking Reference</p>
            <p className="mt-2 text-3xl font-mono font-bold tracking-[0.2em] text-[var(--color-primary-strong)]">
              {Math.random().toString(36).substring(2, 8).toUpperCase()}
            </p>
          </div>

          <button 
            onClick={() => {
              dispatch(clearBooking());
              navigate('/dashboard');
            }}
            className="mt-12 rounded-2xl bg-[var(--color-panel-muted)] px-8 py-4 font-bold text-[var(--color-title)] transition hover:bg-[var(--color-border)] hover:scale-105 active:scale-95"
          >
            Go to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl">
        {/* Stepper Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className={`flex flex-col items-center gap-2 ${isActive ? 'text-[var(--color-primary-strong)]' : isPast ? 'text-[var(--color-title)]' : 'text-[var(--color-subtle)] opacity-50'}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold ${
                      isActive ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]' :
                      isPast ? 'border-[var(--color-title)] bg-transparent text-[var(--color-title)]' :
                      'border-[var(--color-border)] bg-transparent'
                    }`}>
                      {isPast ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">{step}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`mx-2 sm:mx-6 h-[2px] flex-1 ${isPast ? 'bg-[var(--color-title)]' : 'bg-[var(--color-border)]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start mt-8">
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <form onSubmit={handleNext} className="space-y-6">
              
              {/* Step 1: Passenger */}
              {currentStep === 0 && (
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 md:p-8 shadow-soft">
                  <div className="mb-6 flex items-center gap-3">
                    <User className="h-6 w-6 text-[var(--color-primary)]" />
                    <h2 className="text-2xl font-bold text-[var(--color-title)]">Passenger Details</h2>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      kind="input"
                      label="First Name"
                      placeholder="John"
                      value={passenger.firstName}
                      onChange={(e: any) => setPassenger({...passenger, firstName: e.target.value})}
                      required
                    />
                    <FormField
                      kind="input"
                      label="Last Name"
                      placeholder="Doe"
                      value={passenger.lastName}
                      onChange={(e: any) => setPassenger({...passenger, lastName: e.target.value})}
                      required
                    />
                    <div className="md:col-span-2">
                      <div className="w-full h-px bg-[var(--color-border)] my-2" />
                    </div>
                    <FormField
                      kind="input"
                      type="email"
                      label="Email Address"
                      placeholder="john@example.com"
                      value={passenger.email}
                      onChange={(e: any) => setPassenger({...passenger, email: e.target.value})}
                      required
                    />
                    <FormField
                      kind="input"
                      type="tel"
                      label="Phone Number"
                      placeholder="+1 234 567 890"
                      value={passenger.phone}
                      onChange={(e: any) => setPassenger({...passenger, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Review */}
              {currentStep === 1 && (
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 md:p-8 shadow-soft space-y-8">
                  <h2 className="text-2xl font-bold text-[var(--color-title)]">Review Your Booking</h2>
                  
                  <div className="rounded-2xl bg-[var(--color-panel-muted)] p-6 space-y-4">
                    <h3 className="font-bold text-[var(--color-title)] border-b border-[var(--color-border)] pb-2">Passenger Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[var(--color-subtle)]">Full Name</p>
                        <p className="font-semibold text-[var(--color-title)]">{passenger.firstName} {passenger.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-subtle)]">Contact</p>
                        <p className="font-semibold text-[var(--color-title)]">{passenger.email}</p>
                        <p className="font-semibold text-[var(--color-title)]">{passenger.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--color-primary-soft)] bg-[var(--color-page-bg)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                      <h3 className="font-bold text-[var(--color-title)]">Traveler Protection included</h3>
                    </div>
                    <p className="text-sm text-[var(--color-body)]">
                      Your booking is fully refundable up to 24 hours before departure as part of our premium membership class.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 2 && (
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 md:p-8 shadow-soft">
                  <div className="mb-6 flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-[var(--color-primary)]" />
                    <h2 className="text-2xl font-bold text-[var(--color-title)]">Payment Details</h2>
                  </div>

                  <p className="mb-8 text-sm text-[var(--color-subtle)]">
                    All transactions are secure and encrypted. (Mock Payment Phase)
                  </p>
                  
                  <div className="space-y-6">
                    <FormField
                      kind="input"
                      label="Card Number"
                      placeholder="**** **** **** 4242"
                      required
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        kind="input"
                        label="Expiry Date"
                        placeholder="MM/YY"
                        required
                      />
                      <FormField
                        kind="input"
                        label="CVC"
                        placeholder="123"
                        required
                        type="password"
                      />
                    </div>
                    <FormField
                      kind="input"
                      label="Name on Card"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="mt-8 flex items-center justify-between border-t border-[var(--color-border)] pt-8">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(curr => curr - 1)}
                    className="rounded-xl px-6 py-3 font-semibold text-[var(--color-title)] transition hover:bg-[var(--color-panel-muted)]"
                  >
                    Back
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-4 font-bold text-[var(--color-on-primary)] shadow-md transition hover:scale-[1.02] active:scale-95"
                >
                  {currentStep === 2 ? `Pay $${flight?.minprice}` : 'Continue'}
                  {currentStep < 2 && <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 shadow-soft">
              <h3 className="font-bold text-[var(--color-title)] px-2">Order Summary</h3>
              
              <div className="mt-6 rounded-2xl bg-[var(--color-page-bg)] p-4 border border-[var(--color-border)]">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary-strong)] mb-2">{flight?.airline}</p>
                <p className="font-bold text-lg text-[var(--color-title)]">
                  {flight?.departureLocation} - {flight?.arrivalLocation}
                </p>
                <div className="mt-3 flex gap-4 text-sm text-[var(--color-subtle)] font-medium">
                  <p>{flight?.departureTime}</p>
                  <p className="text-[var(--color-border)]">•</p>
                  <p>{flight?.duration}</p>
                </div>
              </div>

              <div className="mt-6 px-2 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-subtle)]">1x {flight?.class} Ticket</span>
                  <span className="font-medium text-[var(--color-title)]">${flight?.minprice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-subtle)]">Taxes & Fees</span>
                  <span className="font-medium text-[var(--color-title)]">$45</span>
                </div>
                
                <div className="pt-4 border-t border-[var(--color-border)] flex justify-between">
                  <span className="font-bold text-[var(--color-title)]">Total</span>
                  <span className="text-2xl font-extrabold text-[var(--color-primary-strong)]">
                    ${Number(flight?.minprice || 0) + 45}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
