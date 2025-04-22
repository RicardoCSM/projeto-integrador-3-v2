import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react-native";
import { View } from "react-native";
import { fetchAttendanceDates } from "~/actions/attendances";
import { Text } from "~/components/ui/text";
import { useAuth } from "~/context/auth";
import { useAttendances } from "~/store/useAttendances";
import { Redirect } from "expo-router";
import StartAttendanceForm from "~/components/common/attendances/start-attendance-form";

const RANGE = "Turma1!E2:BB2";

export default function Attendance() {
  const { user } = useAuth();
  const { attendanceDates, setAttendanceDates, selectedAttendanceDate } =
    useAttendances();
  const { isPending, error } = useQuery({
    queryKey: ["attendance-dates"],
    queryFn: async () => {
      const attendanceDates = await fetchAttendanceDates(
        user?.google_access_token || "",
        RANGE
      );
      setAttendanceDates(attendanceDates);

      return attendanceDates;
    },
  });

  if (isPending)
    return (
      <View className="flex-1 items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-primary" />
      </View>
    );

  if (error) return <Text>An error has occurred: {error.message}</Text>;

  return (
    <>
      {selectedAttendanceDate ? (
        <Redirect href="/attendance-scanner" />
      ) : (
        <StartAttendanceForm attendanceDates={attendanceDates} />
      )}
    </>
  );
}
