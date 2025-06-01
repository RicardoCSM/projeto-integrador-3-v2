import { useAuth } from "~/context/auth";
import SignInWithGoogleButton from "./sign-in-with-google-button";
import { View } from "react-native";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Image } from "react-native";

export default function LoginForm() {
  const { signIn, isLoading } = useAuth();

  return (
    <View className="flex flex-col gap-6 max-w-sm">
      <Card>
        <CardHeader>
          <View className="flex items-center justify-center">
            <Image
              source={require("~/assets/images/logo-eeaa.png")}
              style={{ width: 120, height: 72 }}
            />
          </View>
          <CardTitle className="text-center text-2xl font-bold">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-center">
            Faça login utilizando sua conta do Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInWithGoogleButton onPress={signIn} disabled={isLoading} />
        </CardContent>
      </Card>
    </View>
  );
}
