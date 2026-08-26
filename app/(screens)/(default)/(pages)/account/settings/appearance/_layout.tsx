import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { router, Stack } from "expo-router";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";
import { Platform } from "react-native";

export default function AppearanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontFamily: "Quicksand-SemiBold",
          fontSize: 18,
        },
        headerBackVisible: false,
        headerLeft: () => {
          if (router.canGoBack()) {
            return (
              <Button
                variant="secondary"
                size="icon"
                onPress={() => router.back()}
                className="rounded-full"
              >
                <Icon
                  as={Platform.OS === "ios" ? ChevronLeft : ArrowLeft}
                  size={24}
                  strokeWidth={1.5}
                  className="text-primary"
                />
              </Button>
            );
          }
        },
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="dark-mode"
        options={{
          title: "Dark Mode",
        }}
      />
    </Stack>
  );
}
