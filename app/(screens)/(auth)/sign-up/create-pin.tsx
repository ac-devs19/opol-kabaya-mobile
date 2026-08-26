import { View, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import axios from "@/api/axios";
import { setToken } from "@/services/auth-storage";
import { useMutation } from "@tanstack/react-query";
import MPin from "@/components/mpin";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { Check, KeyRound, ShieldCheck } from "lucide-react-native";

export default function CreatePin() {
  const { email } = useLocalSearchParams();

  const { device_id, token_name, getUser } = useAuth();

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
  const passwordConfirmation = watch("password_confirmation");

  /* ============================================================
     CREATE ACCOUNT
  ============================================================ */

  const handleCreatePin = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await axios.post("/sign-up/create-pin", {
        password: data.password,
        password_confirmation: data.password_confirmation,
        email,
        device_id,
        token_name,
      });

      await setToken(response.data.token);
      await getUser();
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
      }
    },
  });

  const onSubmit = (data: FormSchema) => {
    if (handleCreatePin.isPending) return;

    handleCreatePin.mutate(data);
  };

  /* ============================================================
     MOVE TO CONFIRM
  ============================================================ */

  useEffect(() => {
    if (step === 1 && password.length === 4) {
      setStep(2);
    }
  }, [password, step]);

  /* ============================================================
     AUTO SUBMIT
  ============================================================ */

  useEffect(() => {
    if (
      step === 2 &&
      passwordConfirmation.length === 4 &&
      !handleCreatePin.isPending
    ) {
      handleSubmit(onSubmit)();
    }
  }, [passwordConfirmation, step]);

  /* ============================================================
     RESET
  ============================================================ */

  const handleReset = () => {
    setValue("password", "");
    setValue("password_confirmation", "");

    setStep(1);
  };

  const isCreating = handleCreatePin.isPending;

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
          {/* ================================================
              PROGRESS
          ================================================= */}

          <View className="pt-5">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-xs text-primary">
                Step 3 of 3
              </Text>

              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Secure account
              </Text>
            </View>

            <View className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <View className="h-full w-full rounded-full bg-primary" />
            </View>

            <View className="mt-2 flex-row justify-between">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            </View>
          </View>

          {/* ================================================
              MAIN CONTENT
          ================================================= */}

          <View className="flex-1 items-center justify-center">
            {/* ICON */}

            <View
              className={`h-16 w-16 items-center justify-center rounded-2xl ${
                step === 2 ? "bg-primary/10" : "bg-primary/10"
              }`}
            >
              <Icon
                as={step === 1 ? KeyRound : ShieldCheck}
                size={29}
                strokeWidth={1.6}
                className="text-primary"
              />
            </View>

            {/* TITLE */}

            <Text className="mt-6 text-center font-quicksand-bold text-[28px] leading-9">
              {step === 1 ? "Create your PIN" : "Confirm your PIN"}
            </Text>

            <Text className="mt-3 max-w-[310px] text-center font-quicksand-medium text-sm leading-6 text-muted-foreground">
              {step === 1
                ? "Protect your Kabaya account with a secure 4-digit PIN."
                : "Enter your PIN one more time to make sure everything is correct."}
            </Text>

            {/* PIN */}

            <View className="mt-10 w-full items-center">
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

              {/* ERROR */}

              {step === 2 && errors.password_confirmation && (
                <Text className="mt-4 px-4 text-center font-quicksand-medium text-xs text-destructive">
                  {errors.password_confirmation.message}
                </Text>
              )}
            </View>

            {/* REQUIREMENT */}

            {step === 1 && (
              <View className="mt-7 flex-row items-center rounded-full bg-secondary px-4 py-2">
                <Icon
                  as={Check}
                  size={15}
                  strokeWidth={2.2}
                  className="text-primary"
                />

                <Text className="ml-2 font-quicksand-semibold text-[11px] text-muted-foreground">
                  Your PIN must contain 4 digits
                </Text>
              </View>
            )}

            {/* CREATING */}

            {isCreating && (
              <View className="mt-6 items-center">
                <Text className="font-quicksand-medium text-xs text-muted-foreground">
                  Creating your secure account...
                </Text>
              </View>
            )}
          </View>

          {/* ================================================
              BOTTOM
          ================================================= */}

          <View className="items-center pb-7">
            {step === 2 && !isCreating && (
              <Pressable
                onPress={handleReset}
                className="rounded-full px-5 py-3"
              >
                <Text className="font-quicksand-bold text-sm text-primary">
                  Change PIN
                </Text>
              </Pressable>
            )}

            <View className="mt-2 flex-row items-center">
              <Icon
                as={ShieldCheck}
                size={14}
                strokeWidth={1.6}
                className="text-muted-foreground"
              />

              <Text className="ml-2 font-quicksand-medium text-[10px] text-muted-foreground">
                Your PIN is private and secure
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
