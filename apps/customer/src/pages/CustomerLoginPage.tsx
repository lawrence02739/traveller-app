import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FormField } from '@skyitix/shared';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../api/auth.api';
import { setUser } from '../features/authSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useEffect } from 'react';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const CustomerLoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (token) {
      navigate('/search');
    }
  }, [token, navigate]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await authApi.login(values);
        if (response?.response?.token) {
           // We extract the agent ID logically. The user states: "agent id dynamic partner id is 1"
           const token = response.response.token;
           const userModel = response.response.userModel || { id: 2 }; // fallback agent=2
           
           dispatch(setUser({
             user: userModel,
             token: token
           }));

           // Navigate to search
           navigate('/search');
        } else {
           setErrorMsg('Invalid response from server.');
        }
      } catch (err) {
        setErrorMsg('Authentication failed. Please check your credentials.');
        console.error("Login Failed", err instanceof Error ? err.message : err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-soft lg:grid-cols-[0.9fr,1.1fr]">
        <section className="flex items-center p-6 md:p-10">
          <form onSubmit={formik.handleSubmit} className="mx-auto w-full max-w-md rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 shadow-soft md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-primary-strong)]">Agent Login</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-title)]">Start your next trip</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">Sign in to the booking portal to get your dynamic token.</p>

            {errorMsg && (
               <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                 {errorMsg}
               </div>
            )}

            <div className="mt-8 space-y-5">
              <FormField 
                kind="input" 
                label="Email Address" 
                type="email" 
                placeholder="agent@email.com"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
              />
              <FormField 
                kind="input" 
                label="Password" 
                type="password" 
                placeholder="Enter password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
              />
            </div>

            <button disabled={loading} type="submit" className="mt-8 flex w-full justify-center items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-[var(--color-on-primary)] transition hover:opacity-95 disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign in to portal'}
            </button>
          </form>
        </section>

        <section className="bg-[var(--color-panel-muted)] p-6 md:p-10 lg:p-14">
          <div className="rounded-[2rem] bg-[var(--color-panel-bg)] p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary-strong)]">traveller app</p>
                <h1 className="mt-2 text-4xl font-bold text-[var(--color-title)]">Customer portal made for mobile first booking flow.</h1>
              </div>
              <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--color-primary)]" />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Dynamic Token Acquisition',
                'Live Airport API Search',
                'Live Airline Searches',
                'Auto Theme Synchronization',
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-[var(--color-border)] p-4 text-sm font-medium text-[var(--color-body)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
