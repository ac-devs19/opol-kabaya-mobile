import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import Button from "@/components/button";
import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";
import { Button as Btn } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  CheckCircle2,
  ChevronRight,
  MapPin,
  SquarePen,
  UserRound,
} from "lucide-react-native";

export default function CheckInformation() {
  const { user } = useAuth();

  const formatBirthDate = (date?: Date | string | null) => {
    if (!date) return "N/A";

    const parsedDate = date instanceof Date ? date : new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
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
        <View className="flex-1 px-6 pt-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="size-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Icon
                as={CheckCircle2}
                size={34}
                className="text-primary"
                strokeWidth={1.8}
              />
            </View>

            <Text className="font-quicksand-bold text-2xl text-center">
              Review Your Information
            </Text>

            <Text className="font-quicksand-regular text-sm text-muted-foreground text-center mt-2 leading-5">
              Please review your information carefully before continuing. You
              can edit any details that need to be changed.
            </Text>
          </View>

          {/* Information Cards */}
          <View className="gap-5 flex-1">
            {/* Personal Information */}
            <View className="rounded-3xl border border-border bg-card overflow-hidden">
              {/* Card Header */}
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
                <View className="flex-row items-center gap-3">
                  <View className="size-10 rounded-2xl bg-primary/10 items-center justify-center">
                    <Icon
                      as={UserRound}
                      size={20}
                      className="text-primary"
                      strokeWidth={1.7}
                    />
                  </View>

                  <View>
                    <Text className="font-quicksand-bold">
                      Personal Information
                    </Text>

                    <Text className="font-quicksand-regular text-xs text-muted-foreground">
                      Your personal details
                    </Text>
                  </View>
                </View>

                <Btn
                  onPress={() => {
                    router.dismissAll();
                    router.replace("/home/verifications/personal");
                  }}
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3"
                >
                  <Icon
                    as={SquarePen}
                    size={15}
                    className="text-primary"
                    strokeWidth={1.8}
                  />

                  <Text className="font-quicksand-semibold text-xs text-primary">
                    Edit
                  </Text>
                </Btn>
              </View>

              {/* Card Content */}
              <View className="p-5 gap-3">
                <InfoRow
                  label="Full Name"
                  value={[
                    user?.first_name,
                    user?.middle_name,
                    user?.last_name,
                    user?.suffix,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />

                <InfoRow
                  label="Birth Date"
                  value={formatBirthDate(user?.birth_date)}
                />

                <InfoRow label="Sex" value={user?.sex} />

                <InfoRow label="Marital Status" value={user?.marital_status} />

                <InfoRow label="Religion" value={user?.religion} />
              </View>
            </View>

            {/* Address Information */}
            <View className="rounded-3xl border border-border bg-card overflow-hidden">
              {/* Card Header */}
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
                <View className="flex-row items-center gap-3">
                  <View className="size-10 rounded-2xl bg-primary/10 items-center justify-center">
                    <Icon
                      as={MapPin}
                      size={20}
                      className="text-primary"
                      strokeWidth={1.7}
                    />
                  </View>

                  <View>
                    <Text className="font-quicksand-bold">
                      Address Information
                    </Text>

                    <Text className="font-quicksand-regular text-xs text-muted-foreground">
                      Your current address
                    </Text>
                  </View>
                </View>

                <Btn
                  onPress={() => router.back()}
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3"
                >
                  <Icon
                    as={SquarePen}
                    size={15}
                    className="text-primary"
                    strokeWidth={1.8}
                  />

                  <Text className="font-quicksand-semibold text-xs text-primary">
                    Edit
                  </Text>
                </Btn>
              </View>

              {/* Card Content */}
              <View className="p-5 gap-3">
                <InfoRow label="Province" value={user?.province} />

                <InfoRow label="Municipality" value={user?.municipality} />

                <InfoRow label="Barangay" value={user?.barangay} />

                <InfoRow label="Postal Code" value={user?.postal_code} />
              </View>
            </View>
          </View>

          {/* Bottom Action */}
          <View className="py-6 gap-3">
            <Text className="font-quicksand-regular text-xs text-muted-foreground text-center">
              By continuing, you confirm that the information provided is
              accurate and belongs to you.
            </Text>

            <Button
              label="Everything Looks Good"
              onPress={() => router.push("/home/verifications/identification")}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View className="flex-row items-start gap-4">
      <Text className="flex-1 font-quicksand-medium text-sm text-muted-foreground">
        {label}
      </Text>

      <Text className="flex-[1.5] font-quicksand-semibold text-sm text-right">
        {value || "N/A"}
      </Text>
    </View>
  );
}
