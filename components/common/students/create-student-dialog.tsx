import { useMutation, useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";
import { insertStudent } from "~/actions/students";
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
  CreateStudentSchema,
  createStudentSchema,
} from "~/lib/validations/students";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "~/lib/icons/PlusCircle";
import { Form, FormField, FormInput } from "~/components/ui/form";
import { useState } from "react";

export default function CreateStudentDialog() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { students } = useStudents();
  const form = useForm<CreateStudentSchema>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      id: "",
      birth_date: "",
      name: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutateAsync, status } = useMutation({
    mutationFn: async (studentSchema: CreateStudentSchema) => {
      const maxPosition = students.reduce(
        (acc, student) => Math.max(acc, student.position),
        0
      );
      const range = `Turma1!B${maxPosition + 1}:D${maxPosition + 1}`;
      await insertStudent(
        user?.google_access_token || "",
        range,
        studentSchema
      );
    },
    onSuccess: () => {
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["students-list"],
      });
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  function onSubmit(values: CreateStudentSchema) {
    mutateAsync(values);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <View className="flex flex-row items-center">
            <PlusCircle
              height={16}
              width={16}
              className="mr-2 text-primary-foreground"
            />
            <Text>Inserir novo estudante</Text>
          </View>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inserir novo estudante</DialogTitle>
          <DialogDescription>
            Preenche os campos abaixo para inserir um novo estudante no sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <View className="gap-7">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormInput label="Número de matrícula" {...field} />
              )}
            />
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
              <Text>Inserir</Text>
            </View>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
