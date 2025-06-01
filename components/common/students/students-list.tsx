import { useQuery } from "@tanstack/react-query";
import { Platform, useWindowDimensions, View } from "react-native";
import { fetchStudents } from "~/actions/students";
import { FlashList } from "@shopify/flash-list";
import { Student } from "~/types/student";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useStudents } from "~/store/useStudents";
import { useAuth } from "~/context/auth";
import { Text } from "~/components/ui/text";
import StudentCard from "./student-card";
import CreateStudentDialog from "./create-student-dialog";
import { useEffect, useState } from "react";
import { fetchClasses } from "~/actions/classes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { LoaderCircle } from "~/lib/icons/LoaderCircle";
import { ScrollView } from "react-native-gesture-handler";
import { Class } from "~/types/class";

export default function StudentsList() {
  const { user } = useAuth();
  const { students, setStudents } = useStudents();
  const [selectedClass, setSelectedClass] = useState<Class | undefined>();
  const { isPending: isClassesPending, data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const classes = await fetchClasses(user?.google_access_token || "");

      return classes;
    },
  });

  const { isFetching, error, data } = useQuery({
    queryKey: ["students-list", selectedClass],
    enabled: !isClassesPending && !!selectedClass,
    queryFn: async () => {
      if (!selectedClass) {
        throw new Error("No class selected");
      }

      const students = await fetchStudents(
        user?.google_access_token || "",
        selectedClass,
        `${selectedClass.name}!A4:D100`
      );
      return students;
    },
  });

  useEffect(() => {
    if (data) {
      setStudents(data);
    }
  }, [data, setStudents]);

  if (error) return <Text>An error has occurred: {error.message}</Text>;

  return (
    <View className="flex-1 py-4 px-2">
      <ClassesSelect classes={classes} setSelectedClass={setSelectedClass} />
      {!isFetching ? (
        <>
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
          {selectedClass && <CreateStudentDialog classItem={selectedClass} />}
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
          <LoaderCircle className="size-6 animate-spin text-background" />
        </View>
      )}
    </View>
  );
}

function ClassesSelect({
  classes,
  setSelectedClass,
}: {
  classes: Class[];
  setSelectedClass: (className: Class) => void;
}) {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      android: insets.bottom + 24,
      default: insets.bottom,
    }),
    left: 12,
    right: 12,
  };

  return (
    <Select>
      <SelectTrigger className="w-full bg-eeaa">
        <SelectValue
          className="text-white text-sm native:text-lg"
          placeholder="Selecione uma turma"
        />
      </SelectTrigger>
      <SelectContent insets={contentInsets} className="w-full">
        <ScrollView className="max-h-64">
          <SelectGroup>
            <SelectLabel>Turmas</SelectLabel>
            {classes.map((classItem) => (
              <SelectItem
                key={classItem.index}
                value={classItem.name}
                label={classItem.name}
                onPress={() => {
                  setSelectedClass(classItem);
                }}
              >
                {classItem.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </ScrollView>
      </SelectContent>
    </Select>
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
