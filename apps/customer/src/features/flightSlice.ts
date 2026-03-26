import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Flight, FlightSearchFilters, BookingDetails } from '../types/flight';
import mockData from '../constants/mockFlightRaw.json';
import { parseFlightData } from '../utils/flightMapper';

interface FlightState {
  flights: Flight[]; // Can be used for onward flights
  returnFlights: Flight[]; // For round trip return flights
  multiCityFlights: Flight[][]; // For multi city segments
  loading: boolean;
  error: string | null;
  filters: FlightSearchFilters;
  selectedFlight: Flight | null;
  bookingDetails: BookingDetails | null;
}

const initialState: FlightState = {
  flights: [],
  returnFlights: [],
  multiCityFlights: [],
  loading: false,
  error: null,
  filters: {
    origin: 'MAA',
    destination: 'DEL',
    departureDate: '2026-03-25',
    passengers: 1,
    travelClass: 'Economy',
    tripType: 'one_way',
  },
  selectedFlight: null,
  bookingDetails: null,
};

// Actual API call
export const fetchFlights = createAsyncThunk(
  'flight/fetchFlights',
  async (filters: FlightSearchFilters) => {
    try {
      let routeInfos: any[] = [];
      if (filters.tripType === 'one_way') {
        routeInfos = [{
          fromCityOrAirport: { code: filters.origin },
          toCityOrAirport: { code: filters.destination },
          travelDate: filters.departureDate
        }];
      } else if (filters.tripType === 'round_trip') {
        routeInfos = [
          {
            fromCityOrAirport: { code: filters.origin },
            toCityOrAirport: { code: filters.destination },
            travelDate: filters.departureDate
          },
          {
            fromCityOrAirport: { code: filters.destination },
            toCityOrAirport: { code: filters.origin },
            travelDate: filters.returnDate || ''
          }
        ];
      } else if (filters.tripType === 'multi_city') {
        routeInfos = (filters.trips || []).map(t => ({
          fromCityOrAirport: { code: t.origin },
          toCityOrAirport: { code: t.destination },
          travelDate: t.date
        }));
      }

      const payload = {
        searchQuery: {
          cabinClass: filters.travelClass || "ECONOMY",
          paxInfo: filters.paxInfo || { ADULT: filters.passengers, CHILD: 0, INFANT: 0 },
          isSplitView: false,
          routeInfos,
          preferredAirline: filters.preferredAirline || [],
          searchModifiers: filters.searchModifiers || {
            isDirectFlight: true,
            isConnectingFlight: false,
            pft: "REGULAR"
          }
        }
      };

      const response = await fetch('http://192.168.101.73:8081/backend/api/v1/booking/search?agent=2&partner=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWdlbnQiLCJyb2xlSWQiOjMsInN1YiI6ImFnZW50QHlvcG1haWwuY29tIiwiaWF0IjoxNzc0NTE2MDkxLCJleHAiOjE3NzQ1MTk2OTF9.QI2nEmlwjDt3tkuGazI8zb8MJwDeGoQVujyt2miyQhc'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }

      const data = await response.json();
      const tripinfo = data?.data?.tripinfo || data?.tripinfo || {};

      const onwardParsed = parseFlightData(tripinfo.ONWARD || []);
      const returnParsed = parseFlightData(tripinfo.RETURN || []);

      let multiParsed: Flight[][] = [];
      if (filters.tripType === 'multi_city') {
        // Find arrays in tripinfo to support dynamic multicity response keys
        const keys = Object.keys(tripinfo);
        multiParsed = keys.map(k => parseFlightData(tripinfo[k] || [])).filter(arr => arr.length > 0);
      }

      return { onward: onwardParsed, returnData: returnParsed, multiCity: multiParsed };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch flights');
    }
  }
);

const flightSlice = createSlice({
  name: 'flight',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FlightSearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    selectFlight(state, action: PayloadAction<Flight>) {
      state.selectedFlight = action.payload;
    },
    updateBookingDetails(state, action: PayloadAction<Partial<BookingDetails>>) {
      state.bookingDetails = state.bookingDetails
        ? { ...state.bookingDetails, ...action.payload }
        : (action.payload as BookingDetails);
    },
    clearBooking(state) {
      state.selectedFlight = null;
      state.bookingDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = action.payload.onward;
        state.returnFlights = action.payload.returnData;
        state.multiCityFlights = action.payload.multiCity;
      })
      .addCase(fetchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch flights';
      });
  },
});

export const { setFilters, selectFlight, updateBookingDetails, clearBooking } = flightSlice.actions;

export default flightSlice.reducer;
