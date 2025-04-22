import { Image, View } from "react-native";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";

export default function SignInWithGoogleButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Button onPress={onPress} disabled={disabled}>
      <View className="flex flex-row">
        <Image
          source={require("~/assets/images/google-icon.png")}
          style={{
            width: 18,
            height: 18,
            marginRight: 6,
          }}
        />
        <Text>Continuar com o Google</Text>
      </View>
    </Button>
  );
}
