import { Input } from "@/components/ui/input";
import {
  Keyboard,
  Pressable,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import React, { useCallback, useMemo, useRef } from "react";
import { useAppColors } from "@/lib/theme";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Icon } from "@/components/ui/icon";
import { Check, ChevronDown } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  items: { label: string; value: any }[];
  value?: any;
  onChange: (value: any) => void;
}

export default function Select({
  label,
  error,
  placeholder,
  items,
  value,
  onChange,
}: InputProps) {
  const { card, primary } = useAppColors();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const closeResolver = useRef<(() => void) | null>(null);

  const handleOpen = useCallback(() => {
    if (Keyboard.isVisible?.()) {
      const subscription = Keyboard.addListener("keyboardDidHide", () => {
        bottomSheetModalRef.current?.present();
        subscription.remove();
      });

      Keyboard.dismiss();
    } else {
      bottomSheetModalRef.current?.present();
    }
  }, []);

  const handleClose = useCallback(() => {
    return new Promise<void>((resolve) => {
      closeResolver.current = resolve;
      bottomSheetModalRef.current?.close();
    });
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleSelect = (val: any) => {
    onChange(val);
    handleClose();
  };

  const handleClear = () => {
    onChange("");
    handleClose();
  };

  return (
    <React.Fragment>
      <View className="gap-1">
        <Pressable onPress={handleOpen} className="relative">
          {label && (
            <Text
              className={cn(
                "absolute top-2 left-3 z-10 text-xs font-quicksand-semibold",
                error ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {label}
            </Text>
          )}
          <View pointerEvents="none">
            <Input
              className={cn(
                "bg-secondary/50 h-14 font-quicksand-semibold pr-12 rounded-2xl border-transparent focus:border-border selection:text-primary",
                label && "pb-0 pt-4",
                error && "border-destructive",
              )}
              value={
                value ? items.find((item) => item.value === value)?.label : ""
              }
              placeholder={placeholder}
              readOnly
            />
          </View>
          <View className="absolute inset-y-0 right-3 justify-center">
            <Icon
              as={ChevronDown}
              size={24}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>
        </Pressable>
        {error && (
          <Text className="text-xs font-quicksand-medium text-destructive ml-3">
            {error}
          </Text>
        )}
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: card }}
        handleIndicatorStyle={{ backgroundColor: primary }}
        enableDynamicSizing={false}
        onDismiss={() => {
          closeResolver.current?.();
          closeResolver.current = null;
        }}
      >
        <View className="flex-row items-center justify-between mx-6 mb-6">
          <Text className="font-quicksand-bold">{placeholder}</Text>
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
            <Text className="font-quicksand-semibold text-primary">Clear</Text>
          </TouchableOpacity>
        </View>
        <BottomSheetScrollView>
          <SafeAreaView edges={["bottom"]} className="px-6 gap-2">
            {items.map((item) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.7}
                  className="p-3 bg-secondary rounded-2xl flex-row items-center justify-between gap-1.5"
                  onPress={() => handleSelect(item.value)}
                >
                  <Text className="flex-1 font-quicksand-semibold">{item.label}</Text>
                  {isSelected && (
                    <Icon
                      as={Check}
                      size={24}
                      strokeWidth={1.5}
                      className="text-primary"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </SafeAreaView>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </React.Fragment>
  );
}
