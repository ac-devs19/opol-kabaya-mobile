import { useAuth } from "@/contexts/auth-context";
import { useAppColors } from "@/lib/theme";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Icon } from "./ui/icon";
import {
  ArrowRight,
  Clock3,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react-native";
import { useVerificationSheet } from "@/hooks/useVerificationSheet";
import { router } from "expo-router";

export default function VerificationSheet() {
  const { user } = useAuth();
  const { card, primary } = useAppColors();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%"], []);
  const closeResolver = useRef<(() => void) | null>(null);
  const { open, setOpen } = useVerificationSheet();

  useEffect(() => {
    if (open) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    return new Promise<void>((resolve) => {
      closeResolver.current = resolve;
      bottomSheetRef.current?.close();
      setOpen(false);
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

  const handleVerify = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setOpen(false);
    setTimeout(() => {
      router.push("/home/verifications/personal");
    }, 200);
  }, []);

  const verificationStatus = user?.latest_verification?.status ?? null;

  const isPending = verificationStatus === "pending";

  const isRejected = verificationStatus === "rejected";

  const isApproved = verificationStatus === "approved";

  const title = isPending
    ? "Verification Pending"
    : isRejected
      ? "Verification Unsuccessful"
      : "Verification Required";

  const heading = isPending
    ? "We're reviewing your identity"
    : isRejected
      ? "Let's try again"
      : "Verify your identity";

  const description = isPending
    ? "Your identity verification is currently being reviewed. You'll be able to use this service once your verification is approved."
    : isRejected
      ? "Your previous verification wasn't successful. Please submit your identity verification again to use this service."
      : "You need to verify your identity before you can use this service. Verification also unlocks additional Kabaya services.";

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: card }}
      handleIndicatorStyle={{ backgroundColor: primary }}
      onDismiss={async () => {
        closeResolver.current?.();
        closeResolver.current = null;
        setOpen(false);
      }}
    >
      <BottomSheetView className="h-full">
        <SafeAreaView edges={["bottom"]} className="flex-1">
          <View className="flex-1 px-6 pb-5">
            {/* HEADER */}

            <View className="flex-row items-center justify-between">
              <Text className="font-quicksand-bold text-lg">{title}</Text>

              <Pressable
                onPress={handleClose}
                hitSlop={10}
                className="size-9 items-center justify-center rounded-full bg-secondary"
              >
                <Icon
                  as={X}
                  size={18}
                  strokeWidth={2}
                  className="text-muted-foreground"
                />
              </Pressable>
            </View>

            {/* ICON */}

            <View className="mt-6 items-center">
              <View className="size-20 items-center justify-center rounded-full bg-primary/10">
                <Icon
                  as={
                    isPending ? Clock3 : isRejected ? ShieldAlert : ShieldCheck
                  }
                  size={38}
                  strokeWidth={1.7}
                  className="text-primary"
                />
              </View>
            </View>

            {/* HEADING */}

            <Text className="mt-5 text-center font-quicksand-bold text-xl">
              {heading}
            </Text>

            {/* DESCRIPTION */}

            <Text className="mt-2 px-4 text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
              {description}
            </Text>

            {/* ACTION */}

            <View className="mt-auto gap-2">
              {!isPending && !isApproved && (
                <Pressable
                  onPress={handleVerify}
                  className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-primary active:opacity-80"
                >
                  <Text className="font-quicksand-bold text-white">
                    {isRejected ? "Verify Again" : "Verify Now"}
                  </Text>

                  <Icon
                    as={ArrowRight}
                    size={18}
                    strokeWidth={2}
                    className="text-white"
                  />
                </Pressable>
              )}

              <Pressable
                onPress={handleClose}
                className="h-12 items-center justify-center rounded-full"
              >
                <Text className="font-quicksand-semibold text-muted-foreground">
                  Maybe Later
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
