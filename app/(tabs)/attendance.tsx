import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react-native";
import { View } from "react-native";
import { fetchAttendanceDates } from "~/actions/attendances";
import { Text } from "~/components/ui/text";
import { useAuth } from "~/context/auth";
import { useAttendances } from "~/store/useAttendances";
import { Redirect } from "expo-router";
import StartAttendanceForm from "~/components/common/attendances/start-attendance-form";
import { fetchClasses } from "~/actions/classes";

export default function Attendance() {
  const { user } = useAuth();
  const { attendanceDates, setAttendanceDates, selectedAttendanceDate } =
    useAttendances();
  const { isPending: isClassesPending, data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const classes = await fetchClasses(user?.google_access_token || "");

      return classes;
    },
  });
  const { isPending, error } = useQuery({
    queryKey: ["attendance-dates"],
    enabled: !isClassesPending && classes.length > 0,
    queryFn: async () => {
      const baseClass = classes[0];

      if (!baseClass) {
        throw new Error("No classes found");
      }

      const attendanceDates = await fetchAttendanceDates(
        user?.google_access_token || "",
        `${baseClass.name}!E2:EE4`
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
        <StartAttendanceForm
          classes={classes}
          attendanceDates={attendanceDates}
        />
      )}
    </>
  );
}
