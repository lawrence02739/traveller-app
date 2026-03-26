import apiClient from './apiClient';

export const bookingApi = {
  // 1. Review
  review: async (payload: any) => {
    const response = await apiClient.post('v1/booking/review', payload);
    return response.data;
  },
  // 2. Seats
  getSeats: async (bookingId: string) => {
    const response = await apiClient.post('v1/booking/seats', { bookingId });
    return response.data;
  },
  // 3. Acknowledge
  acknowledge: async (userId: string, payload: any) => {
    const response = await apiClient.post(`v1/booking/acknowledge-confirmation?partner=1&userId=${userId}`, payload);
    return response.data;
  },
  // 4. Confirm Booking
  confirmBooking: async (payload: any) => {
    const response = await apiClient.post('v1/booking/book', payload);
    return response.data;
  }
};
