import { View, TextInputProps } from "react-native";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

interface InputPhoneProps extends TextInputProps {
  error?: string;
}

export default function InputPhone({ error, ...props }: InputPhoneProps) {
  return (
    <View className="gap-1">
      <View className="flex-row gap-2">
        <Input
          value="+63"
          className={cn(
            "w-14 bg-secondary/50 h-14 font-quicksand-semibold rounded-2xl border-transparent text-center"
          )}
          readOnly
        />
        <Input
          className={cn(
            "flex-1 bg-secondary/50 h-14 font-quicksand-semibold rounded-2xl border-transparent focus:border-border selection:text-primary",
            error && "border-destructive"
          )}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="9xx xxx xxxx"
          {...props}
        />
      </View>
      {error && (
        <Text className="text-xs font-quicksand-medium text-destructive ml-3">
          {error}
        </Text>
      )}
    </View>
  );
}
