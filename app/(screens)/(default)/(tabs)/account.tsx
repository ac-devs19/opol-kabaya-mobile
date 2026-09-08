import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import {
  Bell,
  ChevronRight,
  CircleQuestionMark,
  Info,
  Settings,
  ShieldCheck,
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import AppLogo from "@/components/app-logo";
import * as Application from "expo-application";

export default function Account() {
  const { user } = useAuth();
  const appVersion = Application.nativeApplicationVersion ?? "Unknown";

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <View className="p-6">
          <View className="items-center">
            <View className="relative">
              <View className="size-[112px] items-center justify-center rounded-full bg-secondary">
                <Image
                  source={
                    user?.latest_verification?.face_image
                      ? {
                          uri: `https://lh3.googleusercontent.com/d/${user.latest_verification.face_image}`,
                        }
                      : require("@/assets/images/kabaya/user.png")
                  }
                  className="size-[100px] rounded-full"
                />
              </View>
              {user?.is_verified === 1 && (
                <View className="absolute bottom-1 right-1 size-8 items-center justify-center rounded-full border-4 border-background bg-primary">
                  <Icon
                    as={ShieldCheck}
                    size={15}
                    strokeWidth={2.5}
                    className="text-primary-foreground"
                  />
                </View>
              )}
            </View>
            <Text className="mt-5 text-center font-quicksand-bold text-2xl">
              {user?.first_name} {user?.last_name}
            </Text>
            <Text className="mt-1 font-quicksand-medium text-sm text-muted-foreground">
              {user?.id_number}
            </Text>
            <View className="mt-3 flex-row items-center rounded-full bg-secondary px-3 py-1.5">
              <View
                className={cn(
                  "mr-2 size-2 rounded-full",
                  user?.is_verified === 0
                    ? "bg-orange-500"
                    : user?.is_verified === 1
                      ? "bg-green-500"
                      : "bg-red-500",
                )}
              />

              <Text className="font-quicksand-semibold text-xs text-muted-foreground">
                {user?.is_verified === 0
                  ? "Semi Verified"
                  : user?.is_verified === 1
                    ? "Fully Verified"
                    : "Not Verified"}
              </Text>
            </View>
          </View>
          <View className="mt-9">
            <View className="overflow-hidden rounded-3xl border border-border bg-card">
              <TouchableOpacity
                onPress={() => router.navigate("/account/settings")}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-4"
              >
                <View className="size-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon
                    as={Settings}
                    size={21}
                    strokeWidth={1.8}
                    className="text-primary"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-semibold text-sm">
                    Settings
                  </Text>
                  <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                    Manage your account preferences
                  </Text>
                </View>
                <Icon
                  as={ChevronRight}
                  size={19}
                  strokeWidth={1.7}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
              <View className="ml-[68px] border-t border-border" />
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-4"
              >
                <View className="size-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon
                    as={Bell}
                    size={21}
                    strokeWidth={1.8}
                    className="text-primary"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-semibold text-sm">
                    Notifications
                  </Text>
                  <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                    Manage your notification preferences
                  </Text>
                </View>
                <Icon
                  as={ChevronRight}
                  size={19}
                  strokeWidth={1.7}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="mt-7">
            <Text className="mb-3 px-1 font-quicksand-bold text-lg">
              Help & Information
            </Text>
            <View className="overflow-hidden rounded-3xl border border-border bg-card">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-4"
              >
                <View className="size-11 items-center justify-center rounded-2xl bg-secondary">
                  <Icon
                    as={CircleQuestionMark}
                    size={21}
                    strokeWidth={1.8}
                    className="text-foreground"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-semibold text-sm">
                    Frequently Asked Questions
                  </Text>
                  <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                    Find answers to common questions
                  </Text>
                </View>
                <Icon
                  as={ChevronRight}
                  size={19}
                  strokeWidth={1.7}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
              <View className="ml-[68px] border-t border-border" />
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-4"
              >
                <View className="size-11 items-center justify-center rounded-2xl bg-secondary">
                  <Icon
                    as={Info}
                    size={21}
                    strokeWidth={1.8}
                    className="text-foreground"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-semibold text-sm">
                    About Kabaya
                  </Text>
                  <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                    Learn more about the Kabaya application
                  </Text>
                </View>
                <Icon
                  as={ChevronRight}
                  size={19}
                  strokeWidth={1.7}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="mt-8 items-center">
            <AppLogo className="h-10 w-20" />
            <Text className="mt-0.5 font-quicksand-medium text-[10px] text-muted-foreground/70">
              Your community, connected.
            </Text>
            <Text className="mt-2 font-quicksand-medium text-[10px] text-muted-foreground/60">
              Version {appVersion}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
