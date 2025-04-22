import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Student } from "~/types/student";
import DeleteStudentDialog from "./delete-student-dialog";
import EditStudentDialog from "./edit-student-dialog";

export default function StudentCard({ student }: { student: Student }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.name}</CardTitle>
        <CardDescription>
          {student.birth_date} - {student.id}
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-around">
        <DeleteStudentDialog student={student} />
        <EditStudentDialog student={student} />
      </CardFooter>
    </Card>
  );
}
