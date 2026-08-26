import { useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useAppColors } from "@/lib/theme";

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

import { CalendarDays, Check, ChevronDown, Clock3 } from "lucide-react-native";

import { SafeAreaView } from "react-native-safe-area-context";

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;

  placeholder?: string;

  mode?: "date" | "time" | "datetime";

  display?: "default" | "spinner" | "calendar" | "clock";

  minimumDate?: Date;
  maximumDate?: Date;

  disabled?: boolean;

  className?: string;

  label?: string;
  error?: string;
};

export default function DatePicker({
  value,
  onChange,

  placeholder = "Select date",

  mode = "date",

  display = Platform.OS === "ios" ? "spinner" : "default",

  minimumDate,
  maximumDate,

  disabled = false,

  className,

  label,
  error,
}: DatePickerProps) {
  const { card, primary } = useAppColors();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  /**
   * Temporary value used on iOS.
   *
   * The actual form value is only updated
   * when the user presses Done.
   */
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  const snapPoints = useMemo(() => {
    if (mode === "datetime") {
      return ["55%"];
    }

    return ["48%"];
  }, [mode]);

  /**
   * ------------------------------------------------------------
   * FORMAT DATE
   * ------------------------------------------------------------
   */

  const formattedValue = useMemo(() => {
    if (!value) return "";

    if (mode === "time") {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(value);
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(value);
  }, [value, mode]);

  /**
   * ------------------------------------------------------------
   * TEMP DATE DISPLAY
   * ------------------------------------------------------------
   */

  const formattedTempDate = useMemo(() => {
    if (mode === "time") {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(tempDate);
    }

    if (mode === "datetime") {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(tempDate);
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(tempDate);
  }, [tempDate, mode]);

  /**
   * ------------------------------------------------------------
   * OPEN
   * ------------------------------------------------------------
   */

  const handleOpen = useCallback(() => {
    if (disabled) return;

    Keyboard.dismiss();

    const openPicker = () => {
      setTempDate(value ?? new Date());

      if (Platform.OS === "ios") {
        bottomSheetModalRef.current?.present();
      } else {
        setShowAndroidPicker(true);
      }
    };

    /**
     * Wait for keyboard to finish dismissing.
     *
     * This prevents the bottom sheet from opening
     * underneath the keyboard.
     */
    if (Keyboard.isVisible?.()) {
      const subscription = Keyboard.addListener("keyboardDidHide", () => {
        subscription.remove();
        openPicker();
      });
    } else {
      openPicker();
    }
  }, [disabled, value]);

  /**
   * ------------------------------------------------------------
   * CLOSE
   * ------------------------------------------------------------
   */

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  /**
   * ------------------------------------------------------------
   * DONE
   * ------------------------------------------------------------
   */

  const handleDone = useCallback(() => {
    onChange(tempDate);

    bottomSheetModalRef.current?.dismiss();
  }, [onChange, tempDate]);

  /**
   * ------------------------------------------------------------
   * BACKDROP
   * ------------------------------------------------------------
   */

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.45}
      />
    ),
    [],
  );

  /**
   * ------------------------------------------------------------
   * DATE CHANGE
   * ------------------------------------------------------------
   */

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowAndroidPicker(false);
      return;
    }

    if (!selectedDate) return;

    if (Platform.OS === "android") {
      setShowAndroidPicker(false);
      onChange(selectedDate);
      return;
    }

    /**
     * iOS:
     * Don't immediately update the form.
     *
     * Keep the selected value locally until Done.
     */
    setTempDate(selectedDate);
  };

  /**
   * ------------------------------------------------------------
   * ICON
   * ------------------------------------------------------------
   */

  const pickerIcon = mode === "time" ? Clock3 : CalendarDays;

  return (
    <View className={cn("gap-1", className)}>
      {/* ========================================================
          INPUT
      ======================================================== */}

      <Pressable onPress={handleOpen} disabled={disabled} className="relative">
        {label && (
          <Text
            className={cn(
              "absolute left-3 top-2 z-10 font-quicksand-semibold text-xs",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {label}
          </Text>
        )}

        <View pointerEvents="none">
          <Input
            value={formattedValue}
            placeholder={placeholder}
            className={cn(
              "h-14 rounded-2xl border-transparent bg-secondary/50 pr-12 font-quicksand-semibold",
              label && "pb-0 pt-4",
              error && "border-destructive",
              disabled && "opacity-50",
            )}
          />
        </View>

        {/* Right icon */}

        <View className="absolute inset-y-0 right-3 justify-center">
          <View className="size-9 items-center justify-center rounded-xl bg-background">
            <Icon
              as={pickerIcon}
              size={18}
              strokeWidth={1.7}
              className={error ? "text-destructive" : "text-muted-foreground"}
            />
          </View>
        </View>
      </Pressable>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <Text className="ml-3 font-quicksand-medium text-xs text-destructive">
          {error}
        </Text>
      )}

      {/* ========================================================
          ANDROID PICKER
      ======================================================== */}

      {Platform.OS === "android" && showAndroidPicker && (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          display={display}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}

      {/* ========================================================
          IOS BOTTOM SHEET
      ======================================================== */}

      {Platform.OS === "ios" && (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: card,
          }}
          handleIndicatorStyle={{
            backgroundColor: primary,
            width: 40,
          }}
          enablePanDownToClose
          enableDynamicSizing={false}
        >
          <SafeAreaView edges={["bottom"]} className="flex-1">
            {/* ==================================================
                HEADER
            ================================================== */}

            <View className="px-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-lg">
                    {placeholder}
                  </Text>

                  <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
                    Select your preferred{" "}
                    {mode === "time"
                      ? "time"
                      : mode === "datetime"
                        ? "date and time"
                        : "date"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleDone}
                  activeOpacity={0.7}
                  className="flex-row items-center rounded-full bg-primary px-4 py-2.5"
                >
                  <Icon
                    as={Check}
                    size={15}
                    strokeWidth={2}
                    className="mr-1.5 text-primary-foreground"
                  />

                  <Text className="font-quicksand-bold text-xs text-primary-foreground">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ==================================================
                  SELECTED DATE PREVIEW
              ================================================== */}

              <View className="mt-5 flex-row items-center rounded-2xl bg-secondary p-4">
                <View className="size-11 items-center justify-center rounded-xl bg-background">
                  <Icon
                    as={pickerIcon}
                    size={21}
                    strokeWidth={1.7}
                    className="text-primary"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-quicksand-medium text-[10px] uppercase tracking-wider text-muted-foreground">
                    Selected
                  </Text>

                  <Text
                    numberOfLines={2}
                    className="mt-0.5 font-quicksand-bold text-sm"
                  >
                    {formattedTempDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* ==================================================
                PICKER
            ================================================== */}

            <View className="mt-4 flex-1 items-center justify-center">
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display={display}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleChange}
                themeVariant="light"
              />
            </View>
          </SafeAreaView>
        </BottomSheetModal>
      )}
    </View>
  );
}
