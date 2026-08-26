import { useEffect, useMemo } from "react";
import { useColorScheme } from "nativewind";
import { useThemeStore } from "@/services/theme-storage";

export function useAppTheme() {
  const { theme } = useThemeStore();
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  const activeScheme = useMemo(() => {
    return theme === "system" ? colorScheme : theme;
  }, [theme, colorScheme]);

  return {
    theme,
    systemScheme: colorScheme,
    activeScheme,
  };
}
