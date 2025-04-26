import { Text } from "~/components/ui/text";
import { useAttendances } from "~/store/useAttendances";
import { Button } from "~/components/ui/button";
import { router, Stack } from "expo-router";
import { Platform } from "react-native";
import { default as AttendanceScanner } from "~/components/common/attendances/attendance-scanner";

export default function AttendanceScannerPage() {
  const { selectedAttendanceDate, setSelectedAttendanceDate } =
    useAttendances();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle(props) {
            return (
              <Text className="text-center text-lg font-bold">
                Chamada de {selectedAttendanceDate?.date}
              </Text>
            );
          },
          headerLeft: () => (
            <Button
              onPress={() => {
                setSelectedAttendanceDate(null);
                router.push("/(tabs)/attendance");
              }}
              size="sm"
            >
              <Text>Encerrar</Text>
            </Button>
          ),
        }}
      />
      {Platform.OS === "web" ? (
        <Text className="text-center text-lg font-bold">
          O scanner de QR Code não está disponível no navegador.
        </Text>
      ) : (
        <AttendanceScanner />
      )}
    </>
  );
}
