import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import OtpInput from "@/components/otp-input";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useLoader } from "@/hooks/useLoader";
import { Icon } from "@/components/ui/icon";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react-native";

export default function ForgotPinOtpVerification() {
  const { user } = useAuth();
  const { processing, setProcessing } = useLoader();

  const { remainingTime, canResend, startTimer, updateTimer, resetTimer } =
    useOtpTimer();

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
     MASK EMAIL
  ============================================================ */

  const maskedEmail = user?.email
    ? user.email.replace(
        /^(.{2})(.*)(@.*)$/,
        (_, first, middle, domain) =>
          `${first}${"*".repeat(Math.min(middle.length, 5))}${domain}`,
      )
    : "";

  /* ============================================================
     VERIFY OTP
  ============================================================ */

  const verifyOtp = useMutation({
    mutationFn: async (data: FormSchema) => {
      setProcessing(true);

      await axios.post("/forgot/verify-otp", {
        otp: data.otp,
      });
    },

    onSuccess: () => {
      resetTimer();

      router.replace("/forgot/reset-pin");
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
      } else {
        setError("otp", {
          type: "server",
          message: "Invalid verification code.",
        });
      }
    },

    onSettled: () => {
      setProcessing(false);
    },
  });

  const onSubmit = (data: FormSchema) => {
    if (processing) return;

    verifyOtp.mutate(data);
  };

  /* ============================================================
     AUTO VERIFY
  ============================================================ */

  useEffect(() => {
    if (otp.length === 6 && !processing && !verifyOtp.isPending) {
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

  const resendOtp = useMutation({
    mutationFn: async () => {
      setProcessing(true);

      await axios.post("/resend-otp", {
        email: user?.email,
      });
    },

    onSuccess: () => {
      startTimer();
    },

    onSettled: () => {
      setProcessing(false);
    },
  });

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView
        edges={["top", "bottom"]}
        className="flex-1 bg-background px-6 pt-8 pb-7"
      >
        <View className="flex-1">
          {/* ==================================================
              RECOVERY HEADER
          ================================================== */}

          <View className="items-center">
            <View className="size-16 items-center justify-center rounded-[22px] bg-primary/10">
              <Icon
                as={KeyRound}
                size={30}
                strokeWidth={1.6}
                className="text-primary"
              />
            </View>

            <Text className="mt-5 text-center font-quicksand-bold text-2xl">
              Recover your PIN
            </Text>

            <Text className="mt-2 max-w-[310px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
              Let's verify your identity before you create a new PIN.
            </Text>
          </View>

          {/* ==================================================
              PROGRESS
          ================================================== */}

          <View className="mt-8">
            <View className="flex-row items-center">
              <View className="size-7 items-center justify-center rounded-full bg-primary">
                <Text className="font-quicksand-bold text-xs text-primary-foreground">
                  1
                </Text>
              </View>

              <View className="mx-2 h-px flex-1 bg-border" />

              <View className="size-7 items-center justify-center rounded-full bg-secondary">
                <Text className="font-quicksand-bold text-xs text-muted-foreground">
                  2
                </Text>
              </View>

              <View className="mx-2 h-px flex-1 bg-border" />

              <View className="size-7 items-center justify-center rounded-full bg-secondary">
                <Text className="font-quicksand-bold text-xs text-muted-foreground">
                  3
                </Text>
              </View>
            </View>

            <View className="mt-2 flex-row justify-between">
              <Text className="font-quicksand-semibold text-[10px] text-primary">
                Verify
              </Text>

              <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                New PIN
              </Text>

              <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                Confirm
              </Text>
            </View>
          </View>

          {/* ==================================================
              EMAIL CARD
          ================================================== */}

          <View className="mt-8 rounded-[28px] border border-border bg-card p-5">
            <View className="flex-row items-center">
              <View className="size-11 items-center justify-center rounded-full bg-primary/10">
                <Icon
                  as={Mail}
                  size={21}
                  strokeWidth={1.6}
                  className="text-primary"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-quicksand-bold text-sm">
                  Check your email
                </Text>

                <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
                  Verification code sent to
                </Text>

                <Text className="mt-0.5 font-quicksand-semibold text-sm">
                  {maskedEmail || user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* ==================================================
              OTP
          ================================================== */}

          <View className="mt-8">
            <Text className="mb-4 text-center font-quicksand-semibold text-sm">
              Enter the 6-digit code
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

            {errors.otp?.message && (
              <Text className="mt-3 text-center font-quicksand-medium text-xs text-destructive">
                {errors.otp.message}
              </Text>
            )}
          </View>

          {/* ==================================================
              TIMER
          ================================================== */}

          <View className="mt-6 items-center">
            {!canResend ? (
              <View className="flex-row items-center">
                <Icon
                  as={Clock3}
                  size={14}
                  strokeWidth={1.7}
                  className="mr-1.5 text-muted-foreground"
                />

                <Text className="font-quicksand-medium text-xs text-muted-foreground">
                  You can request another code in{" "}
                </Text>

                <Text className="font-quicksand-bold text-xs text-primary">
                  {formattedTime}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={processing}
                onPress={() => resendOtp.mutate()}
              >
                <Text
                  className={`font-quicksand-semibold text-sm ${
                    processing ? "text-muted-foreground" : "text-primary"
                  }`}
                >
                  {processing
                    ? "Sending code..."
                    : "Didn't receive the code? Resend"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ==================================================
              SECURITY MESSAGE
          ================================================== */}

          <View className="mt-8 flex-row rounded-2xl bg-secondary p-4">
            <Icon
              as={ShieldCheck}
              size={18}
              strokeWidth={1.6}
              className="mr-3 text-primary"
            />

            <Text className="flex-1 font-quicksand-medium text-xs leading-5 text-muted-foreground">
              Never share your verification code with anyone. Kabaya will never
              ask you for your OTP.
            </Text>
          </View>
        </View>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <View className="flex-row items-center justify-center pt-6">
          <Icon
            as={CheckCircle2}
            size={15}
            strokeWidth={1.7}
            className="mr-1.5 text-muted-foreground"
          />

          <Text className="font-quicksand-medium text-xs text-muted-foreground">
            Secure account recovery
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
