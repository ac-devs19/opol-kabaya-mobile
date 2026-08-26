import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

export const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(240 10% 3.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(240 10% 3.9%)",
    primary: "hsl(346.8 77.2% 49.8%)",
    primaryForeground: "hsl(355.7 100% 97.3%)",
    secondary: "hsl(240 4.8% 95.9%)",
    secondaryForeground: "hsl(240 5.9% 10%)",
    muted: "hsl(240 4.8% 95.9%)",
    mutedForeground: "hsl(240 3.8% 46.1%)",
    accent: "hsl(240 4.8% 95.9%)",
    accentForeground: "hsl(240 5.9% 10%)",
    destructive: "hsl(0 84.2% 60.2%)",
    border: "hsl(240 5.9% 90%)",
    input: "hsl(240 5.9% 90%)",
    ring: "hsl(346.8 77.2% 49.8%)",
    radius: "0.625rem",
    chart1: "hsl(12 76% 61%)",
    chart2: "hsl(173 58% 39%)",
    chart3: "hsl(197 37% 24%)",
    chart4: "hsl(43 74% 66%)",
    chart5: "hsl(27 87% 67%)",
  },
  dark: {
    background: "hsl(20 14.3% 4.1%)",
    foreground: "hsl(0 0% 95%)",
    card: "hsl(24 9.8% 10%)",
    cardForeground: "hsl(0 0% 95%)",
    popover: "hsl(0 0% 9%)",
    popoverForeground: "hsl(0 0% 95%)",
    primary: "hsl(346.8 77.2% 49.8%)",
    primaryForeground: "hsl(355.7 100% 97.3%)",
    secondary: "hsl(240 3.7% 15.9%)",
    secondaryForeground: "hsl(0 0% 98%)",
    muted: "hsl(0 0% 15%)",
    mutedForeground: "hsl(240 5% 64.9%)",
    accent: "hsl(12 6.5% 15.1%)",
    accentForeground: "hsl(0 0% 98%)",
    destructive: "hsl(0 62.8% 30.6%)",
    border: "hsl(240 3.7% 15.9%)",
    input: "hsl(240 3.7% 15.9%)",
    ring: "hsl(346.8 77.2% 49.8%)",
    radius: "0.625rem",
    chart1: "hsl(220 70% 50%)",
    chart2: "hsl(160 60% 45%)",
    chart3: "hsl(30 80% 55%)",
    chart4: "hsl(280 65% 60%)",
    chart5: "hsl(340 75% 55%)",
  },
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

export const useAppColors = () => {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? "light";

  return {
    primary: THEME[scheme].primary,
    secondary: THEME[scheme].secondary,
    mutedForeground: THEME[scheme].mutedForeground,
    destructive: THEME[scheme].destructive,
    card: THEME[scheme].card,
    border: THEME[scheme].border,
    background: THEME[scheme].background,
    foreground: THEME[scheme].foreground,
  };
};
