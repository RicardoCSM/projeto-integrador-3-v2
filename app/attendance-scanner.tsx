import { Text } from "~/components/ui/text";
import { useAttendances } from "~/store/useAttendances";
import { Button } from "~/components/ui/button";
import { router, Stack } from "expo-router";
import AttendanceScanner from "~/components/common/attendances/attendance-scanner";
import { useState } from "react";

export default function AttendanceScannerPage() {
  const { selectedAttendanceDate, setSelectedAttendanceDate } =
    useAttendances();
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [currentReadedId, setCurrentReadedId] = useState("");

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
      <AttendanceScanner />
    </>
  );
}
