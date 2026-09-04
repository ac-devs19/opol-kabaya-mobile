import AppLogo from "@/components/app-logo";
import Button from "@/components/button";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useLoader } from "@/hooks/useLoader";
import { useOtpAlert } from "@/hooks/useOtpAlert";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import axios from "@/api/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

export default function SignIn() {
  const { device_id } = useAuth();
  const { canResend, startTimer } = useOtpTimer();
  const { setOpen } = useOtpAlert();
  const { processing, setProcessing } = useLoader();

  const formSchema = z.object({
    email: z.email("Please enter a valid email address."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSignIn = useMutation({
    mutationFn: async (data: FormSchema) => {
      setProcessing(true);
      await axios.post("/sign-in", {
        ...data,
        device_id,
      });
      router.push({
        pathname: "/sign-in/otp-verification",
        params: {
          email: data.email,
        },
      });
    },
    onSuccess: () => {
      startTimer();
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
    if (!canResend) {
      setOpen(true);
      return;
    }
    handleSignIn.mutate(data);
  };

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
          <View className="flex-1 justify-center gap-12">
            <View className="items-center">
              <AppLogo className="w-40 h-20" />
            </View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                  label="Email address"
                  placeholder="Your email addres"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!processing}
                />
              )}
            />
          </View>
          <View className="flex-1 justify-end gap-6">
            <Button
              onPress={handleSubmit(onSubmit)}
              label="Continue"
              disabled={processing}
            />
            <View className="flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              <Text className="mx-3 font-quicksand-medium text-[10px] tracking-wider uppercase text-muted-foreground">
                New to kabaya?
              </Text>
              <View className="h-px flex-1 bg-border" />
            </View>
            <Button
              onPress={() => router.replace("/sign-up")}
              label="Create an account"
              variant="secondary"
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
