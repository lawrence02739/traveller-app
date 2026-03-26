import apiClient from './apiClient';

export const flightApi = {
  // 1. Airport List
  getAirports: async (searchQuery: string) => {
    const response = await apiClient.get('v1/airport/search', { params: { searchTerm: searchQuery } });
    return response.data;
  },
  // 2. Preferred Airline
  getAirlines: async (userId: number, searchQuery: string) => {
    const response = await apiClient.get('v1/airlines/search', { params: { userId, searchTerm: searchQuery } });
    return response.data;
  },
  // 3. Search
  searchFlights: async (payload: any) => {
    const response = await apiClient.post('v1/booking/search?agent=2&partner=1', payload);
    return response.data;
  },
  // 4. Acknowledge Booking
  acknowledgeBooking: async (payload: any) => {
    const response = await apiClient.post('v1/booking/acknowledge', payload);
    return response.data;
  },
  // 5. Confirm Booking
  confirmBooking: async (payload: any) => {
    const response = await apiClient.post('v1/booking/confirm', payload);
    return response.data;
  },
  // 6. Review Booking
  reviewBooking: async (payload: any) => {
    const response = await apiClient.post('v1/booking/review', payload);
    return response.data;
  }
};
