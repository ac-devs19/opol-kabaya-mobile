import { ActivityIndicator, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import MPin from "@/components/mpin";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  Check,
  ChevronLeft,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react-native";
import { useAppColors } from "@/lib/theme";

export default function ChangePin() {
  const [step, setStep] = useState<1 | 2>(1);

  const { primary } = useAppColors();

  const formSchema = z
    .object({
      password: z.string().length(4, "PIN must be exactly 4 digits."),
      password_confirmation: z
        .string()
        .length(4, "PIN must be exactly 4 digits."),
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
  const password_confirmation = watch("password_confirmation");

  const handleCreatePin = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/settings/change-pin", data);
    },

    onError: (error: any) => {
      const serverErrors = error.response?.data?.errors;

      if (serverErrors) {
        Object.keys(serverErrors).forEach((field) => {
          setError(field as keyof FormSchema, {
            type: "server",
            message: serverErrors[field][0],
          });
        });
      } else {
        setError("password_confirmation", {
          type: "server",
          message: "Unable to change your PIN. Please try again.",
        });
      }
    },

    onSuccess: () => {
      router.back();
    },
  });

  const onSubmit = async (data: FormSchema) => {
    if (handleCreatePin.isPending) return;

    handleCreatePin.mutate(data);
  };

  /*
   * Automatically move to confirmation
   * after entering the first 4 digits.
   */
  useEffect(() => {
    if (step === 1 && password.length === 4) {
      setStep(2);
    }
  }, [password, step]);

  /*
   * Automatically submit after confirmation
   * reaches 4 digits.
   */
  useEffect(() => {
    if (
      step === 2 &&
      password_confirmation.length === 4 &&
      !handleCreatePin.isPending
    ) {
      handleSubmit(onSubmit)();
    }
  }, [password_confirmation, step, handleCreatePin.isPending]);

  const handleReset = () => {
    if (handleCreatePin.isPending) return;

    setValue("password", "");
    setValue("password_confirmation", "");
    setStep(1);
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 px-5 pb-8 pt-5">
          {/* =====================================================
              MAIN CONTENT
          ====================================================== */}
          <View className="flex-1">
            {/* Security Header */}
            <View className="mt-10 items-center">
              <View className="size-16 items-center justify-center rounded-full bg-primary/10">
                <Icon
                  as={LockKeyhole}
                  size={28}
                  strokeWidth={1.7}
                  className="text-primary"
                />
              </View>

              <Text className="mt-5 text-center font-quicksand-bold text-2xl">
                {step === 1 ? "Create a new PIN" : "Confirm your PIN"}
              </Text>

              <Text className="mt-2 max-w-[300px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
                {step === 1
                  ? "Choose a 4-digit PIN that you'll use to secure your Kabaya account."
                  : "Enter your new PIN again to make sure both PINs match."}
              </Text>
            </View>

            {/* =================================================
                PROGRESS
            ================================================== */}
            <View className="mt-9">
              <View className="flex-row items-center">
                {/* Step 1 */}
                <View className="items-center">
                  <View
                    className={`size-9 items-center justify-center rounded-full ${
                      step === 2 ? "bg-primary" : "bg-primary"
                    }`}
                  >
                    {step === 2 ? (
                      <Icon
                        as={Check}
                        size={17}
                        strokeWidth={2.5}
                        className="text-primary-foreground"
                      />
                    ) : (
                      <Text className="font-quicksand-bold text-sm text-primary-foreground">
                        1
                      </Text>
                    )}
                  </View>

                  <Text className="mt-2 font-quicksand-semibold text-[10px] text-muted-foreground">
                    CREATE PIN
                  </Text>
                </View>

                {/* Progress Line */}
                <View
                  className={`mx-3 h-1 flex-1 rounded-full ${
                    step === 2 ? "bg-primary" : "bg-secondary"
                  }`}
                />

                {/* Step 2 */}
                <View className="items-center">
                  <View
                    className={`size-9 items-center justify-center rounded-full ${
                      step === 2 ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    <Text
                      className={`font-quicksand-bold text-sm ${
                        step === 2
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      2
                    </Text>
                  </View>

                  <Text className="mt-2 font-quicksand-semibold text-[10px] text-muted-foreground">
                    CONFIRM PIN
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                PIN INPUT CARD
            ================================================== */}
            <View className="mt-10 rounded-[32px] border border-border bg-card px-5 py-7">
              <View className="items-center">
                <View className="mb-5 flex-row items-center rounded-full bg-secondary px-3 py-1.5">
                  <Icon
                    as={ShieldCheck}
                    size={13}
                    strokeWidth={1.8}
                    className="mr-1.5 text-primary"
                  />

                  <Text className="font-quicksand-semibold text-[10px] text-muted-foreground">
                    {step === 1 ? "ENTER NEW PIN" : "CONFIRM NEW PIN"}
                  </Text>
                </View>

                <View className="w-full">
                  {step === 1 ? (
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, value } }) => (
                        <MPin onChange={onChange} value={value} />
                      )}
                    />
                  ) : (
                    <Controller
                      control={control}
                      name="password_confirmation"
                      render={({ field: { onChange, value } }) => (
                        <MPin onChange={onChange} value={value} />
                      )}
                    />
                  )}
                </View>

                {/* Error */}
                {step === 2 && errors.password_confirmation && (
                  <View className="mt-5 rounded-2xl bg-destructive/10 px-4 py-3">
                    <Text className="text-center font-quicksand-semibold text-xs leading-4 text-destructive">
                      {errors.password_confirmation.message}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* =================================================
                SECURITY NOTE
            ================================================== */}
            <View className="mt-5 flex-row rounded-2xl bg-secondary p-4">
              <View className="size-8 items-center justify-center rounded-full bg-background">
                <Icon
                  as={ShieldCheck}
                  size={16}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-quicksand-semibold text-xs">
                  Keep your PIN private
                </Text>

                <Text className="mt-1 font-quicksand-medium text-[10px] leading-4 text-muted-foreground">
                  Never share your PIN with anyone, including Kabaya staff.
                </Text>
              </View>
            </View>
          </View>

          {/* =====================================================
              BOTTOM ACTION
          ====================================================== */}
          <View className="items-center pt-6">
            {handleCreatePin.isPending ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={primary} />

                <Text className="ml-2 font-quicksand-semibold text-xs text-muted-foreground">
                  Updating your PIN...
                </Text>
              </View>
            ) : step === 2 ? (
              <Pressable
                onPress={handleReset}
                className="rounded-full px-5 py-2.5 active:bg-secondary"
              >
                <Text className="font-quicksand-semibold text-sm text-primary">
                  Start over
                </Text>
              </Pressable>
            ) : (
              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Enter 4 digits to continue
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
