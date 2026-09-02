import { useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView, WebViewNavigation } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCcw,
  X,
} from "lucide-react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function WebViewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();

  const webViewRef = useRef<WebView>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [pageTitle, setPageTitle] = useState("");

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setPageTitle(navState.title || "");
  };

  const handleLoadStart = () => {
    setLoading(true);
    setProgress(0);
  };

  const handleLoadProgress = ({
    nativeEvent,
  }: {
    nativeEvent: { progress: number };
  }) => {
    setProgress(nativeEvent.progress);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setProgress(1);
  };

  const getHostName = () => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  if (!url) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <View className="items-center gap-4 px-8">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={Globe}
              size={28}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>

          <View className="items-center gap-1">
            <Text className="font-quicksand-bold text-lg">
              Unable to open page
            </Text>

            <Text className="text-center font-quicksand-medium text-sm text-muted-foreground">
              The requested webpage could not be loaded.
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="rounded-full bg-primary px-6 py-3 active:opacity-80"
          >
            <Text className="font-quicksand-bold text-primary-foreground">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pb-3 pt-2">
        <View className="flex-row items-center gap-3">
          <View className="size-11" />

          {/* Page information */}
          <View className="flex-1 items-center">
            <Text
              numberOfLines={1}
              className="max-w-[85%] font-quicksand-semibold text-sm"
            >
              {pageTitle || "Web Page"}
            </Text>

            <View className="mt-0.5 flex-row items-center gap-1">
              <Icon
                as={Globe}
                size={11}
                strokeWidth={1.8}
                className="text-muted-foreground"
              />

              <Text
                numberOfLines={1}
                className="max-w-[80%] font-quicksand-medium text-[10px] text-muted-foreground"
              >
                {getHostName()}
              </Text>
            </View>
          </View>

          {/* Close */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="size-11 items-center justify-center rounded-full bg-secondary active:opacity-70"
          >
            <Icon
              as={X}
              size={21}
              strokeWidth={1.8}
              className="text-foreground"
            />
          </Pressable>
        </View>

        {/* Loading progress */}
        {loading && (
          <View className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
            <View
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.max(progress * 100, 5)}%`,
              }}
            />
          </View>
        )}
      </View>

      {/* WebView */}
      <View className="flex-1 overflow-hidden">
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={{
            flex: 1,
            backgroundColor: "transparent",
          }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadProgress={handleLoadProgress}
          onLoadEnd={handleLoadEnd}
          hideKeyboardAccessoryView
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
        />

        {/* Initial loader */}
        {loading && progress < 0.1 && (
          <View className="absolute inset-0 items-center justify-center bg-background">
            <View className="items-center gap-3">
              <View className="size-12 items-center justify-center rounded-full bg-secondary">
                <ActivityIndicator />
              </View>

              <Text className="font-quicksand-medium text-sm text-muted-foreground">
                Loading page...
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Browser toolbar */}
      <View className="px-5 pb-1 pt-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-5">
            {/* Back */}
            <Pressable
              disabled={!canGoBack}
              onPress={() => webViewRef.current?.goBack()}
              className="size-12 items-center justify-center rounded-full bg-secondary"
              style={{
                opacity: canGoBack ? 1 : 0.4,
              }}
            >
              <Icon
                as={ChevronLeft}
                size={23}
                strokeWidth={1.8}
                className="text-foreground"
              />
            </Pressable>

            {/* Forward */}
            <Pressable
              disabled={!canGoForward}
              onPress={() => webViewRef.current?.goForward()}
              className="size-12 items-center justify-center rounded-full bg-secondary"
              style={{
                opacity: canGoForward ? 1 : 0.4,
              }}
            >
              <Icon
                as={ChevronRight}
                size={23}
                strokeWidth={1.8}
                className="text-foreground"
              />
            </Pressable>
          </View>

          {/* Refresh */}
          <Pressable
            onPress={() => webViewRef.current?.reload()}
            className="size-12 items-center justify-center rounded-full bg-secondary active:opacity-70"
          >
            <Icon
              as={RefreshCcw}
              size={20}
              strokeWidth={1.8}
              className="text-foreground"
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
