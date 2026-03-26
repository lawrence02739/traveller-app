import axios from 'axios';

// Create a central Axios instance for standardizing all 8 API calls
export const apiClient = axios.create({
  // Using the backend base URL provided by the user in the latest instructions
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://143.110.251.96:8081/backend/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token automatically
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('accessToken');

    // If not in accessToken, check the persisted redux state
    if (!token) {
      const persistRoot = localStorage.getItem('persist:root');
      if (persistRoot) {
        try {
          const root = JSON.parse(persistRoot);
          const auth = JSON.parse(root.auth || '{}');
          token = auth.token;
        } catch (e) {
          console.error('Error parsing persist:root', e);
        }
      }
    }

    if (token && config.headers) {
      // Ensure the token is a clean string (remove quotes if they exist)
      const cleanToken = token.replace(/"/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



// Interceptor to handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login
      localStorage.removeItem('persist:auth');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

