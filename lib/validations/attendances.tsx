import { addDays, format } from "date-fns";
import * as z from "zod";

export const startAttendanceRecord = (validAttendanceDates: string[]) =>
  z.object({
    attendanceDate: z
      .string()
      .refine(
        (date) =>
          validAttendanceDates.includes(format(addDays(date, 1), "dd/MM/yyyy")),
        {
          message: "Data inválida para o bimestre",
        }
      ),
  });

export type StartAttendanceRecord = z.infer<
  ReturnType<typeof startAttendanceRecord>
>;
