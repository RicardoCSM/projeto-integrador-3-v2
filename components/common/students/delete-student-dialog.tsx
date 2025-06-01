import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";
import { deleteStudent } from "~/actions/students";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAuth } from "~/context/auth";
import { useStudents } from "~/store/useStudents";
import { Student } from "~/types/student";
import { Trash } from "~/lib/icons/Trash";
import { LoaderCircle } from "~/lib/icons/LoaderCircle";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export default function DeleteStudentDialog({ student }: { student: Student }) {
  const { user } = useAuth();
  const { removeStudent } = useStudents();
  const { mutateAsync, status } = useMutation({
    mutationFn: async () => {
      const range = `${student.class?.name}!${student.position}:${student.position}`;
      await deleteStudent(user?.google_access_token || "", range);
    },
    onSuccess: () => {
      removeStudent(student);
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  const handleDelete = () => {
    mutateAsync();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={status === "pending"}>
          <View className="flex flex-row items-center">
            <Trash
              height={16}
              width={16}
              className="mr-2 text-destructive-foreground"
            />
            <Text>Deletar</Text>
          </View>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Você tem certeza?</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser desfeita. Você tem certeza que deseja deletar
            o estudante {student.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={status === "pending"}>
              <Text>Cancelar</Text>
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={status === "pending"}
            onPress={handleDelete}
          >
            <View className="flex flex-row items-center">
              {status === "pending" && (
                <LoaderCircle className="mr-2 animate-spin text-destructive-foreground" />
              )}
              <Text>Deletar</Text>
            </View>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
