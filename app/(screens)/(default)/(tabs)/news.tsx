import Input from "@/components/input";
import { Text } from "@/components/ui/text";
import { useTabBarScroll } from "@/hooks/useTabBarScroll";
import { useAppColors } from "@/lib/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  FlatList,
  View,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, CalendarDays, ChevronRight } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

export default function News() {
  const { primary } = useAppColors();
  const { handleScroll } = useTabBarScroll();

  const getNews = async ({ pageParam }: { pageParam: number }) => {
    const { data } = await axios.get("https://occ.edu.ph/api/mobile/news", {
      params: {
        page: pageParam,
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
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["news"],
    queryFn: getNews,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
  });

  const newsData = data?.pages.flatMap((page) => page.data) ?? [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={Platform.OS === "ios" ? [] : ["bottom"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 px-5 pt-5">
          {/* Header Skeleton */}
          <View className="mb-6">
            <View className="h-8 w-32 rounded-lg bg-secondary" />
            <View className="mt-2 h-4 w-52 rounded-lg bg-secondary" />
          </View>

          {/* Search Skeleton */}
          <View className="mb-6 h-12 rounded-full bg-secondary" />

          {/* Card Skeletons */}
          {[1, 2, 3, 4].map((item) => (
            <View
              key={item}
              className="mb-4 overflow-hidden rounded-3xl border border-border bg-card p-3"
            >
              <View className="h-48 w-full rounded-2xl bg-secondary" />

              <View className="p-2">
                <View className="mt-3 h-4 w-28 rounded bg-secondary" />
                <View className="mt-3 h-5 w-full rounded bg-secondary" />
                <View className="mt-2 h-5 w-4/5 rounded bg-secondary" />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        edges={Platform.OS === "ios" ? [] : ["bottom"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center px-8">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={Search}
              size={25}
              strokeWidth={1.8}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-4 text-center font-quicksand-bold text-lg">
            Unable to load news
          </Text>

          <Text className="mt-2 text-center font-quicksand-medium text-sm text-muted-foreground">
            Please check your internet connection and try again.
          </Text>

          <Pressable
            onPress={() => refetch()}
            className="mt-5 rounded-full bg-primary px-6 py-3 active:opacity-80"
          >
            <Text className="font-quicksand-bold text-sm text-primary-foreground">
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" ? ["top"] : ["top", "bottom"]}
      className="flex-1 bg-background"
    >
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className="bg-background px-5 pb-4 pt-4">
            {/* Page Header */}
            <View className="mb-5">
              <Text className="font-quicksand-bold text-2xl">
                News & Updates
              </Text>

              <Text className="mt-1 font-quicksand-medium text-sm text-muted-foreground">
                Stay updated with the latest news
              </Text>
            </View>

            {/* Search */}
            <Pressable
              onPress={() => router.navigate("/news/search/article")}
              className="active:opacity-80"
            >
              <View pointerEvents="none">
                <View className="relative">
                  <Input
                    placeholder="Search news..."
                    className="h-12 rounded-full border-border bg-secondary pl-11 pr-4"
                  />

                  <View className="absolute left-4 top-0 h-12 items-center justify-center">
                    <Icon
                      as={Search}
                      size={18}
                      strokeWidth={1.8}
                      className="text-muted-foreground"
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.navigate(`/news/article/${item.id}`)}
            className="mx-5 mb-4 overflow-hidden rounded-3xl border border-border bg-card active:opacity-90"
          >
            {/* Image */}
            <View className="relative overflow-hidden">
              <Image
                source={{
                  uri: `https://lh3.googleusercontent.com/d/${item.image}`,
                }}
                className="h-52 w-full"
                resizeMode="cover"
              />

              {/* Image Overlay */}
              <View className="absolute bottom-0 left-0 right-0 h-20 bg-black/10" />

              {/* Latest Badge */}
              {index === 0 && (
                <View className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1.5">
                  <Text className="font-quicksand-bold text-[10px] text-primary-foreground">
                    LATEST
                  </Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View className="p-4">
              {/* Date */}
              <View className="flex-row items-center">
                <Icon
                  as={CalendarDays}
                  size={14}
                  strokeWidth={1.8}
                  className="text-muted-foreground"
                />

                <Text className="ml-1.5 font-quicksand-semibold text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </Text>
              </View>

              {/* Title */}
              <Text
                numberOfLines={3}
                className="mt-2 font-quicksand-bold text-lg leading-6"
              >
                {item.title}
              </Text>

              {/* Read More */}
              <View className="mt-4 flex-row items-center justify-between">
                <Text className="font-quicksand-semibold text-xs text-primary">
                  Read article
                </Text>

                <View className="size-8 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    as={ChevronRight}
                    size={16}
                    strokeWidth={2}
                    className="text-primary"
                  />
                </View>
              </View>
            </View>
          </Pressable>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center px-8 pt-20">
            <View className="size-16 items-center justify-center rounded-full bg-secondary">
              <Icon
                as={Search}
                size={25}
                strokeWidth={1.8}
                className="text-muted-foreground"
              />
            </View>

            <Text className="mt-4 font-quicksand-bold text-lg">
              No news available
            </Text>

            <Text className="mt-2 text-center font-quicksand-medium text-sm text-muted-foreground">
              There are no news articles available right now.
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color={primary} />
              <Text className="mt-2 font-quicksand-medium text-xs text-muted-foreground">
                Loading more news...
              </Text>
            </View>
          ) : (
            <View className="items-center px-5 py-5">
              <Text className="font-quicksand-medium text-xs text-muted-foreground">
                You've reached the end of the news.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
