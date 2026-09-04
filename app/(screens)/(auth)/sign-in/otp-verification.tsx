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
import { Info } from "lucide-react-native";

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

  useEffect(() => {
    if (otp.length === 6 && !processing) {
      handleSubmit(onSubmit)();
    }
  }, [otp]);

  useEffect(() => {
    updateTimer();
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const minutes = Math.floor(remainingTime / 60);

  const seconds = remainingTime % 60;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1">
        <View className="flex-1 p-6 gap-20">
          <View className="flex-1 gap-12">
            <View className="gap-6">
              <View className="gap-3">
                <View className="flex-row items-center justify-end">
                  <Text className="font-quicksand-medium">2/3</Text>
                </View>
                <View className="gap-2">
                  <View className="h-1 overflow-hidden rounded-full bg-secondary">
                    <View className="h-full w-2/3 rounded-full bg-[#171717]" />
                  </View>
                  <View className="flex-row justify-between">
                    <View className="h-1 w-1 rounded-full bg-[#171717]" />
                    <View className="h-1 w-1 rounded-full bg-[#171717]" />
                    <View className="h-1 w-1 rounded-full bg-border" />
                  </View>
                </View>
              </View>
              <View className="gap-3">
                <Text className="font-quicksand-bold text-2xl">
                  Verify your email
                </Text>
                <Text className="font-quicksand-medium text-sm text-muted-foreground">
                  We've sent a 6-digit verification code to{" "}
                  <Text className="font-quicksand-semibold text-sm">
                    {email}
                  </Text>
                  .
                </Text>
              </View>
            </View>
            <View className="gap-4">
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
                <Text className="text-center font-quicksand-medium text-xs text-muted-foreground">
                  Verifying your code...
                </Text>
              )}
              <View className="items-center">
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
                    <Text className="font-quicksand-medium text-sm text-muted-foreground">
                      Resend available in{" "}
                    </Text>
                    <Text className="font-quicksand-bold text-sm text-primary">
                      {formattedTime}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="w-full rounded-2xl border border-primary/10 bg-primary/5 p-4">
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
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
