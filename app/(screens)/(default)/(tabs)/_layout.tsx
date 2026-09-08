import TabBar from "@/components/tab-bar";
import { Button as Btn } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs } from "expo-router";
import { LogOut } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useAuth } from "@/contexts/auth-context";
import { useAppColors } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";

export default function TabsLayout() {
  const { logout } = useAuth();
  const { card, primary } = useAppColors();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const closeResolver = useRef<(() => void) | null>(null);

  const handleOpen = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    return new Promise<void>((resolve) => {
      closeResolver.current = resolve;
      bottomSheetModalRef.current?.close();
    });
  }, []);

  const handleLogout = async () => {
    await handleClose();
    logout();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <React.Fragment>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: "Quicksand-SemiBold",
            fontSize: 18,
          },
        }}
      >
        <Tabs.Screen
          options={{
            headerShown: false,
          }}
          name="home"
        />
        <Tabs.Screen
          options={{
            headerShown: false,
          }}
          name="news"
        />
        <Tabs.Screen
          options={{
            headerShown: false,
          }}
          name="emergency"
        />
        <Tabs.Screen
          options={{
            headerRight: () => (
              <View className="pr-4">
                <Btn
                  onPress={handleOpen}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <Icon as={LogOut} size={24} strokeWidth={1.5} />
                </Btn>
              </View>
            ),
            headerTitle: "Account",
          }}
          name="account"
        />
      </Tabs>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: card }}
        handleIndicatorStyle={{ backgroundColor: primary }}
        onDismiss={() => {
          closeResolver.current?.();
          closeResolver.current = null;
        }}
      >
        <BottomSheetView className="h-full">
          <SafeAreaView edges={["bottom"]} className="flex-1">
            <View className="flex-1 px-4 pt-4 justify-between">
              <View className="items-center gap-6">
                <Icon
                  as={LogOut}
                  size={35}
                  strokeWidth={1.5}
                  className="text-destructive"
                />
                <View className="items-center gap-3">
                  <Text className="font-quicksand-bold text-xl">Log Out</Text>
                  <Text className="font-quicksand-regular">
                    Are you sure you want to log out?
                  </Text>
                </View>
              </View>
              <View className="gap-2">
                <Button
                  onPress={handleLogout}
                  label="Yes"
                  variant="destructive"
                />
                <Button onPress={handleClose} label="Cancel" variant="ghost" />
              </View>
            </View>
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    </React.Fragment>
  );
}
