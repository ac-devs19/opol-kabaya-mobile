import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import OtpInput from "@/components/otp-input";
import axios from "@/api/axios";
import { useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { useAuth } from "@/contexts/auth-context";
import { setToken } from "@/services/auth-storage";
import { useLoader } from "@/hooks/useLoader";
import { Icon } from "@/components/ui/icon";
import { Info, Mail, ShieldCheck } from "lucide-react-native";

export default function OtpVerification() {
  const { token_name, device_id, getUser } = useAuth();

  const { email } = useLocalSearchParams();

  const { remainingTime, canResend, startTimer, updateTimer, resetTimer } =
    useOtpTimer();

  const { processing, setProcessing } = useLoader();

  const formSchema = z.object({
    otp: z.string().length(6, "Please enter the 6-digit code."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otp = watch("otp");

  /* ============================================================
     VERIFY OTP
  ============================================================ */

  const handleOtpVerification = useMutation({
    mutationFn: async (data: FormSchema) => {
      setProcessing(true);

      const response = await axios.post("/sign-in/verify-otp", {
        ...data,
        email,
        token_name,
        device_id,
      });

      await setToken(response.data.token);
    },

    onSuccess: async () => {
      await getUser();
      resetTimer();
    },

    onError: (error: any) => {
      const serverErrors = error?.response?.data?.errors;

      if (serverErrors) {
        Object.keys(serverErrors).forEach((field) => {
          setError(field as keyof FormSchema, {
            type: "server",
            message: serverErrors[field][0],
          });
        });
      }
    },

    onSettled: () => {
      setProcessing(false);
    },
  });

  const onSubmit = (data: FormSchema) => {
    if (processing) return;

    handleOtpVerification.mutate(data);
  };

  /* ============================================================
     AUTO VERIFY
  ============================================================ */

  useEffect(() => {
    if (otp.length === 6 && !processing) {
      handleSubmit(onSubmit)();
    }
  }, [otp]);

  /* ============================================================
     TIMER
  ============================================================ */

  useEffect(() => {
    updateTimer();

    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ============================================================
     RESEND
  ============================================================ */

  const handleResend = useMutation({
    mutationFn: async () => {
      setProcessing(true);

      await axios.post("/resend-otp", {
        email,
      });
    },

    onSuccess: () => {
      startTimer();
    },

    onSettled: () => {
      setProcessing(false);
    },
  });

  /* ============================================================
     HELPERS
  ============================================================ */

  const minutes = Math.floor(remainingTime / 60);

  const seconds = remainingTime % 60;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const maskedEmail =
    typeof email === "string"
      ? email.replace(
          /^(.{2})(.*)(@.*)$/,
          (_, first, middle, domain) =>
            `${first}${"*".repeat(Math.min(middle.length, 5))}${domain}`,
        )
      : "";

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View className="flex-1 px-6">
          {/* ==================================================
              PROGRESS
          ================================================== */}

          <View className="pt-5">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-xs text-primary">
                Step 2 of 2
              </Text>

              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Verify identity
              </Text>
            </View>

            <View className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <View className="h-full w-full rounded-full bg-primary" />
            </View>

            <View className="mt-2 flex-row justify-between">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />

              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            </View>
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <View className="flex-1 items-center pt-12">
            {/* ICON */}

            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Icon
                as={Mail}
                size={29}
                strokeWidth={1.6}
                className="text-primary"
              />
            </View>

            {/* TITLE */}

            <Text className="mt-6 text-center font-quicksand-bold text-[28px] leading-9">
              Verify your identity
            </Text>

            <Text className="mt-3 max-w-[330px] text-center font-quicksand-medium text-sm leading-6 text-muted-foreground">
              Enter the 6-digit code we sent to your email to securely sign you
              in.
            </Text>

            {/* EMAIL */}

            <View className="mt-4 flex-row items-center rounded-full bg-secondary px-4 py-2">
              <Text
                numberOfLines={1}
                className="font-quicksand-semibold text-sm"
              >
                {maskedEmail || email}
              </Text>
            </View>

            {/* OTP */}

            <View className="mt-10 w-full">
              <Text className="mb-4 text-center font-quicksand-semibold text-sm">
                Enter verification code
              </Text>

              <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, value } }) => (
                  <OtpInput
                    onChange={onChange}
                    value={value}
                    error={errors.otp?.message}
                  />
                )}
              />

              {processing && otp.length === 6 && (
                <Text className="mt-4 text-center font-quicksand-medium text-xs text-muted-foreground">
                  Signing you in...
                </Text>
              )}
            </View>

            {/* RESEND */}

            <View className="mt-7 items-center">
              {canResend ? (
                <Pressable
                  disabled={processing}
                  onPress={() => {
                    if (!processing) {
                      handleResend.mutate();
                    }
                  }}
                  className="rounded-full px-4 py-2"
                >
                  <Text
                    className={`font-quicksand-bold text-sm ${
                      processing ? "text-muted-foreground" : "text-primary"
                    }`}
                  >
                    {processing
                      ? "Sending..."
                      : "Didn't receive the code? Resend"}
                  </Text>
                </Pressable>
              ) : (
                <View className="flex-row items-center">
                  <Text className="font-quicksand-medium text-xs text-muted-foreground">
                    Resend available in{" "}
                  </Text>

                  <Text className="font-quicksand-bold text-xs text-primary">
                    {formattedTime}
                  </Text>
                </View>
              )}
            </View>

            {/* INFO */}

            <View className="mt-8 w-full rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <View className="flex-row">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    as={Info}
                    size={17}
                    strokeWidth={1.7}
                    className="text-primary"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-bold text-xs">
                    Didn't receive the code?
                  </Text>

                  <Text className="mt-1 font-quicksand-medium text-[11px] leading-5 text-muted-foreground">
                    Check your spam or junk folder. Email delivery may take a
                    few minutes.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ==================================================
              SECURITY FOOTER
          ================================================== */}

          <View className="items-center pb-7 pt-8">
            <View className="flex-row items-center">
              <Icon
                as={ShieldCheck}
                size={14}
                strokeWidth={1.6}
                className="text-muted-foreground"
              />

              <Text className="ml-2 font-quicksand-medium text-[10px] text-muted-foreground">
                Secure one-time verification
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
