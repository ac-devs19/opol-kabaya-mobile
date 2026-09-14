import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  Ambulance,
  Copy,
  Flame,
  Phone,
  Shield,
  Zap,
} from "lucide-react-native";
import {
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

const hotlines = [
  {
    name: "PNP",
    description: "Philippine National Police",
    numbers: ["09358056370"],
    icon: Shield,
  },
  {
    name: "BFP",
    description: "Bureau of Fire Protection",
    numbers: ["09758429491"],
    icon: Flame,
  },
  {
    name: "DRRMO",
    description: "Disaster Risk Reduction & Management",
    numbers: ["09670610573"],
    icon: Shield,
  },
  {
    name: "PCF",
    description: "Ambulance / Emergency Medical",
    numbers: ["09658995309"],
    icon: Ambulance,
  },
  {
    name: "MORESCO 1",
    description: "Electric Power Emergency",
    numbers: ["09177948314", "09498892047"],
    icon: Zap,
  },
];

export default function Emergency() {
  const handleCopy = async (phoneNumber: string) => {
    try {
      await Clipboard.setStringAsync(phoneNumber);

      Alert.alert(
        "Number Copied",
        `${phoneNumber} has been copied to your clipboard.`,
      );
    } catch (error) {
      console.error("Copy error:", error);

      Alert.alert(
        "Unable to Copy",
        "An error occurred while copying the phone number.",
      );
    }
  };

  const handleCall = async (phoneNumber: string) => {
    const formattedNumber = phoneNumber.replace(/\s+/g, "").replace(/-/g, "");

    const phoneUrl = `tel:${formattedNumber}`;

    try {
      await Linking.openURL(phoneUrl);
    } catch (error) {
      console.error("Unable to open dialer:", error);

      Alert.alert(
        "Unable to Call",
        "The phone application could not be opened.",
        [
          {
            text: "Copy Number",
            onPress: () => handleCopy(phoneNumber),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >
      <SafeAreaView className="flex-1">
        <View className="gap-6 p-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="font-quicksand-bold text-2xl">Emergency</Text>

            <Text className="font-quicksand-medium text-sm text-muted-foreground">
              Quick access to emergency hotlines
            </Text>
          </View>

          {/* Emergency Banner */}
          <View className="overflow-hidden rounded-3xl bg-destructive">
            <View className="flex-row items-center p-5">
              <View className="mr-4 size-12 items-center justify-center rounded-full bg-white/15">
                <Icon
                  as={Phone}
                  size={23}
                  strokeWidth={2}
                  className="text-white"
                />
              </View>

              <View className="flex-1">
                <Text className="font-quicksand-bold text-base text-white">
                  Need immediate help?
                </Text>

                <Text className="mt-1 font-quicksand-medium text-xs leading-5 text-white/80">
                  Contact the appropriate emergency service below.
                </Text>
              </View>
            </View>
          </View>

          {/* Contacts Title */}
          <View className="gap-1">
            <Text className="font-quicksand-bold text-lg">Contacts</Text>

            <Text className="font-quicksand-medium text-xs text-muted-foreground">
              Tap Call to contact an emergency service
            </Text>
          </View>

          {/* Hotline Cards */}
          <View className="gap-4">
            {hotlines.map((hotline, hotlineIndex) => {
              const HotlineIcon = hotline.icon;

              return (
                <View
                  key={hotlineIndex}
                  className="overflow-hidden rounded-3xl border border-border bg-card"
                >
                  {/* Hotline Header */}
                  <View className="flex-row items-center px-4 pt-4">
                    <View className="size-11 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon
                        as={HotlineIcon}
                        size={21}
                        strokeWidth={2}
                        className="text-primary"
                      />
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="font-quicksand-bold text-base">
                        {hotline.name}
                      </Text>

                      <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                        {hotline.description}
                      </Text>
                    </View>
                  </View>

                  {/* Phone Numbers */}
                  <View className="px-4 pb-4 pt-4">
                    {hotline.numbers.map((number, numberIndex) => (
                      <View
                        key={`${number}-${numberIndex}`}
                        className={
                          numberIndex > 0
                            ? "mt-3 border-t border-border pt-3"
                            : ""
                        }
                      >
                        <View className="flex-row items-center">
                          {/* Number */}
                          <View className="flex-1">
                            <Text className="font-quicksand-bold text-lg tracking-wide">
                              {number}
                            </Text>

                            <Text className="mt-0.5 font-quicksand-medium text-[11px] text-muted-foreground">
                              Emergency hotline
                            </Text>
                          </View>

                          {/* Copy Button */}
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleCopy(number)}
                            className="mr-2 size-10 items-center justify-center rounded-full bg-secondary"
                          >
                            <Icon
                              as={Copy}
                              size={17}
                              strokeWidth={1.8}
                              className="text-foreground"
                            />
                          </TouchableOpacity>

                          {/* Call Button */}
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleCall(number)}
                            className="h-10 flex-row items-center rounded-full bg-primary px-4"
                          >
                            <Icon
                              as={Phone}
                              size={16}
                              strokeWidth={2}
                              className="text-primary-foreground"
                            />

                            <Text className="ml-2 font-quicksand-bold text-xs text-primary-foreground">
                              Call
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Information */}
          <View className="flex-row items-start rounded-2xl bg-secondary p-4">
            <Icon
              as={Phone}
              size={17}
              strokeWidth={1.8}
              className="mt-0.5 text-muted-foreground"
            />

            <Text className="ml-3 flex-1 font-quicksand-medium text-xs leading-5 text-muted-foreground">
              Use emergency numbers only when assistance is needed. Keep your
              phone available for return calls from responders.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
