import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import Input from "@/components/input";
import Select from "@/components/select";
import DatePicker from "@/components/date-picker";
import { maritalStatuses, religions, suffixs } from "@/components/others";
import axios from "@/api/axios";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { UserRound } from "lucide-react-native";

export default function Personal() {
  const { user, getUser } = useAuth();

  const formSchema = z.object({
    first_name: z.string().nonempty("The first name field is required."),
    suffix: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().nonempty("The last name field is required."),
    birth_date: z.date("The birth date field is required."),
    sex: z.string().nonempty("The sex field is required."),
    marital_status: z
      .string()
      .nonempty("The marital status field is required."),
    religion: z.string().nonempty("The religion field is required."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      suffix: "",
      middle_name: "",
      last_name: "",
      birth_date: undefined,
      sex: "",
      marital_status: "",
      religion: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({
      first_name: user.first_name ?? "",
      suffix: user.suffix ?? "",
      middle_name: user.middle_name ?? "",
      last_name: user.last_name ?? "",
      birth_date: user.birth_date ? new Date(user.birth_date) : undefined,
      sex: user.sex ?? "",
      marital_status: user.marital_status ?? "",
      religion: user.religion ?? "",
    });
  }, [user, reset]);

  const handleNext = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/verification/personal", {
        ...data,
        birth_date: data.birth_date.toISOString().split("T")[0],
      });

      await getUser();

      router.push("/home/verifications/address");
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
    handleNext.mutate(data);
  };

  const processing = handleNext.isPending;

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 px-5 pt-5">
          {/* Progress */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-sm text-primary">
                Step 1 of 3
              </Text>

              <Text className="font-quicksand-medium text-sm text-muted-foreground">
                Personal
              </Text>
            </View>

            <View className="flex-row gap-2">
              <View className="h-1.5 flex-1 rounded-full bg-primary" />
              <View className="h-1.5 flex-1 rounded-full bg-muted" />
              <View className="h-1.5 flex-1 rounded-full bg-muted" />
            </View>
          </View>

          {/* Header */}
          <View className="mt-8 gap-4">
            <View className="size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Icon
                as={UserRound}
                size={28}
                strokeWidth={1.7}
                className="text-primary"
              />
            </View>

            <View className="gap-2">
              <Text className="font-quicksand-bold text-3xl">
                Personal Information
              </Text>

              <Text className="font-quicksand-regular text-sm leading-5 text-muted-foreground">
                Tell us a little about yourself. Make sure your information
                matches your valid identification document.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="mt-8 gap-7 pb-8">
            {/* Basic Information */}
            <View className="gap-4">
              <View>
                <Text className="font-quicksand-bold text-base">
                  Basic Information
                </Text>

                <Text className="mt-1 font-quicksand-regular text-xs text-muted-foreground">
                  Enter your complete name as it appears on your ID.
                </Text>
              </View>

              {/* First Name + Suffix */}
              <View className="flex-row items-start gap-3">
                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-1">
                      <Input
                        label="First name"
                        placeholder="Juan"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.first_name?.message}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="suffix"
                  render={({ field: { onChange, value } }) => (
                    <View className="w-[100px]">
                      <Select
                        label="Suffix"
                        placeholder="None"
                        items={suffixs}
                        value={value}
                        onChange={onChange}
                      />
                    </View>
                  )}
                />
              </View>

              {/* Middle Name */}
              <Controller
                control={control}
                name="middle_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Middle name"
                    placeholder="Santos"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                )}
              />

              {/* Last Name */}
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Last name"
                    placeholder="Dela Cruz"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.last_name?.message}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                )}
              />
            </View>

            {/* Personal Details */}
            <View className="gap-4">
              <View>
                <Text className="font-quicksand-bold text-base">
                  Personal Details
                </Text>

                <Text className="mt-1 font-quicksand-regular text-xs text-muted-foreground">
                  Provide your basic personal information.
                </Text>
              </View>

              {/* Birth Date */}
              <Controller
                control={control}
                name="birth_date"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Birth date"
                    value={value}
                    onChange={onChange}
                    error={errors.birth_date?.message}
                  />
                )}
              />

              {/* Sex */}
              <Controller
                control={control}
                name="sex"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Sex"
                    placeholder="Select your sex"
                    items={[
                      {
                        label: "Male",
                        value: "Male",
                      },
                      {
                        label: "Female",
                        value: "Female",
                      },
                    ]}
                    value={value}
                    onChange={onChange}
                    error={errors.sex?.message}
                  />
                )}
              />

              {/* Marital Status */}
              <Controller
                control={control}
                name="marital_status"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Marital status"
                    placeholder="Select your marital status"
                    items={maritalStatuses}
                    value={value}
                    onChange={onChange}
                    error={errors.marital_status?.message}
                  />
                )}
              />

              {/* Religion */}
              <Controller
                control={control}
                name="religion"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Religion"
                    placeholder="Select your religion"
                    items={religions}
                    value={value}
                    onChange={onChange}
                    error={errors.religion?.message}
                  />
                )}
              />
            </View>
          </View>
        </View>

        {/* Bottom Action */}
        <View className="border-t border-border bg-background px-5 pb-5 pt-4">
          <Button
            label="Continue"
            onPress={handleSubmit(onSubmit)}
            loading={processing}
            disabled={processing}
          />

          <Text className="mt-3 text-center font-quicksand-regular text-xs text-muted-foreground">
            Step 1 of 3 • You can review your information before submitting.
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
