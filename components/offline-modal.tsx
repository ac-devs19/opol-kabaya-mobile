import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { Text } from "@/components/ui/text";
import { useNetworkState } from "expo-network";

export default function OfflineModal() {
  const networkState = useNetworkState();

  const isOffline =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  const opacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (visible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setVisible(false);
        }
      });
    }
  }, [isOffline]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      className="absolute inset-0 z-[9999] bg-background items-center justify-center px-5"
      style={{
        opacity,
      }}
      pointerEvents={isOffline ? "auto" : "none"}
    >
      <LottieView
        style={{
          width: 150,
          height: 150,
        }}
        source={require("@/assets/animations/no-internet.json")}
        autoPlay
        loop
      />
      <Text className="text-xl font-quicksand-bold mt-4 text-center">
        No Internet Connection
      </Text>
      <Text className="text-sm text-muted-foreground font-quicksand-medium text-center mt-2">
        It looks like you're offline. Please check your Wi-Fi or mobile data to
        continue using the app.
      </Text>
    </Animated.View>
  );
}
