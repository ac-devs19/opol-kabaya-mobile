import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

type PinInputProps = {
  value: string;
  length?: number;
  error?: boolean;
};

export default function PinInput({
  value,
  length = 4,
  error = false,
}: PinInputProps) {
  const translateX = useSharedValue(0);

  /*
   * ------------------------------------------------------------
   * ERROR SHAKE
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!error) {
      translateX.value = 0;
      return;
    }

    translateX.value = withSequence(
      withTiming(-10, {
        duration: 45,
        easing: Easing.out(Easing.ease),
      }),
      withTiming(10, {
        duration: 45,
      }),
      withTiming(-8, {
        duration: 45,
      }),
      withTiming(8, {
        duration: 45,
      }),
      withTiming(-4, {
        duration: 45,
      }),
      withTiming(4, {
        duration: 45,
      }),
      withTiming(0, {
        duration: 45,
      }),
    );
  }, [error]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));

  return (
    <Animated.View
      style={containerAnimatedStyle}
      className="w-full flex-row items-center justify-center gap-5"
    >
      {Array.from({ length }).map((_, index) => {
        const filled = index < value.length;

        const active = index === value.length && value.length < length;

        const dotScale = useSharedValue(filled ? 1 : 0.85);

        /*
         * Animate dot when its state changes.
         */
        useEffect(() => {
          dotScale.value = withSpring(filled ? 1 : 0.85, {
            damping: 14,
            stiffness: 220,
            mass: 0.5,
          });
        }, [filled]);

        const dotAnimatedStyle = useAnimatedStyle(() => ({
          transform: [
            {
              scale: dotScale.value,
            },
          ],
        }));

        return (
          <Animated.View
            key={index}
            style={dotAnimatedStyle}
            className={cn(
              "h-5 w-5 items-center justify-center rounded-full border-2",

              /*
               * Error state
               */
              error ? "border-destructive bg-destructive/10" : "",

              /*
               * Filled
               */
              !error && filled ? "border-primary bg-primary" : "",

              /*
               * Active position
               */
              !error && !filled && active
                ? "border-primary/60 bg-primary/5"
                : "",

              /*
               * Empty
               */
              !error && !filled && !active ? "border-border bg-secondary" : "",
            )}
          >
            {/* Inner dot */}

            {filled && !error && (
              <View className="h-2 w-2 rounded-full bg-primary-foreground" />
            )}

            {/* Error dot */}

            {filled && error && (
              <View className="h-2 w-2 rounded-full bg-destructive" />
            )}
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
