import AppLogo from "@/components/app-logo";
import TabBar from "@/components/tab-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { router, Tabs } from "expo-router";
import { Bell } from "lucide-react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Quicksand-SemiBold",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        options={{
          header: () => (
            <SafeAreaView edges={["top"]}>
              <View className="p-6 flex-row justify-between items-center">
                <AppLogo />
                <Button
                  onPress={() => router.push("/home/notification")}
                  variant="secondary"
                  size="icon"
                  className="size-12 rounded-2xl bg-primary/10 items-center justify-center"
                >
                  <Icon
                    as={Bell}
                    size={24}
                    strokeWidth={1.8}
                    className="text-primary"
                  />
                </Button>
              </View>
            </SafeAreaView>
          ),
        }}
        name="home"
      />
      <Tabs.Screen
        options={{
          headerShown: false,
        }}
        name="news"
      />
      <Tabs.Screen
        options={{
          headerShown: false,
        }}
        name="emergency"
      />
    </Tabs>
  );
}
