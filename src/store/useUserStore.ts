import { create } from "zustand";
import { BASE_URL } from "../api/base";

export interface User {
  user_id: number;
  Institute_id: number;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl?: string | null;
  userRole: number;
}

interface UserState {
  token: string | null;
  role: string | null;
  user: User | null;
  loading: boolean;

  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  setUser: (user: User | null) => void;
  fetchProfile?: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
  user: null,
  loading: false,

  setToken: (token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ token });
  },
  setRole: (role) => {
    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
    set({ role });
  },

  setUser: (user) => set({ user }),

  // fetchProfile: async () => {
  //   const { token, role } = get();
  //   if (!token || !role) return;

  //   set({ loading: true });

  //   // 🔥 ROLE-BASED API
  //   const profileUrl =
  //     role === "admin"
  //       ? `${BASE_URL}/admin/me`
  //       : `${BASE_URL}/intern/me`;

  //   try {
  //     const res = await fetch(profileUrl, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!res.ok) throw new Error("Profile fetch failed");

  //     const data: User = await res.json();
  //     set({ user: data });
  //   } catch (err) {
  //     console.error("Profile fetch failed", err);
  //     localStorage.clear();
  //     set({ token: null, role: null, user: null });
  //   } finally {
  //     set({ loading: false });
  //   }
  // },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
