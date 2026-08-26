import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useStore } from "@/hooks/useStore";
import { router, Stack } from "expo-router";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";
import { Platform } from "react-native";

export default function SangguniangBayanLayout() {
  const { ordinance } = useStore();

  return (
    <Stack
      screenOptions={{
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
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTitleStyle: {
          fontFamily: "Quicksand-SemiBold",
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Sangguniang Bayan",
        }}
      />
      <Stack.Screen
        name="ordinance-pdf"
        options={{
          headerTitle: () => (
            <Text className="px-3 font-quicksand-semibold line-clamp-1 text-lg">
              {ordinance.folder_name}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="search/ordinance-folder"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="search/ordinance-pdf"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="webview"
        options={{
          headerShown: Platform.OS === "ios" ? false : true,
          presentation: "modal",
          headerTitle: () => (
            <Text className="px-3 font-quicksand-semibold line-clamp-1 text-lg">
              {ordinance.pdf_name}
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
