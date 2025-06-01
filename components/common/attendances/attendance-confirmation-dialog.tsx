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
import { useMutation } from "@tanstack/react-query";
import { confirmStudentAttendance } from "~/actions/attendances";
import { useAttendances } from "~/store/useAttendances";
import { useAuth } from "~/context/auth";
import { Student } from "~/types/student";

export default function AttendanceConfirmationDialog({
  student,
  open,
  setOpen,
}: {
  student: Student;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { selectedAttendanceDate } = useAttendances();
  const { mutateAsync, status } = useMutation({
    mutationFn: async () => {
      if (!selectedAttendanceDate || !student) {
        throw new Error("Selected attendance date or student not found");
      }

      const range = `${student.class?.name}!${selectedAttendanceDate?.position}${student?.position}:${selectedAttendanceDate?.position}${student?.position}`;
      await confirmStudentAttendance(
        selectedAttendanceDate.bim,
        user?.google_access_token || "",
        range
      );
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
