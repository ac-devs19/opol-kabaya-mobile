import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { useOtpAlert } from "@/hooks/useOtpAlert";
import { useOtpTimer } from "@/hooks/useOtpTimer";

export default function OtpAlert() {
  const { open, setOpen } = useOtpAlert();
  const { remainingTime, canResend, updateTimer } = useOtpTimer();

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [open, updateTimer]);

  useEffect(() => {
    if (canResend && open) {
      setOpen(false);
    }
  }, [canResend, open, setOpen]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center font-quicksand-bold">
            Kabaya
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center font-quicksand-medium">
            {`OTP cannot be resend at this time. Please try again in ${
              Math.floor(remainingTime / 60) > 0
                ? `${Math.floor(remainingTime / 60)} minute${Math.floor(remainingTime / 60) === 1 ? "" : "s"} `
                : ""
            }${remainingTime % 60} second${remainingTime % 60 <= 1 ? "" : "s"}`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="rounded-full">
            <Text className="font-quicksand-semibold">Okay</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
