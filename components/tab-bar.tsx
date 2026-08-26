import { View, Image } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import {
  Home,
  LucideIcon,
  Newspaper,
  TriangleAlert,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTabBar } from "@/hooks/useTabBar";
import { useAuth } from "@/contexts/auth-context";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const icons: Record<string, LucideIcon> = {
    home: Home,
    news: Newspaper,
    emergency: TriangleAlert,
  };

  const { user } = useAuth();

  const visible = useTabBar((state) => state.visible);

  const actionBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(visible ? 0 : 120, {
            duration: 300,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
    };
  });

  return (
    <Animated.View
      style={[actionBarStyle]}
      className="w-full absolute bottom-0 ios:px-5"
    >
      <SafeAreaView edges={["bottom"]} className="android:bg-background">
        <View className="ios:bg-secondary android:bg-background ios:p-2 android:px-3 android:py-2 ios:rounded-full flex-row justify-between items-center gap-2">
          <View className="flex-row gap-3 p-2 ios:bg-background android:bg-secondary rounded-full">
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];

              const isFocused = state.index === index;

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
                <Button
                  key={route.key}
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  className="rounded-full ios:size-14 android:size-12"
                  variant={isFocused ? "default" : "ghost"}
                >
                  <Icon
                    as={icons[route.name]}
                    size={24}
                    className={cn(
                      isFocused ? "text-white" : "text-muted-foreground",
                    )}
                    strokeWidth={1.5}
                  />
                </Button>
              );
            })}
          </View>
          <Button
            onPress={() => router.navigate("/account")}
            className="rounded-full ios:size-14 android:size-12 p-0.5"
          >
            {user?.latest_verification?.face_image ? (
              <Image
                source={{
                  uri: `https://lh3.googleusercontent.com/d/${user?.latest_verification?.face_image}`,
                }}
                className="size-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("@/assets/images/kabaya/user.png")}
                className="size-full rounded-full"
              />
            )}
          </Button>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}
