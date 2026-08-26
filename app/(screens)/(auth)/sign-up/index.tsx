import AppLogo from "@/components/app-logo";
import Button from "@/components/button";
import DatePicker from "@/components/date-picker";
import Input from "@/components/input";
import Select from "@/components/select";
import { suffixs } from "@/components/others";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useLoader } from "@/hooks/useLoader";
import { useOtpAlert } from "@/hooks/useOtpAlert";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import axios from "@/api/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Mail, UserRound } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { View, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

export default function SignUp() {
  const { canResend, startTimer } = useOtpTimer();
  const { setOpen } = useOtpAlert();
  const { processing, setProcessing } = useLoader();

  const formSchema = z.object({
    first_name: z.string().nonempty("The first name field is required."),
    suffix: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().nonempty("The last name field is required."),
    birth_date: z.date("The birth date field is required."),
    email: z.email(),
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
      first_name: "",
      suffix: "",
      middle_name: "",
      last_name: "",
      birth_date: undefined,
      email: "",
    },
  });

  const handleSignUp = useMutation({
    mutationFn: async (data: FormSchema) => {
      setProcessing(true);
      await axios.post("/sign-up", {
        ...data,
        birth_date: data.birth_date.toISOString().split("T")[0],
      });
      router.push({
        pathname: "/sign-up/otp-verification",
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
    handleSignUp.mutate(data);
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-6">
          <View className="pt-5">
            <AppLogo />
          </View>
          <View className="mt-7">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-xs text-primary">
                Step 1 of 3
              </Text>
              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Your information
              </Text>
            </View>
            <View className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <View className="h-full w-1/3 rounded-full bg-primary" />
            </View>
            <View className="mt-2 flex-row justify-between">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <View className="h-1.5 w-1.5 rounded-full bg-border" />
              <View className="h-1.5 w-1.5 rounded-full bg-border" />
            </View>
          </View>
          <View className="mt-7">
            <Text className="font-quicksand-bold text-[29px] leading-9">
              Create your account
            </Text>
            <Text className="mt-2.5 max-w-[340px] font-quicksand-medium text-sm leading-6 text-muted-foreground">
              Enter your information exactly as it appears on your
              identification document.
            </Text>
          </View>
          <View className="mt-8">
            <View className="mb-5 flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon
                  as={UserRound}
                  size={18}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>
              <View className="ml-3">
                <Text className="font-quicksand-bold text-base">
                  Personal information
                </Text>
                <Text className="mt-0.5 font-quicksand-medium text-[11px] text-muted-foreground">
                  Your legal name and date of birth
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-1">
                    <Input
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={errors.first_name?.message}
                      label="First name"
                      placeholder="Juan"
                      autoCapitalize="words"
                    />
                  </View>
                )}
              />
              <Controller
                control={control}
                name="suffix"
                render={({ field: { onChange, value } }) => (
                  <View className="w-[120px]">
                    <Select
                      label="Suffix"
                      placeholder="Select"
                      items={suffixs}
                      value={value}
                      onChange={onChange}
                    />
                  </View>
                )}
              />
            </View>
            <View className="mt-5">
              <Controller
                control={control}
                name="middle_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    label="Middle name"
                    placeholder="Middle name"
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            <View className="mt-5">
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.last_name?.message}
                    label="Last name"
                    placeholder="Dela Cruz"
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            <View className="mt-5">
              <Controller
                control={control}
                name="birth_date"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    onChange={onChange}
                    value={value}
                    label="Date of birth"
                    error={errors.birth_date?.message}
                  />
                )}
              />
            </View>
          </View>
          <View className="mt-8">
            <View className="mb-5 flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon
                  as={Mail}
                  size={18}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>
              <View className="ml-3">
                <Text className="font-quicksand-bold text-base">
                  Contact information
                </Text>
                <Text className="mt-0.5 font-quicksand-medium text-[11px] text-muted-foreground">
                  We'll use this to verify your account
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
                />
              )}
            />
          </View>
          <View className="pb-7 pt-8">
            <Text className="mb-5 px-3 text-center font-quicksand-medium text-[10px] leading-4 text-muted-foreground">
              By continuing, you agree to Kabaya's{" "}
              <Text className="font-quicksand-bold text-primary">
                Terms and Conditions
              </Text>{" "}
              and{" "}
              <Text className="font-quicksand-bold text-primary">
                Privacy Notice
              </Text>
              .
            </Text>
            <Button
              onPress={handleSubmit(onSubmit)}
              label="Continue"
              disabled={processing}
            />
            <View className="mt-5 flex-row items-center justify-center">
              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Already have an account?
              </Text>
              <Pressable
                onPress={() => router.replace("/sign-in")}
                className="ml-1.5"
              >
                <Text className="font-quicksand-bold text-xs text-primary">
                  Sign in
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
