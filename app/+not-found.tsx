import React from "react";
import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 justify-center items-center gap-5">
        <Text className="text-2xl font-bold">
          Essa tela não foi encontrada.
        </Text>
        <Link href="/" className="bg-blue-500 rounded-lg px-4 py-2">
          <Text className="text-white">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
