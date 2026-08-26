import { create } from "zustand";
import { Keyboard } from "react-native";

interface LoaderState {
  processing: boolean;
  setProcessing: (value: boolean) => void;
}

export const useLoader = create<LoaderState>((set) => ({
  processing: false,
  setProcessing: (value) => {
    if (value === true) {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      }
    }
    set({ processing: value });
  },
}));
