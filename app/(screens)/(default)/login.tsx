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
import { FingerprintPattern, ScanFace } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

export default function Login() {
  const { getUser, logout, user, device_id } = useAuth();
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { canResend, startTimer } = useOtpTimer();
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

  useEffect(() => {
    if (password.length === 4 && !handleLogin.isPending) {
      handleSubmit(onSubmit)();
    }
  }, [password]);

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

  useEffect(() => {
    promptBiometric();
  }, [user?.user_session?.is_biometric]);

  const handleForgotPin = async () => {
    if (!canResend) {
      setOpen(true);
      return;
    }

    try {
      await axios.post("/forgot-pin");
      router.push("/forgot/otp-verification");
      startTimer();
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
            <View className="flex-1 p-6 gap-10">
              <View className="items-end">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={logout}
                  disabled={isLoading}
                >
                  <Text className="font-quicksand-bold text-primary text-sm">
                    Switch account
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1 gap-20">
                <View className="flex-1 justify-center gap-6">
                  <View className="items-center">
                    <AppLogo className="w-40 h-20" />
                  </View>
                  <View className="items-center gap-3">
                    <Text className="font-quicksand-bold text-2xl">
                      Welcome back
                    </Text>
                    <Text className="font-quicksand-semibold text-muted-foreground text-sm">
                      Enter your PIN
                    </Text>
                    <PinInput
                      value={value}
                      length={4}
                      error={handleLogin.isError}
                    />
                  </View>
                </View>
                <View className="flex-1 justify-end gap-6">
                  {biometricEnabled && (
                    <View className="items-center">
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
                  <NumberPad value={value} onChange={onChange} maxLength={4} />
                  <View className="items-center">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleForgotPin}
                      disabled={isLoading}
                    >
                      <Text className="font-quicksand-bold text-primary text-sm">
                        Forgot your PIN?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
