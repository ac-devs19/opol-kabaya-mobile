import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { router, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function SignUpLayout() {
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
                  as={ArrowLeft}
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
        title: "",
      }}
    />
  );
}
