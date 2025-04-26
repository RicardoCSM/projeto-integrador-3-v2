import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useAttendances } from "~/store/useAttendances";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { ChevronLeft } from "~/lib/icons/ChevronLeft";
import { format, subMonths, addMonths, addDays } from "date-fns";
import { Button } from "~/components/ui/button";
import { AttendanceDate } from "~/types/attendance-date";
import { useColorScheme } from "~/lib/useColorScheme";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  startAttendanceRecord,
  StartAttendanceRecord,
} from "~/lib/validations/attendances";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

export default function StartAttendanceForm({
  attendanceDates,
}: {
  attendanceDates: AttendanceDate[];
}) {
  const { setSelectedAttendanceDate } = useAttendances();
  const today = toDateId(new Date());
  const [currentMonthId, setCurrentMonthId] = useState(today);
  const { isDarkColorScheme } = useColorScheme();
  const form = useForm<StartAttendanceRecord>({
    resolver: zodResolver(
      startAttendanceRecord(
        attendanceDates.map((attendanceDate) => attendanceDate.date)
      )
    ),
    defaultValues: {
      attendanceDate: format(today, "yyyy-MM-dd"),
    },
  });

  function onSubmit(values: StartAttendanceRecord) {
    if (!values.attendanceDate) return;
    const selectedDate = addDays(values.attendanceDate, 1);
    const selectedAttendanceDate = attendanceDates.find(
      (attendanceDate) =>
        attendanceDate.date === format(selectedDate, "dd/MM/yyyy")
    );
    if (!selectedAttendanceDate) return;
    setSelectedAttendanceDate(selectedAttendanceDate);
    router.push("/attendance-scanner");
  }

  return (
    <View className="flex-1 gap-6 py-4 px-2">
      <Text className="text-lg font-bold text-center">
        Selecione a data para iniciar a chamada
      </Text>
      <View className="relative flex-1">
        <Button
          className="absolute top-0 left-2 z-20"
          onPress={() =>
            setCurrentMonthId(
              format(subMonths(currentMonthId, 1), "yyyy-MM-dd")
            )
          }
          variant="ghost"
          size="icon"
        >
          <ChevronLeft className="size-4 text-primary" />
        </Button>
        <Button
          className="absolute top-0 right-2 z-20"
          onPress={() =>
            setCurrentMonthId(
              format(addMonths(currentMonthId, 1), "yyyy-MM-dd")
            )
          }
          variant="ghost"
          size="icon"
        >
          <ChevronRight className="size-4 text-primary" />
        </Button>
        <Calendar
          key={currentMonthId}
          calendarFormatLocale="pt-BR"
          calendarMonthId={currentMonthId}
          calendarActiveDateRanges={[
            {
              startId: form.watch("attendanceDate") || today,
              endId: form.watch("attendanceDate") || today,
            },
          ]}
          onCalendarDayPress={(date) => form.setValue("attendanceDate", date)}
          calendarColorScheme={isDarkColorScheme ? "dark" : "light"}
        />
        <Text className="text-sm font-medium text-destructive">
          {form.formState.errors.attendanceDate?.message}
        </Text>
      </View>
      <Button className="mt-auto" onPress={() => form.handleSubmit(onSubmit)()}>
        <Text>Confirmar</Text>
      </Button>
    </View>
  );
}
