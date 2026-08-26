import { create } from "zustand";

type TabBarState = {
  visible: boolean;
  setVisible: (value: boolean) => void;
};

export const useTabBar = create<TabBarState>((set) => ({
  visible: true,
  setVisible: (value) => set({ visible: value }),
}));