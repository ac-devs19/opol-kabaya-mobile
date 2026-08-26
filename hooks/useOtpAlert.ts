import { create } from "zustand";

interface OtpAlertState {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export const useOtpAlert = create<OtpAlertState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
}));
