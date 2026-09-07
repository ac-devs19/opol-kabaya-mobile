import axios from "@/api/axios";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useTabBarScroll } from "@/hooks/useTabBarScroll";
import { useGreeting } from "@/hooks/useGreeting";
import { useAppColors } from "@/lib/theme";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ArrowRight,
  Cake,
  ChevronsDownUp,
  ChevronsUpDown,
  Heart,
  LayoutGrid,
  Newspaper,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { cn } from "@/lib/utils";
import { useVerificationSheet } from "@/hooks/useVerificationSheet";

/*
|--------------------------------------------------------------------------
| Link System
|--------------------------------------------------------------------------
*/

interface LinkSystem {
  label: string;
  icon: string;
  href: string;
  is_active: number;
  is_open: number;
}

/*
|--------------------------------------------------------------------------
| Demographics
|--------------------------------------------------------------------------
*/

interface DemographicItem {
  count: number;
  percentage: number;
}

interface Demographics {
  total_residents: number;

  sex: {
    male: DemographicItem;
    female: DemographicItem;
    other: DemographicItem;
  };

  age: {
    "0-17": DemographicItem;
    "18-30": DemographicItem;
    "31-45": DemographicItem;
    "46-60": DemographicItem;
    "61+": DemographicItem;
  };

  marital_status: {
    single: DemographicItem;
    married: DemographicItem;
    widowed: DemographicItem;
    divorced: DemographicItem;
    separated: DemographicItem;
    unknown: DemographicItem;
  };
}

