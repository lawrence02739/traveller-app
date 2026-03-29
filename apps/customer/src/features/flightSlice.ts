import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Flight, FlightSearchFilters, DynamicFilters } from '../types/flight';
import { parseFlightData } from '../utils/flightMapper';

interface FlightState {
  flights: Flight[];
  returnFlights: Flight[];
  multiCityFlights: Flight[][];
  airports: any[];
  airlines: any[];
  fareFilters: string[];
  loading: boolean;
  error: string | null;
  filters: FlightSearchFilters;
  selectedMultiCityIndex: number;
  dynamicFilters: DynamicFilters | null;
}

const initialState: FlightState = {
  flights: [],
  returnFlights: [],
  multiCityFlights: [],
  airports: [],
  airlines: [],
  fareFilters: [],
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
  selectedMultiCityIndex: 0,
  dynamicFilters: null,
};

import { flightApi } from '../api/flight.api';

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

      console.log('Fetching flights with payload:', JSON.stringify(payload, null, 2));
      const data = await flightApi.searchFlights(payload);
      console.log('Search response data:', data);
      
      // Corrected JSON path based on user screenshot: response.searchResult.tripInfos
      const tripinfo = data?.response?.searchResult?.tripInfos || data?.data?.tripinfo || data?.tripinfo || {};
      console.log('Parsed tripinfo:', tripinfo);

      const onwardParsed = parseFlightData(tripinfo.ONWARD || []);
      const returnParsed = parseFlightData(tripinfo.RETURN || []);

      let multiParsed: Flight[][] = [];
      if (filters.tripType === 'multi_city') {
        const keys = Object.keys(tripinfo);
        multiParsed = keys.map(k => parseFlightData(tripinfo[k] || [])).filter(arr => arr.length > 0);
      }

      const dynamicFilters = data?.dynamicFilters || data?.response?.searchResult?.dynamicFilters || {};
      
      console.log('Final parsed onward flights:', onwardParsed.length);
      return { onward: onwardParsed, returnData: returnParsed, multiCity: multiParsed, dynamicFilters };


    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch flights');
    }
  }
);


export const fetchAirports = createAsyncThunk(
  'flight/fetchAirports',
  async (searchTerm: string) => {
    const data = await flightApi.getAirports(searchTerm);
    return data?.response || [];
  }
);

export const fetchAirlines = createAsyncThunk(
  'flight/fetchAirlines',
  async ({ userId, searchTerm }: { userId: number; searchTerm: string }) => {
    const data = await flightApi.getAirlines(userId, searchTerm);
    return data?.response || [];
  }
);

const flightSlice = createSlice({
  name: 'flight',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FlightSearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedMultiCityIndex(state, action: PayloadAction<number>) {
      state.selectedMultiCityIndex = action.payload;
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
        state.dynamicFilters = action.payload.dynamicFilters || null;

        // Extract dynamic fare filters
        const allFlights = [
          ...state.flights,
          ...state.returnFlights,
          ...state.multiCityFlights.flat()
        ];
        const fares = new Set<string>();
        allFlights.forEach(f => {
           if (f.fareIdentifier) fares.add(f.fareIdentifier);
        });
        state.fareFilters = Array.from(fares);
      })
      .addCase(fetchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch flights';
      })
      .addCase(fetchAirports.fulfilled, (state, action) => {
        state.airports = action.payload;
      })
      .addCase(fetchAirlines.fulfilled, (state, action) => {
        state.airlines = action.payload;
      });
  },
});

export const { setFilters, setSelectedMultiCityIndex } = flightSlice.actions;
export default flightSlice.reducer;

