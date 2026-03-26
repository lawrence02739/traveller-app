import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route as RouteDom, Routes as RoutesDom } from 'react-router-dom';
import { applyTheme, themes } from '@skyitix/shared';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { FlightSearchPage } from './pages/FlightSearchPage';
import { FlightListPage } from './pages/FlightListPage';
import { BookingFlowPage } from './pages/BookingFlowPage';

applyTheme(themes.gold);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <RoutesDom>
          <RouteDom path="/" element={<CustomerLoginPage />} />
          <RouteDom path="/dashboard" element={<FlightSearchPage />} />
          <RouteDom path="/search" element={<FlightSearchPage />} />
          <RouteDom path="/flights" element={<FlightListPage />} />
          <RouteDom path="/book/:flightId" element={<BookingFlowPage />} />
        </RoutesDom>
      </Router>
    </Provider>
  </React.StrictMode>
);
