import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  View,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAppColors } from "@/lib/theme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  ArrowLeft,
  CalendarDays,
  Newspaper,
  Search,
  X,
} from "lucide-react-native";
import { debounce } from "lodash";

export default function SearchArticle() {
  const { primary } = useAppColors();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const getNews = async ({ pageParam }: { pageParam: number }) => {
    const { data } = await axios.get("https://occ.edu.ph/api/mobile/news", {
      params: {
        page: pageParam,
        search: debouncedSearch,
      },
    });

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
    queryKey: ["search-news", debouncedSearch],
    queryFn: getNews,
    initialPageParam: 1,
    enabled: debouncedSearch.trim().length > 0,
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
  });

  const newsData = data?.pages.flatMap((page) => page.data) ?? [];

  /* ============================================================
     SEARCH DEBOUNCE
  ============================================================ */

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 400),
    [],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const isTyping = search !== debouncedSearch;

  const showLoading = isTyping || (isLoading && debouncedSearch.length > 0);

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  const EmptyState = () => {
    if (showLoading) {
      return (
        <View className="items-center px-8 pt-20">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <ActivityIndicator size="small" color={primary} />
          </View>

          <Text className="mt-4 font-quicksand-bold text-base">
            Searching...
          </Text>

          <Text className="mt-1 text-center font-quicksand-medium text-xs text-muted-foreground">
            Looking for news that matches your search.
          </Text>
        </View>
      );
    }

    if (debouncedSearch && newsData.length === 0) {
      return (
        <View className="items-center px-8 pt-20">
          <View className="size-20 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={Search}
              size={30}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            No news found
          </Text>

          <Text className="mt-2 text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            We couldn't find any news matching
          </Text>

          <View className="mt-2 max-w-[280px] rounded-full bg-secondary px-4 py-2">
            <Text
              numberOfLines={1}
              className="text-center font-quicksand-semibold text-xs"
            >
              "{search}"
            </Text>
          </View>

          <Text className="mt-3 text-center font-quicksand-medium text-xs text-muted-foreground">
            Try using different keywords.
          </Text>
        </View>
      );
    }

    if (!search) {
      return (
        <View className="items-center px-8 pt-20">
          <View className="size-20 items-center justify-center rounded-full bg-primary/10">
            <Icon
              as={Newspaper}
              size={31}
              strokeWidth={1.5}
              className="text-primary"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            Search Kabaya News
          </Text>

          <Text className="mt-2 max-w-[280px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            Search for announcements, events, activities, and other news from
            OCC.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && !isFetching) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View className="bg-background px-5 pb-4 pt-5">
            {/* ==================================================
                TOP BAR
            =================================================== */}
            <View className="flex-row items-center">
              <Button
                onPress={() => router.back()}
                variant="secondary"
                size="icon"
                className="mr-3 rounded-full"
              >
                <Icon as={ArrowLeft} size={21} strokeWidth={1.7} />
              </Button>

              <View className="flex-1">
                <Text className="font-quicksand-bold text-xl">Search News</Text>

                <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                  Find the latest OCC updates
                </Text>
              </View>
            </View>

            {/* ==================================================
                SEARCH INPUT
            =================================================== */}
            <View className="mt-5">
              <View className="relative">
                <Input
                  placeholder="Search news..."
                  value={search}
                  onChangeText={handleSearch}
                  autoFocus
                  className="rounded-full px-11 pr-12"
                  returnKeyType="search"
                />

                {/* Search icon */}
                <View className="absolute left-4 top-0 h-full justify-center">
                  <Icon
                    as={Search}
                    size={19}
                    strokeWidth={1.7}
                    className="text-muted-foreground"
                  />
                </View>

                {/* Clear */}
                {search.length > 0 && (
                  <Pressable
                    onPress={clearSearch}
                    className="absolute right-3 top-1/2 size-8 -translate-y-1/2 items-center justify-center rounded-full bg-secondary"
                  >
                    <Icon
                      as={X}
                      size={15}
                      strokeWidth={2}
                      className="text-muted-foreground"
                    />
                  </Pressable>
                )}
              </View>
            </View>

            {/* ==================================================
                RESULT COUNT / SEARCH STATUS
            =================================================== */}
            {debouncedSearch.length > 0 &&
              !showLoading &&
              newsData.length > 0 && (
                <View className="mt-5 flex-row items-center justify-between px-1">
                  <Text className="font-quicksand-bold text-sm">
                    Search results
                  </Text>

                  <View className="rounded-full bg-secondary px-3 py-1">
                    <Text className="font-quicksand-semibold text-[10px] text-muted-foreground">
                      {newsData.length}{" "}
                      {newsData.length === 1 ? "ARTICLE" : "ARTICLES"}
                    </Text>
                  </View>
                </View>
              )}
          </View>
        }
        ListEmptyComponent={EmptyState}
        renderItem={({ item }) => {
          const formattedDate = new Date(item.date).toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
              year: "numeric",
            },
          );

          return (
            <Pressable
              onPress={() => router.replace(`/news/article/${item.id}`)}
              className="px-5 py-2 active:opacity-80"
            >
              <View className="flex-row overflow-hidden rounded-3xl border border-border bg-card p-3">
                {/* Image */}
                <Image
                  source={{
                    uri: `https://lh3.googleusercontent.com/d/${item.image}`,
                  }}
                  resizeMode="cover"
                  className="h-[105px] w-[105px] rounded-2xl bg-secondary"
                />

                {/* Content */}
                <View className="ml-3 flex-1 justify-between py-1">
                  <View>
                    <View className="mb-2 flex-row items-center">
                      <Icon
                        as={CalendarDays}
                        size={12}
                        strokeWidth={1.7}
                        className="mr-1.5 text-primary"
                      />

                      <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                        {formattedDate}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={3}
                      className="font-quicksand-bold text-sm leading-5"
                    >
                      {item.title}
                    </Text>
                  </View>

                  <Text className="font-quicksand-semibold text-[10px] text-primary">
                    READ ARTICLE →
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator size="small" color={primary} />
            </View>
          ) : newsData.length > 0 ? (
            <View className="items-center px-8 py-8">
              <Text className="text-center font-quicksand-medium text-[10px] text-muted-foreground">
                You've reached the end of the search results.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
