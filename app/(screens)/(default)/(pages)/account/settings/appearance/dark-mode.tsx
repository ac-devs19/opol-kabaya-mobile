import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import { useThemeStore } from "@/services/theme-storage";
import { Check, Monitor, Moon, Sun } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function DarkMode() {
  const { theme, setTheme } = useThemeStore();
  const { primary } = useAppColors();

  const modes = [
    {
      value: "light",
      title: "Light",
      description: "Use a bright appearance",
      icon: Sun,
    },
    {
      value: "dark",
      title: "Dark",
      description: "Use a darker appearance",
      icon: Moon,
    },
    {
      value: "system",
      title: "System",
      description: "Follow your device settings",
      icon: Monitor,
    },
  ];

  const selectedMode = modes.find((mode) => mode.value === theme) ?? modes[2];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 40,
      }}
    >
      <View className="px-5 pt-5">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <View className="items-center rounded-[32px] bg-secondary px-6 py-7">
          <View className="size-16 items-center justify-center rounded-full bg-background">
            <Icon
              as={theme === "dark" ? Moon : theme === "light" ? Sun : Monitor}
              size={29}
              strokeWidth={1.7}
              className="text-primary"
            />
          </View>

          <Text className="mt-4 text-center font-quicksand-bold text-2xl">
            Appearance
          </Text>

          <Text className="mt-2 max-w-[300px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            Choose how Kabaya looks on your device.
          </Text>
        </View>

        {/* =====================================================
            CURRENT THEME
        ====================================================== */}
        <View className="mt-7 flex-row items-center justify-between px-1">
          <Text className="font-quicksand-bold text-lg">Theme</Text>

          <View className="rounded-full bg-primary/10 px-3 py-1.5">
            <Text className="font-quicksand-semibold text-[10px] text-primary">
              {selectedMode.title.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* =====================================================
            THEME OPTIONS
        ====================================================== */}
        <View className="mt-3 gap-3">
          {modes.map((mode) => {
            const isSelected = theme === mode.value;

            return (
              <TouchableOpacity
                key={mode.value}
                activeOpacity={0.75}
                onPress={() => setTheme(mode.value as any)}
                className={`flex-row items-center rounded-3xl border p-4 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {/* Icon */}
                <View
                  className={`size-12 items-center justify-center rounded-2xl ${
                    isSelected ? "bg-primary/10" : "bg-secondary"
                  }`}
                >
                  <Icon
                    as={mode.icon}
                    size={22}
                    strokeWidth={1.7}
                    className={
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }
                  />
                </View>

                {/* Text */}
                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-bold text-sm">
                    {mode.title}
                  </Text>

                  <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                    {mode.description}
                  </Text>
                </View>

                {/* Selection */}
                <View
                  className={`size-7 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {isSelected && (
                    <Icon
                      as={Check}
                      size={15}
                      strokeWidth={2.5}
                      color="white"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* =====================================================
            SYSTEM MODE INFO
        ====================================================== */}
        <View className="mt-6 flex-row rounded-3xl bg-secondary p-4">
          <View className="size-10 items-center justify-center rounded-full bg-background">
            <Icon
              as={Monitor}
              size={18}
              strokeWidth={1.7}
              className="text-primary"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="font-quicksand-semibold text-sm">
              Using System?
            </Text>

            <Text className="mt-1 font-quicksand-medium text-xs leading-4 text-muted-foreground">
              When System is selected, Kabaya will automatically switch between
              Light and Dark mode according to your device&apos;s appearance
              settings.
            </Text>
          </View>
        </View>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <View className="mt-7 items-center px-5">
          <Text className="text-center font-quicksand-medium text-[10px] leading-4 text-muted-foreground/70">
            You can change your appearance preference anytime from Settings.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
