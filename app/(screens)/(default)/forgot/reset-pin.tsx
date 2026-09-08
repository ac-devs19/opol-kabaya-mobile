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

  useEffect(() => {
    if (step === 1 && password.length === 4) {
      setTimeout(() => {
        setStep(2);
      }, 150);
    }
  }, [password, step]);

  useEffect(() => {
    if (step === 2 && confirmation.length === 4 && !resetPin.isPending) {
      handleSubmit(onSubmit)();
    }
  }, [confirmation, step]);

  const handleReset = () => {
    setValue("password", "");
    setValue("password_confirmation", "");
    setStep(1);
  };

  const isCreating = resetPin.isPending;

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1">
        <View className="flex-1 p-6 gap-20">
          <View className="flex-1 gap-12">
            <View className="gap-6">
              <View className="gap-3">
                <View className="flex-row items-center justify-end">
                  <Text className="font-quicksand-medium">3/3</Text>
                </View>
                <View className="gap-2">
                  <View className="h-1 overflow-hidden rounded-full bg-secondary">
                    <View className="h-full w-3/3 rounded-full bg-primary" />
                  </View>
                  <View className="flex-row justify-between">
                    <View className="h-1 w-1 rounded-full bg-primary" />
                    <View className="h-1 w-1 rounded-full bg-primary" />
                    <View className="h-1 w-1 rounded-full bg-primary" />
                  </View>
                </View>
              </View>
              <View className="gap-3">
                <Text className="font-quicksand-bold text-2xl">
                  {step === 1 ? "Create a new PIN" : "Confirm your new PIN"}
                </Text>
                <Text className="font-quicksand-medium text-sm text-muted-foreground">
                  {step === 1
                    ? "Choose a 4-digit PIN that you can remember and keep secure."
                    : "Enter your new PIN one more time to make sure it is correct."}
                </Text>
              </View>
            </View>
            {step === 1 ? (
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <MPin
                    onChange={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />
            ) : (
              <Controller
                control={control}
                name="password_confirmation"
                render={({ field: { onChange, value } }) => (
                  <MPin
                    onChange={onChange}
                    value={value}
                    error={errors.password_confirmation?.message}
                  />
                )}
              />
            )}
            {isCreating && (
              <View className="items-center">
                <Text className="font-quicksand-medium text-xs text-muted-foreground">
                  Creating your secure account...
                </Text>
              </View>
            )}
          </View>
          {step === 2 && !isCreating && (
            <View className="items-center">
              <TouchableOpacity activeOpacity={0.7} onPress={handleReset}>
                <Text className="font-quicksand-bold text-sm text-primary">
                  Change PIN
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
