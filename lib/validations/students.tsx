import * as z from "zod";

export const createStudentSchema = z.object({
  id: z.string().min(1, "O número de matrícula é obrigatório"),
  birth_date: z.string().min(1, "A data de nascimento é obrigatória"),
  name: z.string().min(1, "O nome é obrigatório"),
});

export const editStudentSchema = z.object({
  birth_date: z.string().min(1, "A data de nascimento é obrigatória"),
  name: z.string().min(1, "O nome é obrigatório"),
});

export type CreateStudentSchema = z.infer<typeof createStudentSchema>;
export type EditStudentSchema = z.infer<typeof editStudentSchema>;
