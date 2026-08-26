import { create } from "zustand";

interface VerificationSheetState {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export const useVerificationSheet = create<VerificationSheetState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
}));