export default function Home() {
  const { user, getUser } = useAuth();

  const [expanded, setExpanded] = useState(false);

  const { width } = useWindowDimensions();

  const { handleScroll } = useTabBarScroll();

  const { primary } = useAppColors();

  const greeting = useGreeting();

  const { setOpen } = useVerificationSheet();

  /*
  |--------------------------------------------------------------------------
  | Link Systems
  |--------------------------------------------------------------------------
  */

  const { data, isLoading, refetch, isRefetching } = useQuery<LinkSystem[]>({
    queryKey: ["link-systems"],

    queryFn: async () => {
      const { data } = await axios.get("/link-systems");

      return data;
    },
  });

  /*
  |--------------------------------------------------------------------------
  | News
  |--------------------------------------------------------------------------
  */

  const {
    data: dataNews,
    isLoading: isLoadingNews,
    refetch: refetchNews,
    isRefetching: isRefetchingNews,
  } = useQuery({
    queryKey: ["home-news"],

    queryFn: async () => {
      const { data } = await axios.get("https://occ.edu.ph/api/mobile/news");

      return data;
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Demographics
  |--------------------------------------------------------------------------
  */

  const {
    data: demographics,
    isLoading: isLoadingDemographics,
    refetch: refetchDemographics,
    isRefetching: isRefetchingDemographics,
  } = useQuery<Demographics>({
    queryKey: ["home-demographics"],

    queryFn: async () => {
      const { data } = await axios.get("/demographics");

      return data;
    },
  });

  /*
  |--------------------------------------------------------------------------
  | News Data
  |--------------------------------------------------------------------------
  */

  const news = dataNews?.data?.slice(0, 2);

  /*
  |--------------------------------------------------------------------------
  | Services
  |--------------------------------------------------------------------------
  */

  const visibleItems = expanded ? data : data?.slice(0, 7);

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    await Promise.all([
      getUser(),
      refetch(),
      refetchNews(),
      refetchDemographics(),
    ]);
  };

  const refreshing =
    isRefetching || isRefetchingNews || isRefetchingDemographics;

  /*
  |--------------------------------------------------------------------------
  | Format Date
  |--------------------------------------------------------------------------
  */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 100,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={primary}
          colors={[primary]}
        />
      }
    >
      <View className="gap-7">
        {/* =====================================================
            WELCOME
        ====================================================== */}

        <View className="px-5">
          <View className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-6">
            <View className="absolute -right-12 -top-12 size-40 rounded-full bg-white/10" />

            <View className="absolute -bottom-16 -left-10 size-36 rounded-full bg-white/10" />

            <View className="flex-row items-center">
              {/* Greeting */}

              <View className="flex-1 pr-2">
                <Text className="font-quicksand-medium text-sm text-primary-foreground/75">
                  Welcome back
                </Text>

                <Text className="mt-1 font-quicksand-bold text-xl text-primary-foreground">
                  {greeting},
                </Text>

                <Text className="font-quicksand-bold text-xl text-primary-foreground">
                  {user?.first_name}
                </Text>

                <View className="mt-4 self-start rounded-full bg-white/15 px-3 py-1.5">
                  <Text className="font-quicksand-semibold text-[11px] text-primary-foreground">
                    KABAYA • OPOL
                  </Text>
                </View>
              </View>

              <Image
                resizeMode="contain"
                source={require("@/assets/images/kabaya/wonderful-opol.png")}
                className="size-[125px]"
              />
            </View>
          </View>
        </View>

        {/* =====================================================
            VERIFICATION ALERT
        ====================================================== */}

        {user?.is_verified !== 1 &&
          user?.latest_verification?.status !== "approved" && (
            <View className="px-5">
              <View
                className={cn(
                  "overflow-hidden rounded-2xl border",

                  user?.latest_verification?.status === "pending"
                    ? "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
                    : user?.latest_verification?.status === "rejected"
                      ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                      : "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20",
                )}
              >
                <View className="flex-row items-center p-4">
                  <View
                    className={cn(
                      "size-11 items-center justify-center rounded-2xl",

                      user?.latest_verification?.status === "pending"
                        ? "bg-blue-100 dark:bg-blue-900/40"
                        : user?.latest_verification?.status === "rejected"
                          ? "bg-red-100 dark:bg-red-900/40"
                          : "bg-orange-100 dark:bg-orange-900/40",
                    )}
                  >
                    <Icon
                      as={ShieldCheck}
                      size={21}
                      strokeWidth={1.8}
                      className={cn(
                        user?.latest_verification?.status === "pending"
                          ? "text-blue-600 dark:text-blue-400"
                          : user?.latest_verification?.status === "rejected"
                            ? "text-red-600 dark:text-red-400"
                            : "text-orange-600 dark:text-orange-400",
                      )}
                    />
                  </View>

                  <View className="ml-3 flex-1 pr-3">
                    {user?.latest_verification?.status === "pending" ? (
                      <>
                        <Text className="font-quicksand-bold text-sm text-blue-950 dark:text-blue-100">
                          Verification pending
                        </Text>

                        <Text className="mt-0.5 font-quicksand-medium text-[11px] leading-4 text-blue-800/70 dark:text-blue-200/70">
                          Your identity verification is being reviewed. We'll
                          notify you once the review is complete.
                        </Text>
                      </>
                    ) : user?.latest_verification?.status === "rejected" ? (
                      <>
                        <Text className="font-quicksand-bold text-sm text-red-950 dark:text-red-100">
                          Verification unsuccessful
                        </Text>

                        <Text className="mt-0.5 font-quicksand-medium text-[11px] leading-4 text-red-800/70 dark:text-red-200/70">
                          We couldn't verify your identity. Please review your
                          information and try again.
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text className="font-quicksand-bold text-sm text-orange-950 dark:text-orange-100">
                          Verify your account
                        </Text>

                        <Text className="mt-0.5 font-quicksand-medium text-[11px] leading-4 text-orange-800/70 dark:text-orange-200/70">
                          Unlock more Kabaya services by completing
                          verification.
                        </Text>
                      </>
                    )}
                  </View>

                  {user?.latest_verification?.status !== "pending" && (
                    <Pressable
                      onPress={() =>
                        router.push("/home/verifications/personal")
                      }
                      className={cn(
                        "rounded-full px-3.5 py-2 active:opacity-80",

                        user?.latest_verification?.status === "rejected"
                          ? "bg-red-500 active:bg-red-600"
                          : "bg-orange-500 active:bg-orange-600",
                      )}
                    >
                      <Text className="font-quicksand-bold text-[11px] text-white">
                        {user?.latest_verification?.status === "rejected"
                          ? "Try Again"
                          : "Verify"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          )}

        {/* =====================================================
            BANNER
        ====================================================== */}

        <View className="overflow-hidden">
          <Image
            source={require("@/assets/images/kabaya/banner.png")}
            style={{
              width,
              height: width * (486 / 1280),
            }}
            resizeMode="cover"
          />
        </View>

        {/* =====================================================
            SERVICES
        ====================================================== */}

        <View className="px-5">
          <View className="mb-4 flex-row items-end justify-between">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Icon
                  as={LayoutGrid}
                  size={20}
                  strokeWidth={1.8}
                  className="mr-2 text-primary"
                />

                <Text className="font-quicksand-bold text-xl">Services</Text>
              </View>

              <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
                Access Kabaya services and systems
              </Text>
            </View>

            <View className="rounded-full bg-secondary px-3 py-1.5">
              <Text className="font-quicksand-semibold text-[10px] text-muted-foreground">
                {data?.length ? data.length + 1 : 1} AVAILABLE
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap">
            {/* Dynamic Services */}

            {visibleItems?.map((item, index) =>
              item.is_active === 1 ? (
                <View
                  key={`${item.label}-${index}`}
                  className="mb-5 w-1/4 px-1.5"
                >
                  <TouchableOpacity
                    onPress={() => {
                      const canAccess = item.is_open === 1 || user?.is_verified === 1;

                      if (!canAccess) {
                        setOpen(true);
                        return;
                      }

                      router.push({
                        pathname: "/webview",
                        params: {
                          url: item.href,
                        },
                      });
                    }}
                    activeOpacity={0.75}
                    className="aspect-square items-center justify-center rounded-[24px] bg-secondary"
                  >
                    <View className="size-[58px] items-center justify-center overflow-hidden rounded-full bg-background">
                      <Image
                        resizeMode="contain"
                        source={{
                          uri: `https://lh3.googleusercontent.com/d/${item.icon}`,
                        }}
                        className="size-[58px]"
                      />
                    </View>
                  </TouchableOpacity>

                  <Text
                    numberOfLines={2}
                    className="mt-2 text-center font-quicksand-semibold text-[11px] leading-4"
                  >
                    {item.label}
                  </Text>
                </View>
              ) : null,
            )}

            {/* Sangguniang Bayan */}

            <View className="mb-5 w-1/4 px-1.5">
              <TouchableOpacity
                onPress={() => {
                  if (user?.is_verified !== 1) {
                    setOpen(true);
                    return;
                  }

                  router.push("/home/services/sangguniang-bayan");
                }}
                activeOpacity={0.75}
                className="aspect-square items-center justify-center rounded-[24px] bg-secondary"
              >
                <View className="size-[58px] items-center justify-center rounded-full bg-background">
                  <Text className="font-quicksand-bold text-xl text-primary">
                    SB
                  </Text>
                </View>
              </TouchableOpacity>

              <Text
                numberOfLines={2}
                className="mt-2 text-center font-quicksand-semibold text-[11px] leading-4"
              >
                Sangguniang Bayan
              </Text>
            </View>

            {/* Show More */}

            {data && data.length > 7 && (
              <View className="mb-5 w-1/4 px-1.5">
                <TouchableOpacity
                  onPress={() => setExpanded(!expanded)}
                  activeOpacity={0.75}
                  className="aspect-square items-center justify-center rounded-[24px] bg-secondary"
                >
                  <View className="size-[58px] items-center justify-center rounded-full bg-background">
                    <Icon
                      as={expanded ? ChevronsDownUp : ChevronsUpDown}
                      size={22}
                      strokeWidth={1.7}
                      className="text-primary"
                    />
                  </View>
                </TouchableOpacity>

                <Text
                  numberOfLines={2}
                  className="mt-2 text-center font-quicksand-semibold text-[11px] leading-4"
                >
                  {expanded ? "Show Less" : "Show More"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* =====================================================
            NEWS
        ====================================================== */}

        <View>
          <View className="mb-4 flex-row items-end justify-between px-5">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Icon
                  as={Newspaper}
                  size={20}
                  strokeWidth={1.8}
                  className="mr-2 text-primary"
                />

                <Text className="font-quicksand-bold text-xl">Latest News</Text>
              </View>

              <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
                News and announcements from Opol
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/news")}
              className="flex-row items-center rounded-full bg-secondary px-3 py-2 active:opacity-70"
            >
              <Text className="mr-1 font-quicksand-semibold text-xs">
                See all
              </Text>

              <Icon as={ArrowRight} size={14} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Loading */}

          {isLoadingNews ? (
            <View className="px-5">
              <View className="h-56 rounded-3xl bg-secondary" />

              <View className="mt-4 h-5 w-4/5 rounded-lg bg-secondary" />

              <View className="mt-2 h-4 w-2/5 rounded-lg bg-secondary" />
            </View>
          ) : news?.length ? (
            <View className="gap-4">
              {/* Featured News */}

              {news[0] && (
                <Pressable
                  onPress={() => router.navigate(`/news/article/${news[0].id}`)}
                  className="mx-5 overflow-hidden rounded-3xl border border-border bg-card active:opacity-90"
                >
                  <View className="relative">
                    <Image
                      source={{
                        uri: `https://lh3.googleusercontent.com/d/${news[0].image}`,
                      }}
                      resizeMode="cover"
                      className="h-56 w-full"
                    />

                    <View className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5">
                      <Text className="font-quicksand-bold text-[10px] text-primary-foreground">
                        FEATURED
                      </Text>
                    </View>
                  </View>

                  <View className="p-4">
                    <Text
                      numberOfLines={3}
                      className="font-quicksand-bold text-lg leading-6"
                    >
                      {news[0].title}
                    </Text>

                    <View className="mt-3 flex-row items-center justify-between">
                      <Text className="font-quicksand-medium text-xs text-muted-foreground">
                        {formatDate(news[0].date)}
                      </Text>

                      <View className="flex-row items-center">
                        <Text className="mr-1 font-quicksand-semibold text-xs text-primary">
                          Read more
                        </Text>

                        <Icon
                          as={ArrowRight}
                          size={14}
                          strokeWidth={2}
                          className="text-primary"
                        />
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}

              {/* Second News */}

              {news[1] && (
                <Pressable
                  onPress={() => router.navigate(`/news/article/${news[1].id}`)}
                  className="mx-5 overflow-hidden rounded-3xl border border-border bg-card p-3 active:opacity-90"
                >
                  <View className="flex-row">
                    <Image
                      source={{
                        uri: `https://lh3.googleusercontent.com/d/${news[1].image}`,
                      }}
                      resizeMode="cover"
                      className="size-[92px] rounded-2xl"
                    />

                    <View className="ml-3 flex-1 justify-between py-1">
                      <Text
                        numberOfLines={3}
                        className="font-quicksand-bold text-sm leading-5"
                      >
                        {news[1].title}
                      </Text>

                      <View className="flex-row items-center justify-between">
                        <Text className="font-quicksand-medium text-[11px] text-muted-foreground">
                          {formatDate(news[1].date)}
                        </Text>

                        <Icon as={ArrowRight} size={15} strokeWidth={2} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
            </View>
          ) : (
            <View className="mx-5 items-center rounded-3xl bg-secondary px-6 py-10">
              <View className="size-14 items-center justify-center rounded-full bg-background">
                <Icon
                  as={Newspaper}
                  size={24}
                  strokeWidth={1.7}
                  className="text-muted-foreground"
                />
              </View>

              <Text className="mt-3 font-quicksand-bold text-base">
                No news available
              </Text>

              <Text className="mt-1 text-center font-quicksand-medium text-xs text-muted-foreground">
                Check back later for the latest announcements.
              </Text>
            </View>
          )}
        </View>

        {/* =====================================================
            KABAYA COMMUNITY DEMOGRAPHICS
        ====================================================== */}

        <View className="px-5">
          {/* Header */}

          <View className="mb-4">
            <View className="flex-row items-center">
              <Icon
                as={Users}
                size={20}
                strokeWidth={1.8}
                className="mr-2 text-primary"
              />

              <Text className="font-quicksand-bold text-xl">
                Kabaya Community
              </Text>
            </View>

            <Text className="mt-1 font-quicksand-medium text-xs text-muted-foreground">
              Demographic profile of Opol residents
            </Text>
          </View>

          {/* Loading */}

          {isLoadingDemographics ? (
            <View className="overflow-hidden rounded-[28px] bg-secondary p-5">
              <View className="h-20 rounded-2xl bg-background" />

              <View className="mt-4 h-36 rounded-2xl bg-background" />

              <View className="mt-4 h-36 rounded-2xl bg-background" />
            </View>
          ) : demographics ? (
            <View className="overflow-hidden rounded-[28px] bg-secondary">
              {/* Primary Accent */}

              <View className="h-1.5 bg-primary" />

              <View className="p-5">
                {/* =================================================
                    TOTAL RESIDENTS
                ================================================== */}

                <View className="flex-row items-center">
                  <View className="size-[64px] items-center justify-center rounded-[22px] bg-background">
                    <Icon
                      as={Users}
                      size={28}
                      strokeWidth={1.8}
                      className="text-primary"
                    />
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="font-quicksand-medium text-xs text-muted-foreground">
                      TOTAL RESIDENTS
                    </Text>

                    <Text className="mt-0.5 font-quicksand-bold text-3xl">
                      {demographics.total_residents.toLocaleString()}
                    </Text>

                    <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                      Registered residents in Opol
                    </Text>
                  </View>
                </View>

                <View className="my-5 h-px bg-border" />

                {/* =================================================
                    SEX
                ================================================== */}

                <View>
                  <View className="mb-4 flex-row items-center">
                    <View className="size-9 items-center justify-center rounded-xl bg-background">
                      <Icon
                        as={UserRound}
                        size={18}
                        strokeWidth={1.8}
                        className="text-primary"
                      />
                    </View>

                    <View className="ml-3">
                      <Text className="font-quicksand-bold text-sm">Sex</Text>

                      <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                        Resident distribution
                      </Text>
                    </View>
                  </View>

                  {/* Male */}

                  <View className="mb-4">
                    <View className="mb-1.5 flex-row items-center justify-between">
                      <Text className="font-quicksand-semibold text-xs">
                        Male
                      </Text>

                      <Text className="font-quicksand-bold text-xs text-primary">
                        {demographics.sex.male?.percentage ?? 0}%
                      </Text>
                    </View>

                    <View className="h-2 overflow-hidden rounded-full bg-background">
                      <View
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${demographics.sex.male?.percentage ?? 0}%`,
                        }}
                      />
                    </View>

                    <Text className="mt-1 font-quicksand-medium text-[9px] text-muted-foreground">
                      {(demographics.sex.male?.count ?? 0).toLocaleString()}{" "}
                      residents
                    </Text>
                  </View>

                  {/* Female */}

                  <View>
                    <View className="mb-1.5 flex-row items-center justify-between">
                      <Text className="font-quicksand-semibold text-xs">
                        Female
                      </Text>

                      <Text className="font-quicksand-bold text-xs text-primary">
                        {demographics.sex.female?.percentage ?? 0}%
                      </Text>
                    </View>

                    <View className="h-2 overflow-hidden rounded-full bg-background">
                      <View
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${demographics.sex.female?.percentage ?? 0}%`,
                        }}
                      />
                    </View>

                    <Text className="mt-1 font-quicksand-medium text-[9px] text-muted-foreground">
                      {(demographics.sex.female?.count ?? 0).toLocaleString()}{" "}
                      residents
                    </Text>
                  </View>

                  {/* Other */}

                  {(demographics.sex.other?.count ?? 0) > 0 && (
                    <View className="mt-4">
                      <View className="mb-1.5 flex-row items-center justify-between">
                        <Text className="font-quicksand-semibold text-xs">
                          Other / Not specified
                        </Text>

                        <Text className="font-quicksand-bold text-xs text-primary">
                          {demographics.sex.other?.percentage ?? 0}%
                        </Text>
                      </View>

                      <View className="h-2 overflow-hidden rounded-full bg-background">
                        <View
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${demographics.sex.other?.percentage ?? 0}%`,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </View>

                <View className="my-5 h-px bg-border" />

                {/* =================================================
                    AGE DISTRIBUTION
                ================================================== */}

                <View>
                  <View className="mb-4 flex-row items-center">
                    <View className="size-9 items-center justify-center rounded-xl bg-background">
                      <Icon
                        as={Cake}
                        size={18}
                        strokeWidth={1.8}
                        className="text-primary"
                      />
                    </View>

                    <View className="ml-3">
                      <Text className="font-quicksand-bold text-sm">
                        Age Distribution
                      </Text>

                      <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                        Residents by age group
                      </Text>
                    </View>
                  </View>

                  {[
                    {
                      key: "0-17" as const,
                      label: "0–17",
                    },
                    {
                      key: "18-30" as const,
                      label: "18–30",
                    },
                    {
                      key: "31-45" as const,
                      label: "31–45",
                    },
                    {
                      key: "46-60" as const,
                      label: "46–60",
                    },
                    {
                      key: "61+" as const,
                      label: "61+",
                    },
                  ].map((group) => {
                    const item = demographics.age[group.key];

                    return (
                      <View key={group.key} className="mb-4">
                        <View className="mb-1.5 flex-row items-center justify-between">
                          <Text className="font-quicksand-semibold text-xs">
                            {group.label}
                          </Text>

                          <Text className="font-quicksand-bold text-xs text-primary">
                            {item?.percentage ?? 0}%
                          </Text>
                        </View>

                        <View className="h-2 overflow-hidden rounded-full bg-background">
                          <View
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${item?.percentage ?? 0}%`,
                            }}
                          />
                        </View>

                        <Text className="mt-1 font-quicksand-medium text-[9px] text-muted-foreground">
                          {(item?.count ?? 0).toLocaleString()} residents
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View className="my-5 h-px bg-border" />

                {/* =================================================
                    MARITAL STATUS
                ================================================== */}

                <View>
                  <View className="mb-4 flex-row items-center">
                    <View className="size-9 items-center justify-center rounded-xl bg-background">
                      <Icon
                        as={Heart}
                        size={18}
                        strokeWidth={1.8}
                        className="text-primary"
                      />
                    </View>

                    <View className="ml-3">
                      <Text className="font-quicksand-bold text-sm">
                        Marital Status
                      </Text>

                      <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                        Resident marital status
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap">
                    {/* Single */}

                    <View className="mb-3 w-1/2 pr-2">
                      <View className="rounded-2xl bg-background p-3.5">
                        <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                          Single
                        </Text>

                        <Text className="mt-1 font-quicksand-bold text-xl">
                          {demographics.marital_status.single?.percentage ?? 0}%
                        </Text>

                        <Text className="mt-0.5 font-quicksand-medium text-[9px] text-muted-foreground">
                          {(
                            demographics.marital_status.single?.count ?? 0
                          ).toLocaleString()}{" "}
                          residents
                        </Text>
                      </View>
                    </View>

                    {/* Married */}

                    <View className="mb-3 w-1/2 pl-2">
                      <View className="rounded-2xl bg-background p-3.5">
                        <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                          Married
                        </Text>

                        <Text className="mt-1 font-quicksand-bold text-xl">
                          {demographics.marital_status.married?.percentage ?? 0}
                          %
                        </Text>

                        <Text className="mt-0.5 font-quicksand-medium text-[9px] text-muted-foreground">
                          {(
                            demographics.marital_status.married?.count ?? 0
                          ).toLocaleString()}{" "}
                          residents
                        </Text>
                      </View>
                    </View>

                    {/* Widowed */}

                    <View className="w-1/2 pr-2">
                      <View className="rounded-2xl bg-background p-3.5">
                        <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                          Widowed
                        </Text>

                        <Text className="mt-1 font-quicksand-bold text-xl">
                          {demographics.marital_status.widowed?.percentage ?? 0}
                          %
                        </Text>

                        <Text className="mt-0.5 font-quicksand-medium text-[9px] text-muted-foreground">
                          {(
                            demographics.marital_status.widowed?.count ?? 0
                          ).toLocaleString()}{" "}
                          residents
                        </Text>
                      </View>
                    </View>

                    {/* Divorced */}

                    <View className="w-1/2 pl-2">
                      <View className="rounded-2xl bg-background p-3.5">
                        <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                          Divorced
                        </Text>

                        <Text className="mt-1 font-quicksand-bold text-xl">
                          {demographics.marital_status.divorced?.percentage ??
                            0}
                          %
                        </Text>

                        <Text className="mt-0.5 font-quicksand-medium text-[9px] text-muted-foreground">
                          {(
                            demographics.marital_status.divorced?.count ?? 0
                          ).toLocaleString()}{" "}
                          residents
                        </Text>
                      </View>
                    </View>

                    {/* Separated */}

                    {(demographics.marital_status.separated?.count ?? 0) >
                      0 && (
                      <View className="mt-3 w-full">
                        <View className="rounded-2xl bg-background p-3.5">
                          <Text className="font-quicksand-medium text-[10px] text-muted-foreground">
                            Separated
                          </Text>

                          <Text className="mt-1 font-quicksand-bold text-xl">
                            {demographics.marital_status.separated
                              ?.percentage ?? 0}
                            %
                          </Text>

                          <Text className="mt-0.5 font-quicksand-medium text-[9px] text-muted-foreground">
                            {(
                              demographics.marital_status.separated?.count ?? 0
                            ).toLocaleString()}{" "}
                            residents
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center rounded-[28px] bg-secondary px-6 py-10">
              <View className="size-14 items-center justify-center rounded-full bg-background">
                <Icon
                  as={Users}
                  size={24}
                  strokeWidth={1.7}
                  className="text-muted-foreground"
                />
              </View>

              <Text className="mt-3 font-quicksand-bold text-base">
                Demographics unavailable
              </Text>

              <Text className="mt-1 text-center font-quicksand-medium text-xs text-muted-foreground">
                Community demographic information is currently unavailable.
              </Text>
            </View>
          )}
        </View>

        {/* =====================================================
            BOTTOM SPACING
        ====================================================== */}

        <View className="h-8" />
      </View>
    </ScrollView>
  );
}
