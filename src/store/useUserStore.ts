import { create } from "zustand";
import { BASE_URL } from "../api/base";

export interface User {
  id: string;
  email: string;
  role: string;
}

interface UserState {
  role: string | null;
  user: User | null;
  loading: boolean;

  fetchProfile?: () => Promise<void>;
  logout: () => void;

  setFields: <K extends keyof UserState>(
    key: K,
    value: UserState[K]
  ) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  role: null,
  user: null,
  loading: false,

  setFields: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

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
    localStorage.removeItem("user");
    set({ role: null, user: null });
  },
}));
