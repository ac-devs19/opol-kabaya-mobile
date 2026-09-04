import { Button as Btn } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { router, Stack } from "expo-router";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";
import { Platform } from "react-native";

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerBackVisible: false,
        headerLeft: () => {
          if (router.canGoBack()) {
            return (
              <Btn
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
              </Btn>
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
        options={{
          headerShown: false,
        }}
        name="settings"
      />
    </Stack>
  );
}
