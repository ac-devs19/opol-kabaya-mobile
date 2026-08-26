import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import Select from "@/components/select";
import axios from "@/api/axios"; // Your internal axios
import axiosStatic from "axios"; // External axios for the public API example
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { MapPin } from "lucide-react-native";

export default function Address() {
  const { user, getUser } = useAuth();

  const formSchema = z.object({
    province: z.string().nonempty("The province field is required."),
    municipality: z.string().nonempty("The municipality field is required."),
    barangay: z.string().nonempty("The barangay field is required."),
    postal_code: z.string().nonempty("The postal code field is required."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      province: "",
      municipality: "",
      barangay: "",
      postal_code: "",
    },
  });

  // 1. Initialize user data (Pre-selection)
  useEffect(() => {
    if (!user) return;
    reset({
      province: user.province ?? "",
      municipality: user.municipality ?? "",
      barangay: user.barangay ?? "",
      postal_code: user.postal_code ?? "",
    });
  }, [user, reset]);

  // 2. Watch current selections to drive dependent API calls
  const selectedProvinceName = watch("province");
  const selectedMunicipalityName = watch("municipality");

  // 3. API Queries for Locations (Example using PSGC API)
  const { data: provinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await axiosStatic.get("https://psgc.gitlab.io/api/provinces");
      return res.data; // Returns [{ code: "...", name: "..." }]
    },
  });

  // Find the code of the selected province to fetch its municipalities
  const provinceCode = useMemo(() => {
    return provinces?.find((p: any) => p.name === selectedProvinceName)?.code;
  }, [selectedProvinceName, provinces]);

  const { data: municipalities } = useQuery({
    queryKey: ["municipalities", provinceCode],
    queryFn: async () => {
      const res = await axiosStatic.get(
        `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities`,
      );
      return res.data;
    },
    enabled: !!provinceCode, // Only run if a province is selected
  });

  // Find the code of the selected municipality to fetch its barangays
  const municipalityCode = useMemo(() => {
    return municipalities?.find((m: any) => m.name === selectedMunicipalityName)
      ?.code;
  }, [selectedMunicipalityName, municipalities]);

  const { data: barangays } = useQuery({
    queryKey: ["barangays", municipalityCode],
    queryFn: async () => {
      const res = await axiosStatic.get(
        `https://psgc.gitlab.io/api/cities-municipalities/${municipalityCode}/barangays`,
      );
      return res.data;
    },
    enabled: !!municipalityCode, // Only run if a municipality is selected
  });

  // 4. Form Submission
  const handleNext = useMutation({
    mutationFn: async (data: FormSchema) => {
      await axios.post("/verification/address", data);
      await getUser();
      router.push("/home/verifications/check-information");
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
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 px-5 pt-5">
          {/* Progress and Header (Unchanged) */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-sm text-primary">
                Step 2 of 3
              </Text>
              <Text className="font-quicksand-medium text-sm text-muted-foreground">
                Address
              </Text>
            </View>
            <View className="flex-row gap-2">
              <View className="h-1.5 flex-1 rounded-full bg-primary" />
              <View className="h-1.5 flex-1 rounded-full bg-primary" />
              <View className="h-1.5 flex-1 rounded-full bg-muted" />
            </View>
          </View>

          <View className="mt-8 gap-4">
            <View className="size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Icon
                as={MapPin}
                size={28}
                strokeWidth={1.7}
                className="text-primary"
              />
            </View>
            <View className="gap-2">
              <Text className="font-quicksand-bold text-3xl">
                Address Information
              </Text>
              <Text className="font-quicksand-regular text-sm leading-5 text-muted-foreground">
                Tell us where you currently live. Please provide your complete
                residential address.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="mt-8 gap-7 pb-8">
            <View className="gap-4">
              <View>
                <Text className="font-quicksand-bold text-base">Location</Text>
                <Text className="mt-1 font-quicksand-regular text-xs text-muted-foreground">
                  Select your current location.
                </Text>
              </View>

              {/* Province Select */}
              <Controller
                control={control}
                name="province"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Province"
                    placeholder="Select your province"
                    items={
                      provinces
                        ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((p: any) => ({
                          label: p.name,
                          value: p.name,
                        })) || []
                    }
                    value={value}
                    onChange={(val) => {
                      onChange(val);

                      // Clear dependent fields
                      setValue("municipality", "");
                      setValue("barangay", "");
                    }}
                    error={errors.province?.message}
                  />
                )}
              />

              {/* Municipality / City Select */}
              <Controller
                control={control}
                name="municipality"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Municipality / City"
                    placeholder="Select your municipality or city"
                    items={
                      municipalities
                        ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((m: any) => ({
                          label: m.name,
                          value: m.name,
                        })) || []
                    }
                    value={value}
                    onChange={(val) => {
                      onChange(val);

                      // Clear dependent barangay
                      setValue("barangay", "");
                    }}
                    error={errors.municipality?.message}
                  />
                )}
              />

              {/* Barangay Select */}
              <Controller
                control={control}
                name="barangay"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Barangay"
                    placeholder="Select your barangay"
                    items={
                      barangays
                        ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((b: any) => ({
                          label: b.name,
                          value: b.name,
                        })) || []
                    }
                    value={value}
                    onChange={onChange}
                    error={errors.barangay?.message}
                  />
                )}
              />

              {/* Postal Code Input (Remains an Input) */}
              <Controller
                control={control}
                name="postal_code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Postal code"
                    placeholder="e.g. 9016"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.postal_code?.message}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                )}
              />
            </View>

            <View className="rounded-2xl bg-primary/5 px-4 py-3">
              <Text className="font-quicksand-medium text-xs leading-5 text-muted-foreground">
                Make sure your address is accurate. This information may be used
                when accessing Kabaya services that require residency
                verification.
              </Text>
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
            Step 2 of 3 • Almost there!
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
