import apiClient from './apiClient';

export const authApi = {
  login: async (credentials: any) => {
    const response = await apiClient.post('v1/auth/login', { password: credentials.password, username: credentials.email, type: "agent-portal" });
    return response.data;
  }
};
