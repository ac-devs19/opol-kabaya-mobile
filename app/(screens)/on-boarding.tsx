import { router } from "expo-router";
import {
  Bell,
  FileCheck2,
  Fingerprint,
  HeartPulse,
  House,
  ShieldCheck,
} from "lucide-react-native";
import { Onboarding, OnboardingStep } from "@/components/bna/onboarding";
import { SafeAreaView } from "react-native-safe-area-context";

const steps: OnboardingStep[] = [
  {
    id: "1",
    title: "Welcome to Kabaya",
    description:
      "Your digital companion for accessing local services, community information, and essential resources in one place.",
    icon: <House />,
  },
  {
    id: "2",
    title: "Your Digital Identity",
    description:
      "Create and verify your resident account securely using your personal information and identity verification.",
    icon: <ShieldCheck />,
  },
  {
    id: "3",
    title: "Fast & Secure Access",
    description:
      "Sign in easily and securely with your PIN, biometrics, or face verification whenever available.",
    icon: <Fingerprint />,
  },
  {
    id: "4",
    title: "Access Local Services",
    description:
      "Connect to important municipal and community services without having to search for everything separately.",
    icon: <FileCheck2 />,
  },
  {
    id: "5",
    title: "Stay Updated",
    description:
      "Keep up with local announcements, department news, and important community updates.",
    icon: <Bell />,
  },
  {
    id: "6",
    title: "Help When You Need It",
    description:
      "Quickly find emergency hotlines and other important contact information when you need assistance.",
    icon: <HeartPulse />,
  },
];

export default function OnBoarding() {
  return (
    <Onboarding
      steps={steps}
      onComplete={() => router.replace("/sign-up")}
      onSkip={() => router.replace("/sign-in")}
    />
  );
}
