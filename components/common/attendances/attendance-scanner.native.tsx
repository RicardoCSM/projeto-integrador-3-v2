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
import { Student } from "~/types/student";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.AUTH_SECRET_KEY || "";

export default function AttendanceScanner() {
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [currentReaded, setCurrentReaded] = useState<Student | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

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
          try {
            const encryptedStudent = CryptoJS.AES.decrypt(
              codes[0].value,
              SECRET_KEY
            ).toString(CryptoJS.enc.Utf8);
            const studentData = JSON.parse(encryptedStudent) as Student;
            setCurrentReaded(studentData);
            setIsConfirmationDialogOpen(true);
          } catch (error) {
            console.error("Erro ao decifrar o código QR:", error);
          }
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
          {currentReaded && (
            <AttendanceConfirmationDialog
              student={currentReaded}
              open={isConfirmationDialogOpen}
              setOpen={setIsConfirmationDialogOpen}
            />
          )}
        </>
      ) : (
        <View>
          <Text>A permissão da câmera é necessária para usar o scanner.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
