import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAppColors } from "@/lib/theme";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarDays, Newspaper } from "lucide-react-native";

interface Sdg {
  id: number;
  image: string;
}

interface NewsArticle {
  title: string;
  description: string;
  date: string;
  image: string;
  sdg: Sdg[];
}

export default function Article() {
  const { id } = useLocalSearchParams();
  const { primary } = useAppColors();

  const getArticle = async () => {
    const { data } = await axios.get(
      `https://occ.edu.ph/api/mobile/news/article/${id}`,
    );

    return data;
  };

  const { data, isLoading, isError } = useQuery<NewsArticle>({
    queryKey: ["news-article", id],
    queryFn: getArticle,
  });

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <View className="size-14 items-center justify-center rounded-full bg-secondary">
            <ActivityIndicator size="small" color={primary} />
          </View>

          <Text className="mt-4 font-quicksand-medium text-sm text-muted-foreground">
            Loading article...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="size-16 items-center justify-center rounded-full bg-secondary">
            <Icon
              as={Newspaper}
              size={28}
              strokeWidth={1.6}
              className="text-muted-foreground"
            />
          </View>

          <Text className="mt-5 text-center font-quicksand-bold text-xl">
            Article unavailable
          </Text>

          <Text className="mt-2 text-center font-quicksand-medium text-sm leading-5 text-muted-foreground">
            We couldn't load this article right now. Please try again later.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        <View className="px-5 pt-5">
          {/* =====================================================
              HERO IMAGE
          ====================================================== */}
          <View className="overflow-hidden rounded-[28px] bg-secondary">
            <Image
              source={{
                uri: `https://lh3.googleusercontent.com/d/${data.image}`,
              }}
              resizeMode="cover"
              className="h-64 w-full"
            />
          </View>

          {/* =====================================================
              ARTICLE HEADER
          ====================================================== */}
          <View className="mt-6">
            {/* Date */}
            <View className="flex-row items-center">
              <View className="size-8 items-center justify-center rounded-full bg-primary/10">
                <Icon
                  as={CalendarDays}
                  size={15}
                  strokeWidth={1.8}
                  className="text-primary"
                />
              </View>

              <Text className="ml-2 font-quicksand-semibold text-xs text-muted-foreground">
                {formattedDate}
              </Text>
            </View>

            {/* Title */}
            <Text className="mt-4 font-quicksand-bold text-[28px] leading-[36px]">
              {data.title}
            </Text>
          </View>

          {/* =====================================================
              SDG SECTION
          ====================================================== */}
          {data.sdg?.length > 0 && (
            <View className="mt-6">
              <Text className="mb-3 font-quicksand-bold text-base">
                Sustainable Development Goals
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {data.sdg.map((sdg, index) => (
                  <View
                    key={index}
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <Image
                      source={{
                        uri: `https://lh3.googleusercontent.com/d/${sdg.image}`,
                      }}
                      resizeMode="cover"
                      className="size-14"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* =====================================================
              ARTICLE CONTENT
          ====================================================== */}
          <View className="mt-7">
            <View className="mb-4 flex-row items-center">
              <View className="h-1 w-8 rounded-full bg-primary" />

              <Text className="ml-2 font-quicksand-bold text-base">
                Article
              </Text>
            </View>

            <View className="rounded-3xl bg-secondary p-5">
              <Text className="font-quicksand-regular text-[15px] leading-7">
                {data.description}
              </Text>
            </View>
          </View>

          {/* =====================================================
              FOOTER
          ====================================================== */}
          <View className="mt-8 items-center">
            <View className="size-9 items-center justify-center rounded-full bg-secondary">
              <Icon
                as={Newspaper}
                size={17}
                strokeWidth={1.7}
                className="text-muted-foreground"
              />
            </View>

            <Text className="mt-2 font-quicksand-medium text-[10px] text-muted-foreground">
              Kabaya News
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
