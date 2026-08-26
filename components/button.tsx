import { Button as Btn, ButtonProps } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ActivityIndicator } from "react-native";

interface BtnProps extends ButtonProps {
  label: string;
  loading?: boolean;
}

export default function Button({ label, loading, ...props }: BtnProps) {
  return (
    <Btn className="h-14 rounded-full" {...props}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="font-quicksand-bold text-base">{label}</Text>
      )}
    </Btn>
  );
}
