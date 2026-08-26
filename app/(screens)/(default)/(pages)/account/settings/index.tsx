import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import { router } from "expo-router";
import {
  ChevronRight,
  FingerprintPattern,
  LockKeyholeOpen,
  Moon,
  ScanFace,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/services/theme-storage";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "@/contexts/auth-context";
import axios from "@/api/axios";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import PinInput from "@/components/pin-input";
import NumberPad from "@/components/number-pad";

export default function Settings() {
  const { user, device_id, getUser } = useAuth();
  const { card, primary } = useAppColors();
  const { theme } = useThemeStore();

  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isBiometricAvailable, setIsBiometricAvailable] =
    useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formSchema = z.object({
    password: z.string().nonempty(),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const { control, handleSubmit, watch, resetField } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const password = watch("password");

  /* ============================================================
     BIOMETRIC
  ============================================================ */

  useEffect(() => {
    if (user) {
      setIsBiometricEnabled(Boolean(user.user_session.is_biometric));
    }
  }, [user]);

  useEffect(() => {
    const checkBiometricHardware = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          setIsBiometricAvailable(true);

          const types =
            await LocalAuthentication.supportedAuthenticationTypesAsync();

          if (
            types.includes(
              LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
            )
          ) {
            setBiometricType("Face ID");
          } else if (
            types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
          ) {
            setBiometricType("Fingerprint / Touch ID");
          } else if (
            types.includes(LocalAuthentication.AuthenticationType.IRIS)
          ) {
            setBiometricType("Iris Scan");
          }
        }
      } catch (error) {
        console.error("Error checking biometric support:", error);
      }
    };

    checkBiometricHardware();
  }, []);

  const updateBiometricSettingOnBackend = async (enabled: boolean) => {
    try {
      await axios.post("/biometric", {
        is_biometric: enabled ? 1 : 0,
        device_id,
      });

      await getUser();

      return true;
    } catch (e) {
      console.error("Failed to update biometric setting on server:", e);

      return false;
    }
  };

  const handleBiometricSwitch = async (value: boolean) => {
    if (isLoading) return;

    setIsLoading(true);

    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate to enable ${biometricType}`,
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
      });

      if (!result.success) {
        setIsLoading(false);
        return;
      }

      const success = await updateBiometricSettingOnBackend(true);

      if (success) {
        setIsBiometricEnabled(true);
      }
    } else {
      const success = await updateBiometricSettingOnBackend(false);

      if (success) {
        setIsBiometricEnabled(false);
      }
    }

    setIsLoading(false);
  };

  /* ============================================================
     CHANGE PIN BOTTOM SHEET
  ============================================================ */

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["70%"], []);

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

  const handleEnterPin = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/check/pin", data);
    },

    onError: () => {
      resetField("password");
    },

    onSuccess: async () => {
      await handleClose();

      router.push("/account/settings/privacy-security/change-pin");

      resetField("password");
    },
  });

  const onSubmit = async (data: FormSchema) => {
    handleEnterPin.mutate(data);
  };

  useEffect(() => {
    if (password.length === 4) {
      handleSubmit(onSubmit)();
    }
  }, [password]);

  /* ============================================================
     SETTING ITEM
  ============================================================ */

  const SettingItem = ({
    icon,
    title,
    description,
    onPress,
    right,
    showDivider = true,
  }: {
    icon: any;
    title: string;
    description?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    showDivider?: boolean;
  }) => {
    const content = (
      <>
        <View className="flex-row items-center px-4 py-4">
          {/* Icon */}
          <View className="size-11 items-center justify-center rounded-2xl bg-primary/10">
            <Icon
              as={icon}
              size={21}
              strokeWidth={1.8}
              className="text-primary"
            />
          </View>

          {/* Text */}
          <View className="ml-3 flex-1">
            <Text className="font-quicksand-semibold text-sm">{title}</Text>

            {description && (
              <Text className="mt-0.5 pr-2 font-quicksand-medium text-xs leading-4 text-muted-foreground">
                {description}
              </Text>
            )}
          </View>

          {/* Right */}
          {right ?? (
            <Icon
              as={ChevronRight}
              size={19}
              strokeWidth={1.7}
              className="text-muted-foreground"
            />
          )}
        </View>

        {showDivider && <View className="ml-[68px] border-t border-border" />}
      </>
    );

    if (!onPress) {
      return <View>{content}</View>;
    }

    return (
      <Pressable onPress={onPress} className="active:bg-secondary/70">
        {content}
      </Pressable>
    );
  };

  return (
    <React.Fragment>
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <View className="px-5 pt-5">
            {/* ==================================================
                HEADER
            =================================================== */}
            <View className="mb-7">
              <Text className="font-quicksand-bold text-2xl">Settings</Text>

              <Text className="mt-1 font-quicksand-medium text-sm text-muted-foreground">
                Manage your account and app preferences
              </Text>
            </View>

            {/* ==================================================
                SECURITY CARD
            =================================================== */}
            <View className="mb-7 overflow-hidden rounded-3xl border border-border bg-card">
              <View className="flex-row items-center bg-primary/5 px-4 py-4">
                <View className="size-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon
                    as={ShieldCheck}
                    size={21}
                    strokeWidth={1.8}
                    className="text-primary"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-bold text-sm">
                    Privacy & Security
                  </Text>

                  <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                    Protect your account and personal information
                  </Text>
                </View>
              </View>

              <SettingItem
                icon={User}
                title="Personal Information"
                description="View and update your personal details"
                onPress={() =>
                  router.navigate(
                    "/account/settings/privacy-security/personal-information",
                  )
                }
              />

              <SettingItem
                icon={LockKeyholeOpen}
                title="Change PIN"
                description="Update your 4-digit security PIN"
                onPress={handleOpen}
                showDivider={isBiometricAvailable}
              />

              {isBiometricAvailable && (
                <SettingItem
                  icon={
                    biometricType === "Face ID" ? ScanFace : FingerprintPattern
                  }
                  title={`${biometricType} Authentication`}
                  description="Use biometric authentication to sign in faster"
                  right={
                    isLoading ? (
                      <ActivityIndicator size="small" color={primary} />
                    ) : (
                      <Switch
                        checked={isBiometricEnabled}
                        onCheckedChange={handleBiometricSwitch}
                        disabled={isLoading}
                      />
                    )
                  }
                  showDivider={false}
                />
              )}
            </View>

            {/* ==================================================
                APPEARANCE
            =================================================== */}
            <Text className="mb-3 px-1 font-quicksand-bold text-lg">
              Appearance
            </Text>

            <View className="mb-7 overflow-hidden rounded-3xl border border-border bg-card">
              <SettingItem
                icon={Moon}
                title="Dark Mode"
                description="Choose how Kabaya looks on your device"
                onPress={() =>
                  router.navigate("/account/settings/appearance/dark-mode")
                }
                right={
                  <View className="flex-row items-center">
                    <View className="mr-2 rounded-full bg-secondary px-3 py-1.5">
                      <Text className="font-quicksand-semibold text-[10px] capitalize text-muted-foreground">
                        {theme === "dark"
                          ? "On"
                          : theme === "light"
                            ? "Off"
                            : "System"}
                      </Text>
                    </View>

                    <Icon
                      as={ChevronRight}
                      size={19}
                      strokeWidth={1.7}
                      className="text-muted-foreground"
                    />
                  </View>
                }
                showDivider={false}
              />
            </View>

            {/* ==================================================
                FOOTER
            =================================================== */}
            <View className="items-center px-5 pb-5">
              <View className="mb-3 size-10 items-center justify-center rounded-full bg-secondary">
                <Icon
                  as={ShieldCheck}
                  size={18}
                  strokeWidth={1.7}
                  className="text-muted-foreground"
                />
              </View>

              <Text className="font-quicksand-semibold text-xs text-muted-foreground">
                Your privacy matters
              </Text>

              <Text className="mt-1 text-center font-quicksand-medium text-[10px] leading-4 text-muted-foreground/70">
                Keep your account secure by using a strong PIN and biometric
                authentication.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ========================================================
          CHANGE PIN BOTTOM SHEET
      ========================================================= */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: card,
        }}
        handleIndicatorStyle={{
          backgroundColor: primary,
        }}
        onDismiss={() => {
          closeResolver.current?.();
          closeResolver.current = null;
        }}
      >
        <BottomSheetView className="h-full">
          <SafeAreaView edges={["bottom"]} className="flex-1">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View className="flex-1 justify-between p-5">
                  {/* PIN Header */}
                  <View className="items-center">
                    <View className="mb-4 size-14 items-center justify-center rounded-full bg-primary/10">
                      <Icon
                        as={LockKeyholeOpen}
                        size={25}
                        strokeWidth={1.8}
                        className="text-primary"
                      />
                    </View>

                    <Text className="font-quicksand-bold text-xl">
                      Verify Your PIN
                    </Text>

                    <Text className="mt-1 text-center font-quicksand-medium text-sm text-muted-foreground">
                      Enter your current PIN to continue
                    </Text>

                    <View className="mt-5 w-full">
                      <PinInput
                        value={value}
                        length={4}
                        error={!!handleEnterPin.isError}
                      />
                    </View>

                    {handleEnterPin.isError && (
                      <Text className="mt-3 font-quicksand-semibold text-xs text-destructive">
                        Incorrect PIN. Please try again.
                      </Text>
                    )}
                  </View>

                  {/* Number Pad */}
                  <NumberPad value={value} onChange={onChange} maxLength={4} />
                </View>
              )}
            />
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    </React.Fragment>
  );
}
