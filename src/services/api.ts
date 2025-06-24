import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

// Set a base URL for all API requests
const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupAxiosInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore();
      const token = authStore.accessToken;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const authStore = useAuthStore();
      console.log(originalRequest);
      // Handle token refresh on 401 Unauthorized errors
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== "/auth/tokens/refresh"
      ) {
        originalRequest._retry = true;
        try {
          await authStore.refreshToken();
          // Retry the original request with the new token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${authStore.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout the user
          authStore.logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
