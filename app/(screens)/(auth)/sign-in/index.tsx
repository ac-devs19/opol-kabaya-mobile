import AppLogo from "@/components/app-logo";
import Button from "@/components/button";
import Input from "@/components/input";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useLoader } from "@/hooks/useLoader";
import { useOtpAlert } from "@/hooks/useOtpAlert";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import axios from "@/api/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowRight, Mail, ShieldCheck, UserPlus } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
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

  /* ============================================================
     SIGN IN
  ============================================================ */

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
              BRAND
          ================================================== */}

          <View className="items-center pt-5">
            <AppLogo className="h-9 w-[76px]" />
          </View>

          {/* ==================================================
              HEADER
          ================================================== */}

          <View className="mt-10">
            <Text className="font-quicksand-bold text-[30px] leading-9">
              Welcome back
            </Text>

            <Text className="mt-3 max-w-[340px] font-quicksand-medium text-sm leading-6 text-muted-foreground">
              Sign in to your Kabaya account to continue accessing your
              community services.
            </Text>
          </View>

          {/* ==================================================
              PROGRESS
          ================================================== */}

          <View className="mt-8">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-xs text-primary">
                Step 1 of 2
              </Text>

              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Account email
              </Text>
            </View>

            <View className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <View className="h-full w-1/2 rounded-full bg-primary" />
            </View>

            <View className="mt-2 flex-row justify-between">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <View className="h-1.5 w-1.5 rounded-full bg-border" />
            </View>
          </View>

          {/* ==================================================
              EMAIL SECTION
          ================================================== */}

          <View className="mt-9">
            <View className="mb-5 flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon
                  as={Mail}
                  size={19}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>

              <View className="ml-3">
                <Text className="font-quicksand-bold text-base">
                  Account email
                </Text>

                <Text className="mt-0.5 font-quicksand-medium text-[11px] text-muted-foreground">
                  Enter the email linked to your account
                </Text>
              </View>
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
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!processing}
                />
              )}
            />

            <View className="mt-3 flex-row items-center px-1">
              <Icon
                as={ShieldCheck}
                size={14}
                strokeWidth={1.6}
                className="text-muted-foreground"
              />

              <Text className="ml-2 flex-1 font-quicksand-medium text-[11px] leading-5 text-muted-foreground">
                We'll send a one-time verification code to this email address.
              </Text>
            </View>
          </View>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View className="mt-auto pb-7 pt-12">
            <Button
              onPress={handleSubmit(onSubmit)}
              label="Continue"
              disabled={processing}
            />

            {/* ==================================================
                CREATE ACCOUNT
            ================================================== */}

            <View className="mt-7 flex-row items-center">
              <View className="h-px flex-1 bg-border" />

              <Text className="mx-4 font-quicksand-medium text-[10px] uppercase tracking-wider text-muted-foreground">
                New to Kabaya?
              </Text>

              <View className="h-px flex-1 bg-border" />
            </View>

            <Pressable
              onPress={() => router.replace("/sign-up")}
              disabled={processing}
              className="mt-5 flex-row items-center justify-center rounded-2xl border border-border bg-secondary/50 py-4"
            >
              <Icon
                as={UserPlus}
                size={17}
                strokeWidth={1.7}
                className="text-primary"
              />

              <Text className="ml-2 font-quicksand-bold text-sm text-primary">
                Create an account
              </Text>

              <Icon
                as={ArrowRight}
                size={16}
                strokeWidth={1.8}
                className="ml-2 text-primary"
              />
            </Pressable>

            <Text className="mt-4 text-center font-quicksand-medium text-[10px] leading-4 text-muted-foreground">
              Secure access with email verification
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
