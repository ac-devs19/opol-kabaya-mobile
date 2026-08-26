import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OtpTimerStore {
  resendUntil: number | null;
  remainingTime: number;
  canResend: boolean;
  startTimer: (seconds?: number) => void;
  updateTimer: () => void;
  resetTimer: () => void;
}

export const useOtpTimer = create<OtpTimerStore>()(
  persist(
    (set, get) => ({
      resendUntil: null,
      remainingTime: 0,
      canResend: true,

      startTimer: (seconds = 180) => {
        const resendUntil = Date.now() + seconds * 1000;

        set({
          resendUntil,
          remainingTime: seconds,
          canResend: false,
        });
      },

      updateTimer: () => {
        const { resendUntil } = get();

        if (!resendUntil) {
          set({
            remainingTime: 0,
            canResend: true,
          });
          return;
        }

        const remaining = Math.max(
          0,
          Math.floor((resendUntil - Date.now()) / 1000),
        );

        set({
          remainingTime: remaining,
          canResend: remaining <= 0,
        });
      },

      resetTimer: () => {
        set({
          resendUntil: null,
          remainingTime: 0,
          canResend: true,
        });
      },
    }),
    {
      name: "otp-timer",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
