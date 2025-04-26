import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { SafeAreaView, View } from "react-native";
import { useEffect, useState } from "react";
import { Text } from "~/components/ui/text";
import AttendanceConfirmationDialog from "~/components/common/attendances/attendance-confirmation-dialog";

export default function AttendanceScanner() {
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [currentReadedId, setCurrentReadedId] = useState("");
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if (codes[0].value) {
        if (!isConfirmationDialogOpen) {
          setCurrentReadedId(codes[0].value);
          setIsConfirmationDialogOpen(true);
        }
      }
    },
  });

  if (device == null) {
    return (
      <View>
        <Text>Nenhum dispositivo com câmera encontrado!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      {hasPermission ? (
        <>
          <Camera
            isActive
            device={device}
            style={{ flex: 1 }}
            codeScanner={codeScanner}
          />
          <AttendanceConfirmationDialog
            studentId={currentReadedId}
            open={isConfirmationDialogOpen}
            setOpen={setIsConfirmationDialogOpen}
          />
        </>
      ) : (
        <View>
          <Text>A permissão da câmera é necessária para usar o scanner.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
