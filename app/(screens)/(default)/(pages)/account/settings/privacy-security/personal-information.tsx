import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import {
  CalendarDays,
  ChevronRight,
  Contact,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalInformation() {
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

  const fullName = [user?.first_name, user?.middle_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  const formatAddress = () => {
    const parts = [
      user?.street_name,
      user?.barangay,
      user?.municipality,
      user?.province,
      user?.postal_code,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const InformationRow = ({
    icon,
    label,
    value,
    showDivider = true,
  }: {
    icon: any;
    label: string;
    value?: string | number | null;
    showDivider?: boolean;
  }) => {
    return (
      <>
        <View className="flex-row items-center px-4 py-4">
          <View className="size-10 items-center justify-center rounded-2xl bg-primary/10">
            <Icon
              as={icon}
              size={19}
              strokeWidth={1.8}
              className="text-primary"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="font-quicksand-medium text-xs text-muted-foreground">
              {label}
            </Text>

            <Text
              numberOfLines={2}
              className="mt-1 font-quicksand-semibold text-sm"
            >
              {value || "Not provided"}
            </Text>
          </View>
        </View>

        {showDivider && <View className="ml-[68px] border-t border-border" />}
      </>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="px-5 pt-5">
          {/* =====================================================
              PROFILE HEADER
          ====================================================== */}
          <View className="items-center rounded-[32px] bg-secondary px-5 py-6">
            <View className="relative">
              <View className="size-24 items-center justify-center rounded-full bg-background">
                {user?.latest_verification?.face_image ? (
                  <Image
                    source={{
                      uri: `https://lh3.googleusercontent.com/d/${user?.latest_verification?.face_image}`,
                    }}
                    className="size-20 rounded-full"
                  />
                ) : (
                  <Image
                    source={require("@/assets/images/kabaya/user.png")}
                    resizeMode="contain"
                    className="size-20 rounded-full"
                  />
                )}
              </View>

              {user?.is_verified === 1 && (
                <View className="absolute bottom-0 right-0 size-7 items-center justify-center rounded-full border-4 border-secondary bg-primary">
                  <Icon
                    as={ShieldCheck}
                    size={13}
                    strokeWidth={2.5}
                    className="text-primary-foreground"
                  />
                </View>
              )}
            </View>

            <Text className="mt-4 text-center font-quicksand-bold text-xl">
              {fullName || "Your Name"}
            </Text>

            <View className="mt-2 rounded-full bg-background px-3 py-1.5">
              <Text className="font-quicksand-semibold text-xs text-muted-foreground">
                ID: {user?.id_number || "Not available"}
              </Text>
            </View>
          </View>

          {/* =====================================================
              PERSONAL DETAILS
          ====================================================== */}
          <View className="mt-7">
            <View className="mb-3 flex-row items-center">
              <View className="size-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon
                  as={User}
                  size={18}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>

              <View className="ml-3">
                <Text className="font-quicksand-bold text-lg">
                  Personal Details
                </Text>

                <Text className="font-quicksand-medium text-xs text-muted-foreground">
                  Your basic personal information
                </Text>
              </View>
            </View>

            <View className="overflow-hidden rounded-3xl border border-border bg-card">
              <InformationRow
                icon={Contact}
                label="Full Name"
                value={fullName}
              />

              <InformationRow
                icon={CalendarDays}
                label="Birth Date"
                value={formatBirthDate(user?.birth_date)}
              />

              <InformationRow
                icon={User}
                label="Gender"
                value={user?.sex}
                showDivider={false}
              />
            </View>
          </View>

          {/* =====================================================
              CONTACT INFORMATION
          ====================================================== */}
          <View className="mt-7">
            <View className="mb-3 flex-row items-center">
              <View className="size-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon
                  as={Phone}
                  size={18}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>

              <View className="ml-3">
                <Text className="font-quicksand-bold text-lg">
                  Contact Information
                </Text>

                <Text className="font-quicksand-medium text-xs text-muted-foreground">
                  Your contact details
                </Text>
              </View>
            </View>

            <View className="overflow-hidden rounded-3xl border border-border bg-card">
              <InformationRow
                icon={Phone}
                label="Mobile Number"
                value={user?.mobile_number}
              />

              <InformationRow
                icon={Mail}
                label="Email Address"
                value={user?.email}
                showDivider={false}
              />
            </View>
          </View>

          {/* =====================================================
              ADDRESS
          ====================================================== */}
          <View className="mt-7">
            <View className="mb-3 flex-row items-center">
              <View className="size-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon
                  as={Home}
                  size={18}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>

              <View className="ml-3">
                <Text className="font-quicksand-bold text-lg">Address</Text>

                <Text className="font-quicksand-medium text-xs text-muted-foreground">
                  Your registered address
                </Text>
              </View>
            </View>

            <View className="overflow-hidden rounded-3xl border border-border bg-card">
              <InformationRow
                icon={MapPin}
                label="Address"
                value={formatAddress()}
                showDivider={false}
              />
            </View>
          </View>

          {/* =====================================================
              VERIFICATION NOTICE
          ====================================================== */}
          <View className="mt-7 flex-row rounded-3xl bg-secondary p-4">
            <View className="size-10 items-center justify-center rounded-full bg-background">
              <Icon
                as={ShieldCheck}
                size={19}
                strokeWidth={1.8}
                className="text-primary"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-quicksand-semibold text-sm">
                Keep your information updated
              </Text>

              <Text className="mt-1 font-quicksand-medium text-xs leading-4 text-muted-foreground">
                Make sure your personal information is accurate so you can
                access Kabaya services without issues.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
