import { format } from "date-fns";
import * as z from "zod";

export const startAttendanceRecord = (validAttendanceDates: string[]) =>
  z.object({
    attendanceDate: z
      .string()
      .refine(
        (date) => validAttendanceDates.includes(format(date, "dd/MM/yyyy")),
        {
          message: "Data inválida para o bimestre",
        }
      ),
  });

export type StartAttendanceRecord = z.infer<
  ReturnType<typeof startAttendanceRecord>
>;
