import { useAuth } from "@/contexts/auth-context";
import { Stack } from "expo-router";

export default function DefaultLayout() {
  const { user } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected
        guard={user?.user_session.required_password === 1 ? true : false}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot" />
      </Stack.Protected>
      <Stack.Protected
        guard={user?.user_session.required_password === 0 ? true : false}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(pages)" />
      </Stack.Protected>
    </Stack>
  );
}
