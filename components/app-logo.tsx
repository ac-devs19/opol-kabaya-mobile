import { cn } from "@/lib/utils";
import { Image, ImageProps } from "react-native";

export default function AppLogo({ className, ...props }: ImageProps) {
  return (
    <Image
      source={require("@/assets/images/kabaya/logo.png")}
      resizeMode="contain"
      className={cn("w-32 h-10", className)}
      {...props}
    />
  );
}
