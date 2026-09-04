import { Button as Btn, ButtonProps } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface BtnProps extends ButtonProps {
  label: string;
}

export default function Button({ label, className, ...props }: BtnProps) {
  return (
    <Btn className={cn("h-14 rounded-full", className)} {...props}>
      <Text className="font-quicksand-bold text-base tracking-wider">
        {label}
      </Text>
    </Btn>
  );
}
