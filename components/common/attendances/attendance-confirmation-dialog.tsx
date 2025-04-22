import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useStudents } from "~/store/useStudents";
import { useMutation } from "@tanstack/react-query";
import { confirmStudentAttendance } from "~/actions/attendances";
import { useAttendances } from "~/store/useAttendances";
import { useAuth } from "~/context/auth";

export default function AttendanceConfirmationDialog({
  studentId,
  open,
  setOpen,
}: {
  studentId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { selectedAttendanceDate } = useAttendances();
  const { students } = useStudents();
  const student = students.find((student) => student.id === studentId);
  const { mutateAsync, status } = useMutation({
    mutationFn: async () => {
      const range = `Turma1!${selectedAttendanceDate?.position}${student?.position}:${selectedAttendanceDate?.position}${student?.position}`;
      await confirmStudentAttendance(user?.google_access_token || "", range);
    },
    onSuccess: () => {
      setOpen(false);
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  const handleConfirmation = () => {
    mutateAsync();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Seja bem-vindo(a) de volta!</DialogTitle>
          <DialogDescription>
            Olá {student?.name}, você está prestes a confirmar sua presença na
            aula de hoje. Por favor, verifique se todas as informações estão
            corretas antes de prosseguir.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={status === "pending"}>
              <Text>Cancelar</Text>
            </Button>
          </DialogClose>
          <Button onPress={handleConfirmation} disabled={status === "pending"}>
            <Text>Confirmar presença</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
