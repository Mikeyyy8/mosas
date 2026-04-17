import { create } from "zustand";
import api from "@/lib/axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isCheckingAuth: boolean;

  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: true,

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      set({ user: res.data.user, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data?.message || "Signup failed";
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      set({ user: res.data.user, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data?.message || "Login failed";
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await api.get("/auth/profile");
      set({ user: res.data.user, isCheckingAuth: false });
    } catch {
      set({ user: null, isCheckingAuth: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.put("/auth/profile", data);
      set({ user: res.data.user, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data?.message || "Failed to update profile";
    }
  },
}));
