import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route as RouteDom, Routes as RoutesDom } from 'react-router-dom';
import { applyTheme, themes } from '@skyitix/shared';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import './index.css';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
// import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { FlightSearchPage } from './pages/FlightSearchPage';
import { FlightListPage } from './pages/FlightListPage';
import { BookingFlowPage } from './pages/BookingFlowPage';
import { AuthGuard } from './components/AuthGuard';

applyTheme(themes.gold);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <RoutesDom>
            <RouteDom path="/" element={<CustomerLoginPage />} />
            <RouteDom path="/dashboard" element={<AuthGuard><FlightSearchPage /></AuthGuard>} />
            <RouteDom path="/search" element={<AuthGuard><FlightSearchPage /></AuthGuard>} />
            <RouteDom path="/flights" element={<AuthGuard><FlightListPage /></AuthGuard>} />
            <RouteDom path="/booking" element={<AuthGuard><BookingFlowPage /></AuthGuard>} />
            <RouteDom path="/book/:flightId" element={<AuthGuard><BookingFlowPage /></AuthGuard>} />
            <RouteDom path="/book/confirm" element={<AuthGuard><BookingFlowPage /></AuthGuard>} />
          </RoutesDom>
        </Router>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
