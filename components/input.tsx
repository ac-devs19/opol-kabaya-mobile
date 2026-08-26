import { Input as Inpt } from "@/components/ui/input";
import { Pressable, TextInputProps, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  secureTextEntry,
  className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="gap-1">
      <View className="relative">
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
        <Inpt
          className={cn(
            "bg-secondary/50 h-14 font-quicksand-semibold rounded-2xl border-transparent focus:border-border selection:text-primary",
            label && "pb-0 pt-4",
            error && "border-destructive",
            secureTextEntry && "pr-12",
            className,
          )}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />
        {secureTextEntry && (
          <View className="absolute inset-y-0 right-3 justify-center">
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Icon
                as={showPassword ? Eye : EyeOff}
                size={24}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </Pressable>
          </View>
        )}
      </View>
      {error && (
        <Text className="text-xs font-quicksand-medium text-destructive ml-3">
          {error}
        </Text>
      )}
    </View>
  );
}
