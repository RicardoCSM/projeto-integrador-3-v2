import { useQuery } from "@tanstack/react-query";
import { useWindowDimensions, View } from "react-native";
import { fetchStudents } from "~/actions/students";
import { FlashList } from "@shopify/flash-list";
import { Student } from "~/types/student";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useStudents } from "~/store/useStudents";
import { useAuth } from "~/context/auth";
import { Text } from "~/components/ui/text";
import StudentCard from "./student-card";
import { LoaderCircle } from "~/lib/icons/LoaderCircle";
import CreateStudentDialog from "./create-student-dialog";

const RANGE = "Turma1!A4:D100";

export default function StudentsList() {
  const { user } = useAuth();
  const { students, setStudents } = useStudents();
  const { isPending, error } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const students = await fetchStudents(
        user?.google_access_token || "",
        RANGE
      );
      setStudents(students);

      return students;
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
    <View className="flex-1 py-4 px-2">
      <FlashList
        key={students.length}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        data={students}
        estimatedItemSize={200}
        removeClippedSubviews={false}
        keyExtractor={keyExtractor}
        contentContainerClassName="px-2 py-2"
        ItemSeparatorComponent={renderItemSeparator}
        renderItem={renderStudent}
        ListEmptyComponent={
          students.length === 0 ? ListEmptyComponent : undefined
        }
      />
      <CreateStudentDialog />
    </View>
  );
}

function ListEmptyComponent() {
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const height = dimensions.height - headerHeight - insets.bottom - insets.top;

  return (
    <View
      style={{ height }}
      className="flex-1 items-center justify-center gap-1 px-12"
    >
      <Text className="pb-1 text-center font-semibold">
        Nenhum estudante encontrado
      </Text>
    </View>
  );
}

function keyExtractor(student: Student) {
  return student.id;
}

function renderItemSeparator() {
  return <View className="p-2" />;
}

function renderStudent({ item }: { item: Student }) {
  return <StudentCard student={item} />;
}
