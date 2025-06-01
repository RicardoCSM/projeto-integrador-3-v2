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
          headerStyle: {
            backgroundColor: "#168a43",
          },
          headerTitle(props) {
            return (
              <Text className="text-center text-lg font-bold text-white">
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
              className="bg-white"
              size="sm"
            >
              <Text className="text-black">Encerrar</Text>
            </Button>
          ),
          headerRight: () => <></>,
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
