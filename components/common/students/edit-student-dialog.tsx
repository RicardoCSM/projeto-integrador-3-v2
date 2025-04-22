import { useMutation, useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";
import { insertStudent, updateStudent } from "~/actions/students";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAuth } from "~/context/auth";
import { useStudents } from "~/store/useStudents";
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
import {
  EditStudentSchema,
  editStudentSchema,
} from "~/lib/validations/students";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "~/lib/icons/Pencil";
import { Form, FormField, FormInput } from "~/components/ui/form";
import { useState } from "react";
import { Student } from "~/types/student";

export default function EditStudentDialog({ student }: { student: Student }) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { students, setStudents } = useStudents();
  const form = useForm<EditStudentSchema>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      birth_date: student.birth_date || "",
      name: student.name || "",
    },
  });

  const { mutateAsync, status } = useMutation({
    mutationFn: async (studentSchema: EditStudentSchema) => {
      const range = `Turma1!C${student.position}:D${student.position}`;
      await updateStudent(
        user?.google_access_token || "",
        range,
        studentSchema
      );
    },
    onSuccess: () => {
      setStudents(
        students.map((s) =>
          s.id === student.id
            ? {
                ...s,
                birth_date: form.getValues("birth_date"),
                name: form.getValues("name"),
              }
            : s
        )
      );
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  function onSubmit(values: EditStudentSchema) {
    mutateAsync(values);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <View className="flex flex-row items-center">
            <Pencil
              height={16}
              width={16}
              className="mr-2 text-primary-foreground"
            />
            <Text>Editar</Text>
          </View>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar estudante {student.id}</DialogTitle>
          <DialogDescription>
            Preenche os campos abaixo para atualizar os dados do estudante.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <View className="gap-7">
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormInput
                  label="Data de nascimento"
                  placeholder="dd/mm/aaaa"
                  {...field}
                  onChangeText={(text) => {
                    const maskedText = text
                      .replace(/\D/g, "")
                      .replace(/(\d{2})(\d{2})(\d{4})?/, (match, p1, p2, p3) =>
                        p3 ? `${p1}/${p2}/${p3}` : `${p1}/${p2}`
                      )
                      .slice(0, 10);
                    field.onChange(maskedText);
                  }}
                  value={field.value}
                />
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormInput label="Nome completo" {...field} />
              )}
            />
          </View>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={status === "pending"}>
              <Text>Cancelar</Text>
            </Button>
          </DialogClose>
          <Button
            disabled={status === "pending"}
            onPress={form.handleSubmit(onSubmit)}
          >
            <View className="flex flex-row items-center">
              {status === "pending" && (
                <LoaderCircle className="mr-2 animate-spin text-destructive-foreground" />
              )}
              <Text>Atualizar</Text>
            </View>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
