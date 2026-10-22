import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebViewProps } from "react-native-webview";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, RotateCw } from "lucide-react-native";
import { Button as Btn } from "@/components/ui/button";

const LOADING_TIMEOUT = 20000;

export default function DiditVerificationScreen() {
  const { sessionUrl } = useLocalSearchParams<{
    sessionUrl: string;
  }>();

  const { getUser } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);

  const isValidUrl = (() => {
    try {
      return (
        typeof sessionUrl === "string" &&
        new URL(sessionUrl).protocol === "https:"
      );
    } catch {
      return false;
    }
  })();

  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);

  const startLoadingTimeout = useCallback(() => {
    clearLoadingTimeout();

    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, LOADING_TIMEOUT);
  }, [clearLoadingTimeout]);

  useEffect(() => {
    return () => {
      clearLoadingTimeout();
    };
  }, [clearLoadingTimeout]);

  const handleDone = useCallback(async () => {
    router.dismissAll();
    router.back();
    try {
      await getUser();
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, [getUser]);

  const handleWebViewError: NonNullable<WebViewProps["onError"]> = useCallback(
    (event) => {
      clearLoadingTimeout();
      setLoading(false);
      setError(true);
    },
    [clearLoadingTimeout],
  );

  const handleHttpError: NonNullable<WebViewProps["onHttpError"]> = useCallback(
    (event) => {
      if (event.nativeEvent.statusCode >= 400) {
        clearLoadingTimeout();
        setLoading(false);
        setError(true);
      }
    },
    [clearLoadingTimeout],
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (webViewRef.current) {
            webViewRef.current.goBack();
            return true;
          }

          return false;
        },
      );

      return () => subscription.remove();
    }, []),
  );

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setProgress(0);
    startLoadingTimeout();
    webViewRef.current?.reload();
  };

  if (!isValidUrl) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="font-quicksand-semibold text-center text-base">
          The verification URL is invalid or missing.
        </Text>

        <Btn onPress={handleDone} className="mt-5">
          <Text>Go Back</Text>
        </Btn>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Btn variant="ghost" size="icon" onPress={handleDone}>
          <Icon as={ArrowLeft} size={22} />
        </Btn>

        <View className="flex-1 items-center">
          <Text className="font-quicksand-bold text-base">
            Identity Verification
          </Text>

          <Text className="font-quicksand-regular text-xs text-muted-foreground">
            Secure verification by Didit
          </Text>
        </View>

        <Btn variant="ghost" size="icon" onPress={handleRetry}>
          <Icon as={RotateCw} size={19} />
        </Btn>
      </View>

      <View className="flex-1">
        {!error && (
          <WebView
            ref={webViewRef}
            source={{ uri: sessionUrl }}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            allowsBackForwardNavigationGestures
            onLoadStart={(event) => {
              setLoading(true);
              setProgress(0);
              startLoadingTimeout();
            }}
            onLoadProgress={({ nativeEvent }) => {
              setProgress(nativeEvent.progress);

              if (nativeEvent.progress >= 0.8) {
                setLoading(false);
                clearLoadingTimeout();
              }
            }}
            onLoadEnd={(event) => {
              setLoading(false);
              clearLoadingTimeout();
            }}
            onError={handleWebViewError}
            onHttpError={handleHttpError}
            onRenderProcessGone={(event) => {
              clearLoadingTimeout();
              setLoading(false);
              setError(true);
            }}
            onContentProcessDidTerminate={() => {
              clearLoadingTimeout();
              setLoading(false);
              setError(true);
            }}
            style={{
              flex: 1,
              backgroundColor: "transparent",
            }}
          />
        )}

        {loading && !error && (
          <View
            pointerEvents="none"
            className="absolute inset-0 z-10 items-center justify-center bg-background"
          >
            <ActivityIndicator size="large" />

            <Text className="mt-4 font-quicksand-medium text-sm text-muted-foreground">
              Loading verification...
            </Text>

            <Text className="mt-2 font-quicksand-regular text-xs text-muted-foreground">
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

        {error && (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="font-quicksand-bold text-lg text-center">
              Unable to load verification
            </Text>

            <Text className="mt-2 font-quicksand-regular text-sm text-muted-foreground text-center">
              Please check your internet connection and try again.
            </Text>

            <Btn className="mt-5" onPress={handleRetry}>
              <Text>Try Again</Text>
            </Btn>

            <Btn variant="ghost" className="mt-2" onPress={handleDone}>
              <Text>Go Back</Text>
            </Btn>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
