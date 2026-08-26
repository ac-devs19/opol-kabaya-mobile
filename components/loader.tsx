import { useLoader } from "@/hooks/useLoader";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

interface LoaderProps {
  loading?: boolean;
}

export default function Loader({ loading = false }: LoaderProps) {
  const { processing } = useLoader();

  const isLoading = processing || loading;

  const opacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (visible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setVisible(false);
        }
      });
    }
  }, [isLoading, opacity, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      className="absolute inset-0 z-[9999] items-center justify-center bg-black/50"
      style={{
        opacity,
      }}
      pointerEvents={isLoading ? "auto" : "none"}
    >
      <LottieView
        style={{
          width: 150,
          height: 150,
        }}
        source={require("@/assets/animations/liquid-4-dot-loader.json")}
        autoPlay
        loop
      />
    </Animated.View>
  );
}
