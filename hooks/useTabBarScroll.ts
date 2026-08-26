import { useRef, useCallback } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTabBar } from "@/hooks/useTabBar";

export function useTabBarScroll(threshold = 10) {
  const setVisible = useTabBar((s) => s.setVisible);
  const lastOffset = useRef(0);

  useFocusEffect(
    useCallback(() => {
      setVisible(true);

      return () => {
        setVisible(true);
      };
    }, [setVisible]),
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset <= 0) {
      setVisible(true);
      return;
    }

    if (currentOffset > lastOffset.current + threshold) {
      setVisible(false);
    } else if (currentOffset < lastOffset.current - threshold) {
      setVisible(true);
    }

    lastOffset.current = currentOffset;
  };

  return { handleScroll };
}
