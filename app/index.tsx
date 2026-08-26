import AppLogo from "@/components/app-logo";
import { Redirect, useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetworkState } from "expo-network";
import { View } from "react-native";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";

export default function Index() {
  const { getUser, lock, user, loading } = useAuth();
  const networkState = useNetworkState();

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        getUser();
      } else {
        lock();
      }
    }, [lock, user, getUser]),
  );

  const isOffline =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  return isOffline || loading ? (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center gap-12">
        <AppLogo className="w-48 h-20" />
        <LottieView
          style={{
            width: 150,
            height: 150,
          }}
          source={require("@/assets/animations/liquid-4-dot-loader.json")}
          autoPlay
          loop
        />
      </View>
      {isOffline && (
        <View className="absolute bottom-10 px-6">
          <Alert icon={WifiOff} className="rounded-3xl">
            <AlertTitle className="font-quicksand-bold">
              No Internet Connection
            </AlertTitle>
            <AlertDescription className="text-sm font-quicksand-medium">
              It looks like you're offline. Please check your Wi-Fi or mobile
              data to continue using the app.
            </AlertDescription>
          </Alert>
        </View>
      )}
    </SafeAreaView>
  ) : !user ? (
    <Redirect href="/on-boarding" />
  ) : user.user_session.required_password === 1 ? (
    <Redirect href="/login" />
  ) : (
    <Redirect href="/home" />
  );
}
