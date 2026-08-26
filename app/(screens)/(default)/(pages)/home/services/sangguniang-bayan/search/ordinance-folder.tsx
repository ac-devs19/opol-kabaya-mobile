import axios from "@/api/axios";
import Input from "@/components/input";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useStore } from "@/hooks/useStore";
import { useAppColors } from "@/lib/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { router } from "expo-router";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  Search,
  X,
} from "lucide-react-native";
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

interface FolderResponse {
  files: DriveFile[];
  nextPageToken: string | null;
}

export default function SearchOrdinanceFolder() {
  const { primary } = useAppColors();
  const { setOrdinance } = useStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const getOrdinanceFolder = async ({ pageParam }: { pageParam?: string }) => {
    const { data } = await axios.get<FolderResponse>(
      "/services/sb/get-folder",
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
    queryKey: ["ordinance-folder-search", debouncedSearch],
    queryFn: getOrdinanceFolder,
    initialPageParam: undefined as string | undefined,
    enabled: debouncedSearch.trim().length > 0,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });

  const folders = useMemo(() => {
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
     OPEN FOLDER
  ============================================================ */

  const handleOpenFolder = (item: DriveFile) => {
    setOrdinance({
      folder_id: item.id,
      folder_name: item.name,
    });

    router.replace("/home/services/sangguniang-bayan/ordinance-pdf");
  };

  /* ============================================================
     EMPTY / SEARCH STATE
  ============================================================ */

  const renderEmptyState = () => {
    // User has not typed anything yet
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
            Search ordinances
          </Text>

          <Text className="mt-2 max-w-[280px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            Search for an ordinance collection by entering its name above.
          </Text>
        </View>
      );
    }

    // User is still typing / waiting for debounce
    if (isTyping || (isLoading && folders.length === 0)) {
      return (
        <View className="items-center px-8 pt-16">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <ActivityIndicator size="small" color={primary} />
          </View>

          <Text className="mt-4 font-quicksand-semibold text-base">
            Searching...
          </Text>

          <Text className="mt-1 text-center font-quicksand-medium text-xs text-muted-foreground">
            Looking for matching ordinance collections
          </Text>
        </View>
      );
    }

    // Search completed but no results
    if (folders.length === 0) {
      return (
        <View className="items-center px-8 pt-16">
          <View className="size-20 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={FolderOpen}
              size={32}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            No results found
          </Text>

          <Text className="mt-2 max-w-[290px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            We couldn't find an ordinance collection matching your search.
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
        data={folders}
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
                SEARCH HEADER
            =================================================== */}

            <View className="flex-row items-center">
              <View className="flex-1">
                <View className="relative">
                  <Input
                    placeholder="Search ordinances..."
                    value={search}
                    onChangeText={handleSearch}
                    autoFocus
                    returnKeyType="search"
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

                  {search.length > 0 && (
                    <Pressable
                      onPress={() => {
                        setSearch("");
                        setDebouncedSearch("");
                        debouncedSetSearch.cancel();
                      }}
                      className="absolute right-2 top-1/2 size-9 -translate-y-1/2 items-center justify-center rounded-full bg-secondary"
                    >
                      <Icon
                        as={X}
                        size={17}
                        strokeWidth={1.8}
                        className="text-muted-foreground"
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              <Pressable
                onPress={() => router.back()}
                className="ml-3 size-11 items-center justify-center rounded-full bg-secondary active:opacity-70"
              >
                <Icon as={X} size={21} strokeWidth={1.7} />
              </Pressable>
            </View>

            {/* ==================================================
                SEARCH STATUS
            =================================================== */}

            {search.trim().length > 0 && !isTyping && (
              <View className="mt-4 flex-row items-center justify-between px-1">
                <View className="flex-row items-center">
                  <Icon
                    as={FolderOpen}
                    size={14}
                    strokeWidth={1.7}
                    className="mr-2 text-muted-foreground"
                  />

                  <Text className="font-quicksand-medium text-xs text-muted-foreground">
                    {isFetching && !isFetchingNextPage
                      ? "Searching..."
                      : `${folders.length} ${
                          folders.length === 1 ? "result" : "results"
                        }`}
                  </Text>
                </View>

                {folders.length > 0 && (
                  <View className="rounded-full bg-secondary px-3 py-1">
                    <Text className="font-quicksand-semibold text-[10px] text-muted-foreground">
                      FOLDERS
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
            onPress={() => handleOpenFolder(item)}
            className="px-5 py-1.5 active:opacity-75"
          >
            <View className="flex-row items-center rounded-3xl border border-border bg-card p-4">
              {/* ==================================================
                  FOLDER ICON
              =================================================== */}

              <View className="size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Image
                  source={require("@/assets/images/icons/folder.png")}
                  resizeMode="contain"
                  className="size-9"
                />
              </View>

              {/* ==================================================
                  FOLDER INFO
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
                    Ordinance collection
                  </Text>
                </View>
              </View>

              {/* ==================================================
                  ARROW
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
                Loading more results...
              </Text>
            </View>
          ) : folders.length > 0 ? (
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
