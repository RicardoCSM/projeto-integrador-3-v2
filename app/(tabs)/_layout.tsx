import { Tabs } from "expo-router";
import { ActivityIndicator, Image, View } from "react-native";
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
      <View className="flex-1 flex flex-col items-center justify-between">
        <View className="flex w-full h-2/3 items-center md:h-full p-6 md:p-10 justify-center flex-col gap-6 bg-eeaa rounded-b-3xl md:rounded-b-none">
          <LoginForm />
        </View>
        <View className="flex w-full h-1/3 md:hidden justify-center flex-col">
          <View className="flex w-full h-full overflow-hidden items-center">
            <Image
              source={require("~/assets/images/login-vector.png")}
              style={{
                width: "120%",
                height: "150%",
              }}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#168a43",
        },
        headerTitleStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Gerenciar Estudantes",
          tabBarIcon({ color, size }) {
            return <UsersRound color={color} size={size} />;
          },
          headerLeft: () => (
            <Image
              source={require("~/assets/images/logo-eeaa.png")}
              style={{ width: 60, height: 36, marginHorizontal: 10 }}
            />
          ),
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
          title: "Presenças",
          tabBarIcon({ color, size }) {
            return <ScanQrCode color={color} size={size} />;
          },
          headerLeft: () => (
            <Image
              source={require("~/assets/images/logo-eeaa.png")}
              style={{ width: 60, height: 36, marginHorizontal: 10 }}
            />
          ),
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
