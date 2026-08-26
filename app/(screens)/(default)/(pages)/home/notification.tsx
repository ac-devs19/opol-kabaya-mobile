import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Megaphone,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";

type NotificationType =
  "announcement" | "verification" | "payment" | "account" | "system";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const notifications: NotificationItem[] = [
  // {
  //   id: "1",
  //   type: "verification",
  //   title: "Identity Verification",
  //   message: "Your identity verification has been successfully completed.",
  //   time: "5 minutes ago",
  //   read: false,
  // },
  // {
  //   id: "2",
  //   type: "announcement",
  //   title: "New Community Announcement",
  //   message: "A new announcement is available for residents in your community.",
  //   time: "1 hour ago",
  //   read: false,
  // },
  // {
  //   id: "3",
  //   type: "payment",
  //   title: "Payment Received",
  //   message: "Your recent payment has been successfully recorded.",
  //   time: "3 hours ago",
  //   read: true,
  // },
  // {
  //   id: "4",
  //   type: "account",
  //   title: "Profile Updated",
  //   message: "Your profile information was successfully updated.",
  //   time: "Yesterday",
  //   read: true,
  // },
  // {
  //   id: "5",
  //   type: "system",
  //   title: "Welcome to Kabaya",
  //   message:
  //     "Your Kabaya account is ready. Explore the services available to you.",
  //   time: "2 days ago",
  //   read: true,
  // },
];

export default function Notification() {
  const [items, setItems] = useState(notifications);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  const markAllAsRead = () => {
    setItems((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const markAsRead = (id: string) => {
    setItems((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 40,
      }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-5">
          {/* HEADER */}
          <View className="flex-row items-center justify-between mb-7">
            <View>
              <Text className="font-quicksand-bold text-2xl">
                Notifications
              </Text>

              <Text className="font-quicksand-medium text-sm text-muted-foreground mt-1">
                Stay updated with Kabaya
              </Text>
            </View>
          </View>

          {/* SUMMARY CARD */}
          <View className="rounded-3xl bg-primary px-5 py-5 mb-6">
            <View className="flex-row items-center">
              <View className="size-11 rounded-2xl bg-white/15 items-center justify-center">
                <Icon
                  as={Bell}
                  size={22}
                  className="text-white"
                  strokeWidth={1.8}
                />
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-white font-quicksand-bold text-base">
                  {unreadCount > 0
                    ? `${unreadCount} new notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "You're all caught up"}
                </Text>

                <Text className="text-white/70 font-quicksand-medium text-xs mt-1">
                  {unreadCount > 0
                    ? "Check the latest updates from Kabaya."
                    : "There are no new notifications right now."}
                </Text>
              </View>
            </View>
          </View>

          {/* SECTION HEADER */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-base">Recent</Text>

              {unreadCount > 0 && (
                <View className="px-2 py-0.5 rounded-full bg-primary/10">
                  <Text className="text-primary text-[10px] font-quicksand-bold">
                    {unreadCount} NEW
                  </Text>
                </View>
              )}
            </View>

            {unreadCount > 0 && (
              <Pressable
                onPress={markAllAsRead}
                className="flex-row items-center"
              >
                <Text className="text-primary font-quicksand-semibold text-xs">
                  Mark all as read
                </Text>
              </Pressable>
            )}
          </View>

          {/* NOTIFICATIONS */}
          <View className="rounded-3xl border border-border bg-card overflow-hidden">
            {items.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isLast={index === items.length - 1}
                onPress={() => markAsRead(notification.id)}
              />
            ))}
          </View>

          {/* EMPTY STATE */}
          {items.length === 0 && (
            <View className="items-center py-16">
              <View className="size-16 rounded-full bg-secondary items-center justify-center">
                <Icon as={Bell} size={28} className="text-muted-foreground" />
              </View>

              <Text className="font-quicksand-bold text-base mt-4">
                No notifications
              </Text>

              <Text className="font-quicksand-medium text-sm text-muted-foreground text-center mt-1">
                You're all caught up. We'll notify you when something important
                happens.
              </Text>
            </View>
          )}

          {/* FOOTER */}
          <View className="items-center mt-7">
            <Text className="font-quicksand-medium text-xs text-muted-foreground">
              You're up to date with Kabaya
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

/**
 * ---------------------------------------------------------
 * NOTIFICATION CARD
 * ---------------------------------------------------------
 */

function NotificationCard({
  notification,
  isLast,
  onPress,
}: {
  notification: NotificationItem;
  isLast: boolean;
  onPress: () => void;
}) {
  const config = getNotificationConfig(notification.type);

  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-4 active:bg-secondary/60 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <View className="flex-row">
        {/* ICON */}
        <View
          className={`size-11 rounded-2xl items-center justify-center ${config.background}`}
        >
          <Icon
            as={config.icon}
            size={20}
            className={config.iconColor}
            strokeWidth={1.8}
          />
        </View>

        {/* CONTENT */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-start">
            <View className="flex-1 pr-2">
              <View className="flex-row items-center">
                <Text
                  className={`text-sm ${
                    notification.read
                      ? "font-quicksand-semibold"
                      : "font-quicksand-bold"
                  }`}
                >
                  {notification.title}
                </Text>

                {!notification.read && (
                  <View className="size-2 rounded-full bg-primary ml-2 mt-0.5" />
                )}
              </View>

              <Text
                numberOfLines={2}
                className="text-xs leading-5 font-quicksand-medium text-muted-foreground mt-1"
              >
                {notification.message}
              </Text>
            </View>

            <Icon
              as={ChevronRight}
              size={17}
              className="text-muted-foreground mt-1"
            />
          </View>

          <Text className="text-[10px] font-quicksand-medium text-muted-foreground mt-2">
            {notification.time}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * ---------------------------------------------------------
 * NOTIFICATION CONFIG
 * ---------------------------------------------------------
 */

function getNotificationConfig(type: NotificationType) {
  switch (type) {
    case "verification":
      return {
        icon: ShieldCheck,
        background: "bg-primary/10",
        iconColor: "text-primary",
      };

    case "announcement":
      return {
        icon: Megaphone,
        background: "bg-orange-500/10",
        iconColor: "text-orange-600",
      };

    case "payment":
      return {
        icon: CreditCard,
        background: "bg-green-500/10",
        iconColor: "text-green-600",
      };

    case "account":
      return {
        icon: UserRoundCheck,
        background: "bg-blue-500/10",
        iconColor: "text-blue-600",
      };

    case "system":
    default:
      return {
        icon: CheckCircle2,
        background: "bg-secondary",
        iconColor: "text-muted-foreground",
      };
  }
}
