import axios from "@/api/axios";
import Input from "@/components/input";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useStore } from "@/hooks/useStore";
import { useAppColors } from "@/lib/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  Search,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DriveFile {
  id: string;
  name: string;
}

interface PdfResponse {
  files: DriveFile[];
  nextPageToken: string | null;
}

export default function OrdinancePdf() {
  const { primary } = useAppColors();
  const { ordinance, setOrdinance } = useStore();

  const getOrdinancePdf = async ({ pageParam }: { pageParam?: string }) => {
    const { data } = await axios.get<PdfResponse>(
      `/services/sb/get-pdf/${ordinance.folder_id}`,
      {
        params: {
          ...(pageParam
            ? {
                nextPageToken: pageParam,
              }
            : {}),
        },
      },
    );

    return data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["ordinance-pdfs", ordinance.folder_id],
    queryFn: getOrdinancePdf,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });

  const pdf = useMemo(() => {
    return data?.pages.flatMap((page) => page.files) ?? [];
  }, [data]);

  const handleOpenPdf = (item: DriveFile) => {
    setOrdinance({
      ...ordinance,
      pdf_id: item.id,
      pdf_name: item.name,
    });

    router.push("/home/services/sangguniang-bayan/webview");
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <ActivityIndicator size="small" color={primary} />
          </View>

          <Text className="mt-4 font-quicksand-semibold text-sm">
            Loading documents...
          </Text>

          <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
            Please wait a moment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (isError) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={FileText}
              size={28}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            Unable to load documents
          </Text>

          <Text className="mt-2 text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            Something went wrong while loading this ordinance collection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" ? [] : ["bottom"]}
      className="flex-1 bg-background"
    >
      <FlatList
        data={pdf}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className="bg-background px-5 pb-5 pt-5">
            {/* ==================================================
                CURRENT FOLDER
            =================================================== */}

            <View className="flex-row items-center">
              <View className="size-12 items-center justify-center rounded-2xl bg-primary/10">
                <Icon
                  as={FolderOpen}
                  size={23}
                  strokeWidth={1.7}
                  className="text-primary"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-quicksand-bold text-xl">
                  {ordinance.folder_name || "Ordinances"}
                </Text>

                <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                  Official ordinance documents
                </Text>
              </View>
            </View>

            {/* ==================================================
                FOLDER INFO
            =================================================== */}

            <View className="mt-5 flex-row rounded-3xl bg-secondary p-4">
              <View className="size-9 items-center justify-center rounded-full bg-background">
                <Icon
                  as={FileText}
                  size={17}
                  strokeWidth={1.7}
                  className="text-primary"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-quicksand-semibold text-sm">
                  Ordinance Documents
                </Text>

                <Text className="mt-1 font-quicksand-medium text-xs leading-4 text-muted-foreground">
                  Select a document below to view the complete ordinance.
                </Text>
              </View>
            </View>

            {/* ==================================================
                SEARCH
            =================================================== */}

            <Pressable
              onPress={() =>
                router.push(
                  "/home/services/sangguniang-bayan/search/ordinance-pdf",
                )
              }
              className="mt-4"
            >
              <View pointerEvents="none">
                <View className="relative">
                  <Input
                    placeholder="Search documents..."
                    className="rounded-full px-11"
                  />

                  <View className="absolute left-4 top-0 h-full justify-center">
                    <Icon
                      as={Search}
                      size={18}
                      strokeWidth={1.7}
                      className="text-muted-foreground"
                    />
                  </View>
                </View>
              </View>
            </Pressable>

            {/* ==================================================
                SECTION HEADER
            =================================================== */}

            {pdf.length > 0 && (
              <View className="mt-6 flex-row items-center justify-between px-1">
                <Text className="font-quicksand-bold text-base">Documents</Text>

                <View className="rounded-full bg-secondary px-3 py-1">
                  <Text className="font-quicksand-semibold text-[10px] text-muted-foreground">
                    {pdf.length} {pdf.length === 1 ? "DOCUMENT" : "DOCUMENTS"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center px-8 pt-12">
            <View className="size-20 items-center justify-center rounded-full bg-secondary">
              <Icon
                as={FileText}
                size={31}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </View>

            <Text className="mt-5 text-center font-quicksand-bold text-xl">
              No documents available
            </Text>

            <Text className="mt-2 max-w-[280px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
              There are currently no ordinance documents in this collection.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleOpenPdf(item)}
            className="px-5 py-1.5 active:opacity-75"
          >
            <View className="flex-row items-center rounded-3xl border border-border bg-card p-4">
              {/* ==================================================
                  PDF ICON
              =================================================== */}

              <View className="size-14 items-center justify-center rounded-2xl bg-destructive/10">
                <Image
                  source={require("@/assets/images/icons/pdf.png")}
                  resizeMode="contain"
                  className="size-9"
                />
              </View>

              {/* ==================================================
                  DOCUMENT INFO
              =================================================== */}

              <View className="ml-4 flex-1">
                <Text
                  numberOfLines={2}
                  className="font-quicksand-bold text-sm leading-5"
                >
                  {item.name}
                </Text>

                <View className="mt-1 flex-row items-center">
                  <Icon
                    as={FileText}
                    size={11}
                    strokeWidth={1.7}
                    className="mr-1 text-muted-foreground"
                  />

                  <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                    PDF document
                  </Text>
                </View>
              </View>

              {/* ==================================================
                  OPEN INDICATOR
              =================================================== */}

              <View className="ml-2 size-8 items-center justify-center rounded-full bg-secondary">
                <Icon
                  as={ChevronRight}
                  size={17}
                  strokeWidth={1.8}
                  className="text-muted-foreground"
                />
              </View>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color={primary} />

              <Text className="mt-2 font-quicksand-medium text-[10px] text-muted-foreground">
                Loading more documents...
              </Text>
            </View>
          ) : pdf.length > 0 ? (
            <View className="items-center px-8 py-7">
              <Text className="text-center font-quicksand-medium text-[10px] text-muted-foreground">
                You've reached the end of this collection.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
