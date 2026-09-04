import Button from "@/components/button";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ScrollView,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: React.ReactNode;
  icon?: React.ReactNode;
  backgroundColor?: string;
}

export interface OnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  showProgress?: boolean;
  swipeEnabled?: boolean;
  primaryButtonText?: string;
  skipButtonText?: string;
  nextButtonText?: string;
  backButtonText?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Onboarding({
  steps,
  onComplete,
  onSkip,
  showSkip = true,
  showProgress = true,
  swipeEnabled = true,
  primaryButtonText = "Get Started",
  skipButtonText = "Skip",
  nextButtonText = "Next",
  backButtonText = "Back",
  style,
  children,
}: OnboardingProps) {
  const { width: screenWidth } = useWindowDimensions();

  const [currentStep, setCurrentStep] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  const {
    background: backgroundColor,
    primary: primaryColor,
    mutedForeground: mutedColor,
    foreground: foregroundColor,
  } = useAppColors();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  /**
   * Announce current step for accessibility
   */
  useEffect(() => {
    const step = steps[currentStep];

    if (!step) return;

    AccessibilityInfo.announceForAccessibility(
      `${step.title}. Step ${currentStep + 1} of ${steps.length}.`,
    );
  }, [currentStep, steps]);

  /**
   * Navigate to a specific onboarding step
   */
  const goToStep = (step: number) => {
    if (step < 0 || step >= steps.length) {
      return;
    }

    setCurrentStep(step);

    scrollViewRef.current?.scrollTo({
      x: step * screenWidth,
      animated: true,
    });
  };

  /**
   * Next
   */
  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    goToStep(currentStep + 1);
  };

  /**
   * Back
   */
  const handleBack = () => {
    if (isFirstStep) {
      return;
    }

    goToStep(currentStep - 1);
  };

  /**
   * Skip
   */
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  /**
   * Swipe gesture
   *
   * IMPORTANT:
   * Gesture Handler runs this callback on the UI thread.
   * React state/navigation functions run on the JS thread.
   *
   * Therefore we use runOnJS().
   */
  const panGesture = Gesture.Pan()
    .enabled(swipeEnabled)

    // Only activate for horizontal movement
    .activeOffsetX([-20, 20])

    // Prevent vertical scrolling from triggering the gesture
    .failOffsetY([-15, 15])

    .onEnd((event) => {
      const { translationX, velocityX } = event;

      const swipeThreshold = screenWidth * 0.2;
      const velocityThreshold = 500;

      const isSwipe =
        Math.abs(translationX) > swipeThreshold ||
        Math.abs(velocityX) > velocityThreshold;

      if (!isSwipe) {
        return;
      }

      /**
       * Swipe LEFT
       * Go to next page
       */
      if (translationX < 0 || velocityX < -velocityThreshold) {
        if (!isLastStep) {
          runOnJS(handleNext)();
        }

        return;
      }

      /**
       * Swipe RIGHT
       * Go to previous page
       */
      if (translationX > 0 || velocityX > velocityThreshold) {
        if (!isFirstStep) {
          runOnJS(handleBack)();
        }
      }
    });

  /**
   * Progress indicators
   */
  const renderProgressDots = () => {
    if (!showProgress) {
      return null;
    }

    return (
      <View
        className="flex-row items-center justify-center gap-1.5 pb-6 pt-3"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {steps.map((_, index) => {
          const isActive = index === currentStep;

          return (
            <View
              key={index}
              className="h-1.5 rounded-full"
              style={{
                width: isActive ? 24 : 7,
                backgroundColor: isActive ? primaryColor : mutedColor,
                opacity: isActive ? 1 : 0.25,
              }}
            />
          );
        })}
      </View>
    );
  };

  /**
   * Render individual onboarding page
   */
  const renderStep = (step: OnboardingStep, index: number) => {
    const isActive = index === currentStep;

    return (
      <View
        key={step.id}
        className="flex-1 items-center"
        style={{
          width: screenWidth,
          backgroundColor: step.backgroundColor || backgroundColor,
          opacity: isActive ? 1 : 0.85,
        }}
      >
        {/* Decorative background circle - top right */}
        <View
          pointerEvents="none"
          className="absolute -right-24 -top-20 size-72 rounded-full"
          style={{
            backgroundColor: primaryColor,
            opacity: 0.035,
          }}
        />

        {/* Decorative background circle - left */}
        <View
          pointerEvents="none"
          className="absolute -left-28 top-[35%] size-64 rounded-full"
          style={{
            backgroundColor: primaryColor,
            opacity: 0.025,
          }}
        />

        <View className="w-full max-w-[420px] flex-1 items-center px-6">
          {/* Illustration */}
          <View className="flex-1 w-full items-center justify-center">
            {/* Image */}
            {step.image && (
              <View className="items-center justify-center">{step.image}</View>
            )}

            {/* Icon */}
            {step.icon && !step.image && (
              <View
                className="size-52 items-center justify-center rounded-[64px]"
                style={{
                  backgroundColor: primaryColor,

                  shadowColor: primaryColor,
                  shadowOffset: {
                    width: 0,
                    height: 14,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 30,

                  elevation: 8,
                }}
              >
                <View
                  className="size-36 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: backgroundColor,
                  }}
                >
                  {React.cloneElement(step.icon as React.ReactElement<any>, {
                    color: primaryColor,
                    size: 72,
                    strokeWidth: 1.7,
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Text */}
          <View className="w-full items-center px-3 pb-2">
            <Text
              className="mb-4 text-center text-[28px] leading-9 font-quicksand-bold"
              style={{
                color: foregroundColor,
              }}
            >
              {step.title}
            </Text>

            <Text
              className="max-w-[360px] text-center text-[15px] leading-6 font-quicksand-medium"
              style={{
                color: mutedColor,
              }}
            >
              {step.description}
            </Text>
          </View>

          {/* Optional children */}
          {children && (
            <View className="mt-5 items-center px-5">{children}</View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1">
      <View
        className="flex-1"
        style={[
          {
            backgroundColor,
          },
          style,
        ]}
      >
        {/* Skip button */}
        {showSkip && !isLastStep && (
          <View className="absolute right-4 top-10 z-20">
            <Button
              label={skipButtonText}
              variant="ghost"
              onPress={handleSkip}
            />
          </View>
        )}

        {/* Pages */}
        <GestureDetector gesture={panGesture}>
          <View className="flex-1">
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={swipeEnabled}

              // Disable iOS rubber-band effect
              bounces={false}
              alwaysBounceHorizontal={false}
              alwaysBounceVertical={false}

              // Disable Android overscroll glow
              overScrollMode="never"

              // Better horizontal gesture behavior
              directionalLockEnabled
              decelerationRate="fast"

              // Prevent unnecessary bounce
              contentContainerStyle={{
                flexGrow: 1,
              }}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                const offsetX = event.nativeEvent.contentOffset.x;

                const newStep = Math.round(offsetX / screenWidth);

                if (newStep >= 0 && newStep < steps.length) {
                  setCurrentStep(newStep);
                }
              }}
            >
              {steps.map((step, index) => renderStep(step, index))}
            </ScrollView>
          </View>
        </GestureDetector>

        {/* Progress */}
        {renderProgressDots()}

        {/* Bottom navigation */}
        <View
          className="w-full px-6 pb-8 pt-1"
          style={{
            backgroundColor,
          }}
        >
          <View className="flex-row gap-3">
            {/* Back */}
            {!isFirstStep && (
              <Button
                label={backButtonText}
                variant="outline"
                onPress={handleBack}
                className="flex-1"
              />
            )}

            {/* Next / Get Started */}
            <Button
              label={isLastStep ? primaryButtonText : nextButtonText}
              onPress={handleNext}
              className={isFirstStep ? "flex-1" : "flex-[2]"}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * Onboarding Hook
 */
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  const completeOnboarding = async () => {
    try {
      setHasCompletedOnboarding(true);

      console.log("Onboarding completed and saved");
    } catch (error) {
      console.error("Failed to save onboarding completion:", error);
    }
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    setCurrentOnboardingStep(0);
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  return {
    hasCompletedOnboarding,
    currentOnboardingStep,
    setCurrentOnboardingStep,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
  };
}
