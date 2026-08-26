import React, { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type MPinProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
};

export default function MPin({
  value,
  onChange,
  length = 4,
  ...props
}: MPinProps) {
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    const formatted = text.replace(/[^0-9]/g, "").slice(0, length);
    onChange(formatted);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        className="absolute opacity-0 w-0 h-0"
        autoFocus
        {...props}
      />
      <View className="w-full flex-row justify-between gap-3">
        {Array.from({ length }).map((_, index) => {
          const digit = value[index];
          const isFocused = index === value.length;
          return (
            <View
              key={index}
              className={cn(
                "bg-secondary/50 flex-1 h-14 items-center justify-center rounded-2xl border",
                isFocused ? "border-primary" : "border-border",
              )}
            >
              <Text className="text-xl font-quicksand-semibold">
                {digit ? "•" : ""}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
