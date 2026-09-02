import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { File, Paths } from "expo-file-system";
import Pdf from "react-native-pdf";
import { FileText, RefreshCw, X } from "lucide-react-native";

import axios from "@/api/axios";
import { useStore } from "@/hooks/useStore";
import { useAppColors } from "@/lib/theme";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function WebViewScreen() {
  const { ordinance } = useStore();
  const { primary } = useAppColors();

  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const getOrdinancePdf = async () => {
    const { data } = await axios.get(
      `/services/sb/preview-pdf/${ordinance.pdf_id}`,
    );

    /*
     * Android:
     * Download the PDF to cache first because
     * react-native-pdf can be more reliable with
     * a local file.
     */
    if (Platform.OS === "android") {
      const localFile = new File(Paths.cache, `${ordinance.pdf_id}.pdf`);

      if (!localFile.exists) {
        await File.downloadFileAsync(data.pdf, localFile);
      }

      return {
        pdf: localFile.uri,
      };
    }

    return data;
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["ordinance-pdf", ordinance.pdf_id],
    queryFn: getOrdinancePdf,
    enabled: !!ordinance.pdf_id,
  });

  /*
   * Reset PDF state when another document is opened.
   */
  const handleRetry = async () => {
    setPdfError(false);
    setPdfLoaded(false);
    await refetch();
  };

  /*
   * Loading screen
   */
  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="size-20 items-center justify-center rounded-3xl bg-secondary">
            <ActivityIndicator size="small" color={primary} />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-lg">
            Opening document
          </Text>

          <Text
            numberOfLines={2}
            className="mt-2 max-w-[280px] text-center font-quicksand-medium text-sm text-muted-foreground"
          >
            {ordinance.pdf_name}
          </Text>

          <Text className="mt-3 font-quicksand-medium text-xs text-muted-foreground">
            Please wait...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * API error
   */
  if (isError || !data?.pdf) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        {/* Header */}

        <View className="flex-row items-center px-5 py-3">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 size-10 items-center justify-center rounded-xl bg-secondary">
              <Icon
                as={FileText}
                size={19}
                strokeWidth={1.6}
                className="text-muted-foreground"
              />
            </View>

            <View className="flex-1">
              <Text className="font-quicksand-semibold text-sm">Document</Text>

              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                Unable to load
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="size-11 items-center justify-center rounded-full bg-secondary active:opacity-70"
          >
            <Icon as={X} size={21} strokeWidth={1.7} />
          </Pressable>
        </View>

        {/* Error */}

        <View className="flex-1 items-center justify-center px-8">
          <View className="size-20 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={FileText}
              size={32}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            Unable to open document
          </Text>

          <Text className="mt-2 max-w-[300px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            Something went wrong while loading this ordinance. Please try again.
          </Text>

          <Pressable
            onPress={handleRetry}
            disabled={isFetching}
            className="mt-6 flex-row items-center rounded-full bg-primary px-5 py-3 active:opacity-80"
          >
            {isFetching ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Icon
                as={RefreshCw}
                size={16}
                strokeWidth={1.8}
                className="mr-2 text-primary-foreground"
              />
            )}

            <Text className="font-quicksand-bold text-sm text-primary-foreground">
              {isFetching ? "Retrying..." : "Try Again"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" ? [] : ["bottom"]}
      className="flex-1 bg-background"
    >
      {/* ======================================================
          HEADER
      ======================================================= */}

      {Platform.OS === "ios" ? (
        <View className="flex-row items-center px-5 py-3">
          <View className="flex-1 flex-row items-center">
            {/* Document icon */}

            <View className="mr-3 size-10 items-center justify-center rounded-xl bg-secondary">
              <Icon
                as={FileText}
                size={19}
                strokeWidth={1.6}
                className="text-primary"
              />
            </View>

            {/* Document name */}

            <View className="flex-1">
              <Text numberOfLines={1} className="font-quicksand-bold text-sm">
                {ordinance.pdf_name}
              </Text>

              <Text className="mt-0.5 font-quicksand-medium text-[10px] text-muted-foreground">
                Ordinance document
              </Text>
            </View>
          </View>

          {/* Close */}

          <Pressable
            onPress={() => router.back()}
            className="ml-3 size-11 items-center justify-center rounded-full bg-secondary active:opacity-70"
          >
            <Icon as={X} size={21} strokeWidth={1.7} />
          </Pressable>
        </View>
      ) : null}

      {/* ======================================================
          PDF VIEWER
      ======================================================= */}

      <View className="flex-1 overflow-hidden">
        {!pdfLoaded && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-background">
            <View className="size-16 items-center justify-center rounded-2xl bg-secondary">
              <ActivityIndicator size="small" color={primary} />
            </View>

            <Text className="mt-4 font-quicksand-semibold text-sm">
              Loading document...
            </Text>
          </View>
        )}

        {pdfError ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="size-16 items-center justify-center rounded-2xl bg-secondary">
              <Icon
                as={FileText}
                size={28}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </View>

            <Text className="mt-4 font-quicksand-bold text-lg">
              Something went wrong
            </Text>

            <Text className="mt-2 text-center font-quicksand-medium text-sm text-muted-foreground">
              The document could not be displayed.
            </Text>

            <Pressable
              onPress={handleRetry}
              className="mt-5 flex-row items-center rounded-full bg-primary px-5 py-3 active:opacity-80"
            >
              <Icon
                as={RefreshCw}
                size={15}
                strokeWidth={1.8}
                className="mr-2 text-primary-foreground"
              />

              <Text className="font-quicksand-bold text-sm text-primary-foreground">
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pdf
            source={{
              uri: data.pdf,
              cache: true,
            }}
            trustAllCerts={false}
            style={{
              flex: 1,
              backgroundColor: "transparent",
            }}
            enablePaging={false}
            spacing={8}
            onLoadComplete={() => {
              setPdfLoaded(true);
            }}
            onError={(error) => {
              console.log("PDF Render Error:", error);

              setPdfError(true);
              setPdfLoaded(false);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
