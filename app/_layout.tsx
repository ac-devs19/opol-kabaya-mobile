import "@/global.css";

import * as React from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { NAV_THEME } from "@/lib/theme";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeStore } from "@/services/theme-storage";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/contexts/auth-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Quicksand-Bold": require("@/assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-Medium": require("@/assets/fonts/Quicksand-Medium.ttf"),
    "Quicksand-Regular": require("@/assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-SemiBold": require("@/assets/fonts/Quicksand-SemiBold.ttf"),
  });
  const { loadTheme } = useThemeStore();
  const { activeScheme } = useAppTheme();
  const initialize = useAuth((state) => state.initialize);

  React.useEffect(() => {
    loadTheme();
    initialize();
  }, []);

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[activeScheme ?? "light"]}>
      <StatusBar style={activeScheme === "dark" ? "light" : "dark"} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
