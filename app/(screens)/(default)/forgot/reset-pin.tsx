import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import MPin from "@/components/mpin";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Icon } from "@/components/ui/icon";
import {
  ArrowLeft,
  Check,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react-native";

export default function ResetPin() {
  const { device_id, getUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  const formSchema = z
    .object({
      password: z.string().length(4, "PIN must contain 4 digits."),
      password_confirmation: z.string().length(4, "PIN must contain 4 digits."),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "PINs do not match. Please try again.",
      path: ["password_confirmation"],
    });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const password = watch("password");
  const confirmation = watch("password_confirmation");

  /* ============================================================
     RESET PIN
  ============================================================ */

  const resetPin = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/forgot/reset-pin", {
        ...data,
        device_id,
      });

      await getUser();
    },

    onSuccess: () => {
      router.replace("/login");
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
  });

  const onSubmit = (data: FormSchema) => {
    if (resetPin.isPending) return;

    resetPin.mutate(data);
  };

  /* ============================================================
     STEP 1 → STEP 2
  ============================================================ */

  useEffect(() => {
    if (step === 1 && password.length === 4) {
      setTimeout(() => {
        setStep(2);
      }, 150);
    }
  }, [password, step]);

  /* ============================================================
     STEP 2 AUTO SUBMIT
  ============================================================ */

  useEffect(() => {
    if (step === 2 && confirmation.length === 4 && !resetPin.isPending) {
      handleSubmit(onSubmit)();
    }
  }, [confirmation, step]);

  /* ============================================================
     CHANGE PIN
  ============================================================ */

  const changePin = () => {
    setValue("password", "");
    setValue("password_confirmation", "");
    setStep(1);
  };

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
              HEADER
          ================================================== */}

          <View className="items-center">
            <View className="size-16 items-center justify-center rounded-[22px] bg-primary/10">
              <Icon
                as={step === 1 ? LockKeyhole : Check}
                size={30}
                strokeWidth={1.7}
                className="text-primary"
              />
            </View>

            <Text className="mt-5 text-center font-quicksand-bold text-2xl">
              {step === 1 ? "Create a new PIN" : "Confirm your new PIN"}
            </Text>

            <Text className="mt-2 max-w-[310px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
              {step === 1
                ? "Choose a 4-digit PIN that you can remember and keep secure."
                : "Enter your new PIN one more time to make sure it is correct."}
            </Text>
          </View>

          {/* ==================================================
              PROGRESS
          ================================================== */}

          <View className="mt-8">
            <View className="flex-row items-center">
              <View
                className={`size-7 items-center justify-center rounded-full ${
                  step >= 1 ? "bg-primary" : "bg-secondary"
                }`}
              >
                {step > 1 ? (
                  <Icon
                    as={Check}
                    size={14}
                    strokeWidth={2}
                    className="text-primary-foreground"
                  />
                ) : (
                  <Text className="font-quicksand-bold text-xs text-primary-foreground">
                    1
                  </Text>
                )}
              </View>

              <View
                className={`mx-2 h-px flex-1 ${
                  step === 2 ? "bg-primary" : "bg-border"
                }`}
              />

              <View
                className={`size-7 items-center justify-center rounded-full ${
                  step === 2 ? "bg-primary" : "bg-secondary"
                }`}
              >
                <Text
                  className={`font-quicksand-bold text-xs ${
                    step === 2
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  2
                </Text>
              </View>
            </View>

            <View className="mt-2 flex-row justify-between">
              <Text className="font-quicksand-semibold text-[10px] text-primary">
                {step === 1 ? "New PIN" : "Completed"}
              </Text>

              <Text
                className={`font-quicksand-medium text-[10px] ${
                  step === 2 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Confirm
              </Text>
            </View>
          </View>

          {/* ==================================================
              PIN CARD
          ================================================== */}

          <View className="mt-10 rounded-[30px] border border-border bg-card p-6">
            <View className="items-center">
              <View className="mb-5 flex-row items-center rounded-full bg-secondary px-4 py-2">
                <Icon
                  as={KeyRound}
                  size={14}
                  strokeWidth={1.7}
                  className="mr-2 text-primary"
                />

                <Text className="font-quicksand-semibold text-xs">
                  {step === 1 ? "Enter new PIN" : "Confirm new PIN"}
                </Text>
              </View>

              {/* PIN */}

              {step === 1 ? (
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View className="w-full">
                      <MPin onChange={onChange} value={value} />
                    </View>
                  )}
                />
              ) : (
                <Controller
                  control={control}
                  name="password_confirmation"
                  render={({ field: { onChange, value } }) => (
                    <View className="w-full">
                      <MPin onChange={onChange} value={value} />

                      {errors.password_confirmation && (
                        <Text className="mt-4 text-center font-quicksand-medium text-xs text-destructive">
                          {errors.password_confirmation.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          </View>

          {/* ==================================================
              REQUIREMENT
          ================================================== */}

          {step === 1 && (
            <View className="mt-5 flex-row items-center justify-center">
              <View className="size-5 items-center justify-center rounded-full bg-primary/10">
                <Icon
                  as={Check}
                  size={12}
                  strokeWidth={2}
                  className="text-primary"
                />
              </View>

              <Text className="ml-2 font-quicksand-medium text-xs text-muted-foreground">
                Your PIN must contain exactly 4 digits
              </Text>
            </View>
          )}

          {/* ==================================================
              PROCESSING
          ================================================== */}

          {resetPin.isPending && (
            <View className="mt-5 items-center">
              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Securing your new PIN...
              </Text>
            </View>
          )}

          {/* ==================================================
              SECURITY
          ================================================== */}

          <View className="mt-8 flex-row rounded-2xl bg-secondary p-4">
            <Icon
              as={ShieldCheck}
              size={18}
              strokeWidth={1.6}
              className="mr-3 text-primary"
            />

            <Text className="flex-1 font-quicksand-medium text-xs leading-5 text-muted-foreground">
              Keep your PIN private. Avoid using easily guessed numbers such as
              your birthday or phone number.
            </Text>
          </View>
        </View>

        {/* ==================================================
            CHANGE PIN
        ================================================== */}

        {step === 2 && !resetPin.isPending && (
          <TouchableOpacity
            onPress={changePin}
            activeOpacity={0.7}
            className="mt-6 items-center py-3"
          >
            <View className="flex-row items-center">
              <Icon
                as={ArrowLeft}
                size={15}
                strokeWidth={1.7}
                className="mr-1.5 text-primary"
              />

              <Text className="font-quicksand-semibold text-sm text-primary">
                Change PIN
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <View className="items-center pt-3">
          <View className="flex-row items-center">
            <Icon
              as={ShieldCheck}
              size={15}
              strokeWidth={1.6}
              className="mr-1.5 text-muted-foreground"
            />

            <Text className="font-quicksand-medium text-xs text-muted-foreground">
              Secure PIN recovery
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
