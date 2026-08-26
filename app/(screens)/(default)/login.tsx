import AppLogo from "@/components/app-logo";
import NumberPad from "@/components/number-pad";
import PinInput from "@/components/pin-input";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useOtpAlert } from "@/hooks/useOtpAlert";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import axios from "@/api/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import {
  FingerprintPattern,
  HelpCircle,
  LogOut,
  ScanFace,
  ShieldCheck,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

export default function Login() {
  const { getUser, logout, user, device_id } = useAuth();

  const [biometricType, setBiometricType] = useState<string>("Biometric");

  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const { canResend } = useOtpTimer();
  const { setOpen } = useOtpAlert();

  const formSchema = z.object({
    password: z.string().length(4, "PIN must contain 4 digits."),
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
     PIN LOGIN
  ============================================================ */

  const handleLogin = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/login", {
        ...data,
        device_id,
      });

      await getUser();
    },

    onError: () => {
      resetField("password");
    },
  });

  const onSubmit = (data: FormSchema) => {
    if (handleLogin.isPending) return;

    handleLogin.mutate(data);
  };

  /* ============================================================
     AUTO LOGIN
  ============================================================ */

  useEffect(() => {
    if (password.length === 4 && !handleLogin.isPending) {
      handleSubmit(onSubmit)();
    }
  }, [password]);

  /* ============================================================
     BIOMETRIC LOGIN
  ============================================================ */

  const handleBiometricLogin = useMutation({
    mutationFn: async () => {
      await axios.post("/login/biometric", {
        device_id,
      });

      await getUser();
    },

    onError: (error) => {
      console.log("Biometric login failed:", error);
    },
  });

  const promptBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return;
      }

      setIsBiometricAvailable(true);

      if (!user?.user_session?.is_biometric) {
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Log in to your account",
        fallbackLabel: "Use PIN",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        handleBiometricLogin.mutate();
      }
    } catch (error) {
      console.error("Biometric error:", error);
    }
  };

  /* ============================================================
     DETECT BIOMETRIC
  ============================================================ */

  useEffect(() => {
    const checkBiometricHardware = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          return;
        }

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
          setBiometricType("Fingerprint");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.IRIS)
        ) {
          setBiometricType("Iris Scan");
        }
      } catch (error) {
        console.error("Error checking biometric support:", error);
      }
    };

    checkBiometricHardware();
  }, []);

  /* ============================================================
     AUTO BIOMETRIC
  ============================================================ */

  useEffect(() => {
    promptBiometric();
  }, [user?.user_session?.is_biometric]);

  /* ============================================================
     FORGOT PIN
  ============================================================ */

  const handleForgotPin = async () => {
    if (!canResend) {
      setOpen(true);
      return;
    }

    try {
      await axios.post("/forgot-pin");

      router.push("/forgot/otp-verification");
    } catch (error) {
      console.log(error);
    }
  };

  const biometricEnabled =
    isBiometricAvailable && !!user?.user_session?.is_biometric;

  const isLoading = handleLogin.isPending || handleBiometricLogin.isPending;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View className="flex-1 px-6">
              {/* ==================================================
                  HEADER
              ================================================== */}

              <View className="items-center pt-5">
                <AppLogo className="h-9 w-[76px]" />
              </View>

              {/* ==================================================
                  USER PROFILE
              ================================================== */}

              <View className="mt-8 items-center">
                {user?.latest_verification?.face_image ? (
                  <View className="size-16 items-center justify-center rounded-full bg-secondary">
                    <Image
                      source={{
                        uri: `https://lh3.googleusercontent.com/d/${user?.latest_verification?.face_image}`,
                      }}
                      className="size-14 rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View className="size-14 items-center justify-center rounded-full bg-primary/10">
                    <Text className="font-quicksand-bold text-xl text-primary">
                      {user?.first_name?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text className="mt-3 font-quicksand-bold text-lg">
                  Welcome back
                </Text>

                <Text
                  numberOfLines={1}
                  className="mt-0.5 max-w-[280px] font-quicksand-semibold text-sm text-primary"
                >
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>

              {/* ==================================================
                  PIN HEADER
              ================================================== */}

              <View className="mt-8 items-center">
                <View className="flex-row items-center">
                  <Icon
                    as={ShieldCheck}
                    size={15}
                    strokeWidth={1.7}
                    className="text-muted-foreground"
                  />

                  <Text className="ml-1.5 font-quicksand-medium text-xs text-muted-foreground">
                    Enter your 4-digit PIN
                  </Text>
                </View>

                {/* PIN INDICATOR */}

                <View className="w-full mt-5">
                  <PinInput
                    value={value}
                    length={4}
                    error={handleLogin.isError}
                  />
                </View>

                {/* ERROR */}

                {handleLogin.isError && (
                  <View className="mt-4">
                    <Text className="text-center font-quicksand-semibold text-xs text-destructive">
                      Incorrect PIN
                    </Text>

                    <Text className="mt-1 text-center font-quicksand-medium text-[10px] text-muted-foreground">
                      Please try again.
                    </Text>
                  </View>
                )}

                {/* LOADING */}

                {handleLogin.isPending && (
                  <Text className="mt-4 font-quicksand-medium text-xs text-muted-foreground">
                    Signing you in...
                  </Text>
                )}
              </View>

              {/* ==================================================
                  BIOMETRIC
              ================================================== */}

              {biometricEnabled && (
                <View className="mt-7 items-center">
                  <Pressable
                    onPress={promptBiometric}
                    disabled={isLoading}
                    className="flex-row items-center rounded-2xl border border-primary/15 bg-primary/5 px-5 py-3.5"
                  >
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Icon
                        as={
                          biometricType === "Face ID"
                            ? ScanFace
                            : FingerprintPattern
                        }
                        size={18}
                        strokeWidth={1.7}
                        className="text-primary"
                      />
                    </View>

                    <View className="ml-3">
                      <Text className="font-quicksand-bold text-xs text-primary">
                        {handleBiometricLogin.isPending
                          ? "Authenticating..."
                          : `Use ${biometricType}`}
                      </Text>

                      <Text className="mt-0.5 font-quicksand-medium text-[10px] text-muted-foreground">
                        Quick and secure access
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}

              {/* ==================================================
                  NUMBER PAD
              ================================================== */}

              <View className="mt-7 flex-1 justify-center">
                <NumberPad value={value} onChange={onChange} maxLength={4} />
              </View>

              {/* ==================================================
                  BOTTOM ACTIONS
              ================================================== */}

              <View className="pb-5 pt-6 flex-row justify-evenly">
                {/* Forgot PIN */}

                <Pressable
                  onPress={handleForgotPin}
                  disabled={isLoading}
                  className="items-center py-2"
                >
                  <View className="flex-row items-center">
                    <Icon
                      as={HelpCircle}
                      size={14}
                      strokeWidth={1.7}
                      className="text-primary"
                    />

                    <Text className="ml-1.5 font-quicksand-semibold text-xs text-primary">
                      Forgot PIN?
                    </Text>
                  </View>
                </Pressable>

                {/* Switch Account */}

                <Pressable
                  onPress={logout}
                  disabled={isLoading}
                  className="flex-row items-center justify-center py-2"
                >
                  <Icon
                    as={LogOut}
                    size={14}
                    strokeWidth={1.7}
                    className="text-muted-foreground"
                  />

                  <Text className="ml-1.5 font-quicksand-semibold text-xs text-muted-foreground">
                    Switch account
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
