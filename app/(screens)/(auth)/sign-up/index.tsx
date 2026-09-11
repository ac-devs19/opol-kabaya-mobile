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
      <SafeAreaView className="flex-1">
        <View className="flex-1 p-6 gap-20">
          <View className="flex-1 gap-12">
            <View className="gap-6">
              <View className="gap-3">
                <View className="flex-row items-center justify-end">
                  <Text className="font-quicksand-medium">1/3</Text>
                </View>
                <View className="gap-2">
                  <View className="h-1 overflow-hidden rounded-full bg-secondary">
                    <View className="h-full w-1/3 rounded-full bg-primary" />
                  </View>
                  <View className="flex-row justify-between">
                    <View className="h-1 w-1 rounded-full bg-primary" />
                    <View className="h-1 w-1 rounded-full bg-border" />
                    <View className="h-1 w-1 rounded-full bg-border" />
                  </View>
                </View>
              </View>
              <View className="gap-3">
                <Text className="font-quicksand-bold text-2xl">
                  Create your account
                </Text>
                <Text className="font-quicksand-medium text-sm text-muted-foreground">
                  Enter your information exactly as it appears on your
                  identification document.
                </Text>
              </View>
            </View>
            <View className="gap-4">
              <View className="flex-row gap-2">
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
                        placeholder="Your first name"
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
              <Controller
                control={control}
                name="middle_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    label="Middle name"
                    placeholder="Your middle name"
                    autoCapitalize="words"
                  />
                )}
              />
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
                    placeholder="Your last name"
                    autoCapitalize="words"
                  />
                )}
              />
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
                    placeholder="Your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
            </View>
          </View>
          <View className="flex-1 justify-end gap-6">
            <View className="gap-3">
              <Text className="text-center font-quicksand-medium text-muted-foreground text-sm">
                By continuing, you agree to Kabaya's{" "}
                <Text className="font-quicksand-bold text-primary text-sm">
                  Terms and Conditions
                </Text>{" "}
                and{" "}
                <Text className="font-quicksand-bold text-primary text-sm">
                  Privacy Notice
                </Text>
                .
              </Text>
              <Button
                onPress={handleSubmit(onSubmit)}
                label="Continue"
                disabled={processing}
              />
            </View>
            <View className="flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              <Text className="mx-3 font-quicksand-medium text-[10px] tracking-wider uppercase text-muted-foreground">
                Already have an account?
              </Text>
              <View className="h-px flex-1 bg-border" />
            </View>
            <Button
              onPress={() => router.replace("/sign-in")}
              label="Sign in"
              variant="secondary"
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
