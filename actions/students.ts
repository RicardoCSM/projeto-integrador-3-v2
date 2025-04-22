import axios from "axios";
import {
  CreateStudentSchema,
  EditStudentSchema,
} from "~/lib/validations/students";
import { Student } from "~/types/student";

export async function fetchStudents(
  token: string,
  range: string
): Promise<Student[]> {
  try {
    const SHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID;
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: {
      majorDimension: string;
      range: string;
      values: string[][];
    } = response.data;

    const students = data.values
      .map((student: string[], index) => {
        if (!student[1] || !student[2] || !student[3]) {
          return null;
        }
        return {
          id: student[1],
          birth_date: student[2],
          name: student[3],
          position: index + 4,
        };
      })
      .filter((student) => student !== null) as Student[];

    return students;
  } catch (error: any) {
    console.error(error?.message);
    return [];
  }
}

export async function insertStudent(
  token: string,
  range: string,
  data: CreateStudentSchema
): Promise<void> {
  try {
    const SHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID;
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        values: [[data.id, data.birth_date, data.name]],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function updateStudent(
  token: string,
  range: string,
  data: EditStudentSchema
): Promise<void> {
  try {
    const SHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID;
    await axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        values: [[...Object.values(data)]],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function deleteStudent(
  token: string,
  range: string
): Promise<void> {
  try {
    const SHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID;
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchClear`,
      {
        ranges: [range],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    throw new Error(error?.message);
  }
}
