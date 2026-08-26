import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Delete } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "./ui/icon";

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export default function NumberPad({
  value,
  onChange,
  maxLength = 4,
}: NumberPadProps) {
  const pressNumber = (num: string) => {
    if (value.length >= maxLength) return;

    onChange(value + num);
  };

  const backspace = () => {
    onChange(value.slice(0, -1));
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <View>
      {Array.from({ length: 3 }).map((_, row) => (
        <View key={row} className="flex-row justify-around">
          {numbers.slice(row * 3, row * 3 + 3).map((num) => (
            <Button
              key={num}
              onPress={() => pressNumber(num)}
              variant="ghost"
              className="size-16 items-center justify-center rounded-full"
            >
              <Text className="text-2xl font-quicksand-bold">{num}</Text>
            </Button>
          ))}
        </View>
      ))}
      <View className="flex-row justify-around">
        <View className="size-16" />
        <Button
          onPress={() => pressNumber("0")}
          variant="ghost"
          className="size-16 items-center justify-center rounded-full"
        >
          <Text className="text-2xl font-quicksand-bold">0</Text>
        </Button>
        <Button
          onPress={backspace}
          variant="ghost"
          className="size-16 items-center justify-center rounded-full"
        >
          <Icon as={Delete} size={24} />
        </Button>
      </View>
    </View>
  );
}
