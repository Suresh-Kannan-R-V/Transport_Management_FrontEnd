import { create } from "zustand";

interface CommonState {
  isOpen: boolean;
  user: any;


  setCommonStates: (state: string, value: any) => void;
}

export const useCommonStore = create<CommonState>((set) => ({
  isOpen: true,
  user: null,

  setCommonStates: (state: string, value: any) =>
    set(() => ({
      [state]: value,
    }) as any),
}));
