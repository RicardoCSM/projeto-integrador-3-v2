import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import LoginForm from "~/components/common/auth/login-form";
import SignOutButton from "~/components/common/auth/sign-out-button";
import { ThemeToggle } from "~/components/theme-toggle";
import { useAuth } from "~/context/auth";
import { UsersRound } from "~/lib/icons/UsersRound";
import { ScanQrCode } from "~/lib/icons/ScanQrCode";

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 flex flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <View className="flex w-full max-w-sm flex-col gap-6">
          <LoginForm />
        </View>
      </View>
    );
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Gerenciar Estudantes",
          tabBarIcon({ color, size }) {
            return <UsersRound color={color} size={size} />;
          },
          headerRight: () => (
            <>
              <ThemeToggle />
              <SignOutButton />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Listas de Presença",
          tabBarIcon({ color, size }) {
            return <ScanQrCode color={color} size={size} />;
          },
          headerRight: () => (
            <>
              <ThemeToggle />
              <SignOutButton />
            </>
          ),
        }}
      />
    </Tabs>
  );
}
