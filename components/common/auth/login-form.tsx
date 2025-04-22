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

export default function LoginForm() {
  const { signIn, isLoading } = useAuth();

  return (
    <View className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">Seja Bem-vindo</CardTitle>
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
