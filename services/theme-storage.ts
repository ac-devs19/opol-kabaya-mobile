import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

type ThemeStore = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  loadTheme: () => Promise<void>;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",

  setTheme: async (theme) => {
    set({ theme });
    await AsyncStorage.setItem("theme", theme);
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem("theme");
    if (saved) {
      set({ theme: saved as ThemeMode });
    }
  },
}));
