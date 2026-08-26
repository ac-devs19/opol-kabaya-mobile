import AppLogo from "@/components/app-logo";
import Button from "@/components/button";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnBoarding() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-6">
        <View className="flex-1 items-center justify-center">
          <AppLogo className="w-48 h-20" />
        </View>
        <View className="gap-4">
          <Button
            onPress={() => router.push("/sign-up")}
            label="Create an account"
          />
          <Button
            onPress={() => router.push("/sign-in")}
            label="I already have an account"
            variant="secondary"
          />
        </View>
        <Text className="mt-5 text-center font-quicksand-medium text-xs text-muted-foreground">
          By continuing, you agree to use Kabaya responsibly and provide
          accurate account information.
        </Text>
      </View>
    </SafeAreaView>
  );
}
