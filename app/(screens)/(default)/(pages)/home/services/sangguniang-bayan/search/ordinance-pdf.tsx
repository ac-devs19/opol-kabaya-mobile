import axios from "@/api/axios";
import Input from "@/components/input";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useStore } from "@/hooks/useStore";
import { useAppColors } from "@/lib/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { router } from "expo-router";
import { ChevronRight, FileText, Search, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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

export default function SearchOrdinancePdf() {
  const { primary } = useAppColors();
  const { ordinance, setOrdinance } = useStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
          ...(debouncedSearch
            ? {
                search: debouncedSearch,
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
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["search-ordinance-pdfs", ordinance.folder_id, debouncedSearch],
    queryFn: getOrdinancePdf,
    initialPageParam: undefined as string | undefined,
    enabled: debouncedSearch.trim().length > 0,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });

  const pdf = useMemo(() => {
    return data?.pages.flatMap((page) => page.files) ?? [];
  }, [data]);

  /* ============================================================
     SEARCH DEBOUNCE
  ============================================================ */

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 700),
    [],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const isTyping = search.trim() !== debouncedSearch;

  /* ============================================================
     CLEAR SEARCH
  ============================================================ */

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    debouncedSetSearch.cancel();
  };

  /* ============================================================
     OPEN PDF
  ============================================================ */

  const handleOpenPdf = (item: DriveFile) => {
    setOrdinance({
      ...ordinance,
      pdf_id: item.id,
      pdf_name: item.name,
    });

    router.replace("/home/services/sangguniang-bayan/webview");
  };

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  const renderEmptyState = () => {
    /*
     * Nothing typed yet
     */
    if (!search.trim()) {
      return (
        <View className="items-center px-8 pt-16">
          <View className="size-20 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={Search}
              size={32}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            Search documents
          </Text>

          <Text className="mt-2 max-w-[290px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            Search for an ordinance document by entering its title above.
          </Text>
        </View>
      );
    }

    /*
     * User is typing / request is loading
     */
    if (isTyping || (isLoading && pdf.length === 0)) {
      return (
        <View className="items-center px-8 pt-16">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <ActivityIndicator size="small" color={primary} />
          </View>

          <Text className="mt-4 font-quicksand-semibold text-base">
            Searching...
          </Text>

          <Text className="mt-1 text-center font-quicksand-medium text-xs text-muted-foreground">
            Looking for matching documents
          </Text>
        </View>
      );
    }

    /*
     * Search completed but no results
     */
    if (pdf.length === 0) {
      return (
        <View className="items-center px-8 pt-16">
          <View className="size-20 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={FileText}
              size={32}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            No documents found
          </Text>

          <Text className="mt-2 max-w-[290px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            We couldn't find a document matching your search.
          </Text>

          <View className="mt-4 rounded-full bg-secondary px-4 py-2">
            <Text className="max-w-[240px] text-center font-quicksand-semibold text-xs">
              "{search.trim()}"
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
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
          <View className="bg-background px-5 pb-4 pt-5">
            {/* ==================================================
                SEARCH BAR
            =================================================== */}

            <View className="flex-row items-center">
              <View className="flex-1">
                <View className="relative">
                  <Input
                    placeholder="Search documents..."
                    value={search}
                    onChangeText={handleSearch}
                    autoFocus
                    returnKeyType="search"
                    className="rounded-full px-11"
                  />

                  {/* Search icon */}

                  <View className="absolute left-4 top-0 h-full justify-center">
                    <Icon
                      as={Search}
                      size={18}
                      strokeWidth={1.7}
                      className="text-muted-foreground"
                    />
                  </View>

                  {/* Clear search */}

                  {search.length > 0 && (
                    <Pressable
                      onPress={handleClearSearch}
                      className="absolute right-2 top-1/2 size-9 -translate-y-1/2 items-center justify-center rounded-full bg-secondary active:opacity-70"
                    >
                      <Icon
                        as={X}
                        size={16}
                        strokeWidth={1.8}
                        className="text-muted-foreground"
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Close search */}

              <Pressable
                onPress={() => router.back()}
                className="ml-3 size-11 items-center justify-center rounded-full bg-secondary active:opacity-70"
              >
                <Icon as={X} size={21} strokeWidth={1.7} />
              </Pressable>
            </View>

            {/* ==================================================
                FOLDER CONTEXT
            =================================================== */}

            <View className="mt-4 px-1">
              <Text
                numberOfLines={1}
                className="font-quicksand-medium text-xs text-muted-foreground"
              >
                Searching in{" "}
                <Text className="font-quicksand-bold text-foreground">
                  {ordinance.folder_name || "Ordinance Collection"}
                </Text>
              </Text>
            </View>

            {/* ==================================================
                RESULTS STATUS
            =================================================== */}

            {search.trim().length > 0 && !isTyping && (
              <View className="mt-4 flex-row items-center justify-between px-1">
                <View className="flex-row items-center">
                  <Icon
                    as={FileText}
                    size={14}
                    strokeWidth={1.7}
                    className="mr-2 text-muted-foreground"
                  />

                  <Text className="font-quicksand-medium text-xs text-muted-foreground">
                    {isFetching && !isFetchingNextPage
                      ? "Searching..."
                      : `${pdf.length} ${
                          pdf.length === 1 ? "result" : "results"
                        }`}
                  </Text>
                </View>

                {pdf.length > 0 && (
                  <View className="rounded-full bg-secondary px-3 py-1">
                    <Text className="font-quicksand-semibold text-[10px] text-muted-foreground">
                      PDF DOCUMENTS
                    </Text>
                  </View>
                )}
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
        ListEmptyComponent={renderEmptyState()}
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
                End of search results
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
