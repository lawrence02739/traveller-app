import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Flight, BookingDetails } from '../types/flight';

interface SeatSelection {
  seatNumber: string;
  price: number;
}

interface BaggageSelection {
  weight: number;
  price: number;
}

interface BookingState {
  selectedFlights: { flight: Flight; fareIdentifier: string }[];
  bookingDetails: BookingDetails | null;
  selectedSeats: Record<string, SeatSelection>; // passenger index -> Seat details
  selectedBaggage: Record<string, BaggageSelection>; // passenger index -> Baggage details
  bookingReference: string | null;
}

const initialState: BookingState = {
  selectedFlights: [],
  bookingDetails: null,
  selectedSeats: {},
  selectedBaggage: {},
  bookingReference: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setFlightForBooking(state, action: PayloadAction<{ flight: Flight; fareIdentifier?: string; index?: number }>) {
      const { flight, fareIdentifier, index } = action.payload;
      const fare = fareIdentifier || flight.fareIdentifier || 'PUBLISHED';
      
      if (typeof index === 'number') {
        state.selectedFlights[index] = { flight, fareIdentifier: fare };
      } else {
        // Default to first slot or push
        state.selectedFlights[0] = { flight, fareIdentifier: fare };
      }
    },
    setReturnFlightForBooking(state, action: PayloadAction<{ flight: Flight; fareIdentifier?: string }>) {
      const { flight, fareIdentifier } = action.payload;
      const fare = fareIdentifier || flight.fareIdentifier || 'PUBLISHED';
      state.selectedFlights[1] = { flight, fareIdentifier: fare };
    },
    updateBookingDetails(state, action: PayloadAction<Partial<BookingDetails>>) {
      state.bookingDetails = state.bookingDetails
        ? { ...state.bookingDetails, ...action.payload }
        : (action.payload as BookingDetails);
    },
    setSeatSelection(state, action: PayloadAction<{ paxIndex: string; seat: SeatSelection }>) {
      state.selectedSeats[action.payload.paxIndex] = action.payload.seat;
    },
    setBaggageSelection(state, action: PayloadAction<{ paxIndex: string; baggage: BaggageSelection }>) {
      state.selectedBaggage[action.payload.paxIndex] = action.payload.baggage;
    },
    setBookingReference(state, action: PayloadAction<string>) {
      state.bookingReference = action.payload;
    },
    clearBooking(state) {
      state.selectedFlights = [];
      state.bookingDetails = null;
      state.selectedSeats = {};
      state.selectedBaggage = {};
      state.bookingReference = null;
    }
  }
});

export const { 
  setFlightForBooking, 
  setReturnFlightForBooking,
  updateBookingDetails, 
  setSeatSelection, 
  setBaggageSelection, 
  setBookingReference,
  clearBooking 
} = bookingSlice.actions;

export default bookingSlice.reducer;
