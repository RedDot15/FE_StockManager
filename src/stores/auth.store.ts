import { defineStore } from "pinia";
import apiClient from "../services/api";
import router from "../router";
import { User } from "../types";

// Helper to decode JWT token
function decodeJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    accessToken: localStorage.getItem("accessToken") || null,
    refreshTokenValue: localStorage.getItem("refreshToken") || null,
    status: {
      loggingIn: false,
      error: "",
    },
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.roles.includes("ROLE_ADMIN") || false,
  },
  actions: {
    async login(credentials: { email: string; password: any }) {
      this.status = { loggingIn: true, error: "" };
      try {
        const response = await apiClient.post("/auth/tokens", credentials);
        const { accessToken, refreshToken } = response.data.data;

        this.accessToken = accessToken;
        this.refreshTokenValue = refreshToken;

        // Decode token to get user info (assuming roles are in the token)
        const tokenPayload = decodeJwt(accessToken);
        if (tokenPayload) {
          this.user = {
            id: tokenPayload.uid,
            username: tokenPayload.sub,
            roles: tokenPayload.scope || "",
          };
          localStorage.setItem("user", JSON.stringify(this.user));
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        this.status = { loggingIn: false, error: "" };
        await router.push({ name: "DashboardView" });
      } catch (error: any) {
        this.status = {
          loggingIn: false,
          error: error.response?.data?.message || "Login failed",
        };
        throw error;
      }
    },

    async refreshToken() {
      try {
        const response = await apiClient.post("/auth/tokens/refresh", {
          refreshToken: this.refreshTokenValue,
        });
        const { accessToken, refreshToken } = response.data.data;

        this.accessToken = accessToken;
        this.refreshTokenValue = refreshToken;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      } catch (error) {
        this.logout();
        throw new Error("Session expired. Please log in again.");
      }
    },

    async logout() {
      if (this.accessToken) {
        try {
          await apiClient.delete("/auth/tokens");
        } catch (error) {
          console.error(
            "Logout API call failed, clearing session locally.",
            error
          );
        }
      }
      this.user = null;
      this.accessToken = null;
      this.refreshTokenValue = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      await router.push({ name: "LoginView" });
    },

    // Action to initialize state from localStorage on app load
    initializeAuth() {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const userJson = localStorage.getItem("user");

      if (accessToken && refreshToken && userJson) {
        this.accessToken = accessToken;
        this.refreshTokenValue = refreshToken;
        this.user = JSON.parse(userJson);
      } else {
        // If anything is missing, clear the session
        this.logout();
      }
    },
  },
});
