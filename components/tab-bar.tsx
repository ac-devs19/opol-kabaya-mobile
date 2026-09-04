import { cn } from "@/lib/utils";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Home,
  LucideIcon,
  Newspaper,
  TriangleAlert,
  UserRound,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const icons: Record<string, LucideIcon> = {
    home: Home,
    news: Newspaper,
    emergency: TriangleAlert,
    account: UserRound,
  };

  const labels: Record<string, string> = {
    home: "Home",
    news: "News",
    emergency: "Emergency",
    account: "Account",
  };

  return (
    <View className="absolute bottom-6 inset-x-6">
      <SafeAreaView edges={["bottom"]}>
        <View className="bg-[#171717] dark:bg-white flex-row rounded-full p-2">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            const isFocused = state.index === index;

            const label = labels[route.name];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                className={cn(
                  "items-center justify-center w-1/4 gap-0.5",
                  isFocused
                    ? "bg-white/10 dark:bg-black/10 rounded-full p-1.5"
                    : "",
                )}
              >
                <Icon
                  as={icons[route.name]}
                  size={21}
                  strokeWidth={1.5}
                  className={
                    isFocused
                      ? "text-white dark:text-black"
                      : "text-white/50 dark:text-black/50"
                  }
                />
                <Text
                  className={cn(
                    "font-quicksand-medium text-[10px]",
                    isFocused
                      ? "text-white dark:text-black"
                      : "text-white/50 dark:text-black/50",
                  )}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
