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

interface FolderResponse {
  files: DriveFile[];
  nextPageToken: string | null;
}

export default function SangguniangBayan() {
  const { primary } = useAppColors();
  const { setOrdinance } = useStore();

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
    queryKey: ["ordinance-folders"],
    queryFn: getOrdinanceFolder,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });

  const folders = useMemo(() => {
    return data?.pages.flatMap((page) => page.files) ?? [];
  }, [data]);

  const handleOpenFolder = (item: DriveFile) => {
    setOrdinance({
      folder_id: item.id,
      folder_name: item.name,
    });

    router.push("/home/services/sangguniang-bayan/ordinance-pdf");
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
            Loading ordinances...
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
            Unable to load ordinances
          </Text>

          <Text className="mt-2 text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            Something went wrong while loading the Sangguniang Bayan documents.
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
        data={folders}
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
                HEADER
            =================================================== */}

            <View className="mb-5">
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
                    Sangguniang Bayan
                  </Text>

                  <Text className="mt-0.5 font-quicksand-medium text-xs text-muted-foreground">
                    Ordinances and official documents
                  </Text>
                </View>
              </View>
            </View>

            {/* ==================================================
                DESCRIPTION
            =================================================== */}

            <View className="mb-4 rounded-3xl bg-secondary p-4">
              <View className="flex-row">
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
                    Official Documents
                  </Text>

                  <Text className="mt-1 font-quicksand-medium text-xs leading-4 text-muted-foreground">
                    Browse ordinance collections and select a folder to view its
                    documents.
                  </Text>
                </View>
              </View>
            </View>

            {/* ==================================================
                SEARCH
            =================================================== */}

            <Pressable
              onPress={() =>
                router.push(
                  "/home/services/sangguniang-bayan/search/ordinance-folder",
                )
              }
            >
              <View pointerEvents="none">
                <View className="relative">
                  <Input
                    placeholder="Search ordinances..."
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
                SECTION TITLE
            =================================================== */}

            {folders.length > 0 && (
              <View className="mt-6 flex-row items-center justify-between px-1">
                <Text className="font-quicksand-bold text-base">
                  Ordinance Collections
                </Text>

                <View className="rounded-full bg-secondary px-3 py-1">
                  <Text className="font-quicksand-semibold text-[10px] text-muted-foreground">
                    {folders.length}{" "}
                    {folders.length === 1 ? "FOLDER" : "FOLDERS"}
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
                as={FolderOpen}
                size={31}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </View>

            <Text className="mt-5 text-center font-quicksand-bold text-xl">
              No folders available
            </Text>

            <Text className="mt-2 max-w-[280px] text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
              There are currently no ordinance collections available.
            </Text>
          </View>
        }
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
                    Ordinance documents
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
                Loading more...
              </Text>
            </View>
          ) : folders.length > 0 ? (
            <View className="items-center px-8 py-7">
              <Text className="text-center font-quicksand-medium text-[10px] text-muted-foreground">
                You've reached the end of the ordinance collections.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
