import axios from "axios";
import {
  CreateStudentSchema,
  EditStudentSchema,
} from "~/lib/validations/students";
import { Class } from "~/types/class";
import { Student } from "~/types/student";

const SHEET_IDS = [
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM1,
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM2,
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM3,
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM4,
];

export async function fetchStudents(
  token: string,
  classItem: Class,
  range: string
): Promise<Student[]> {
  try {
    const SHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM1;
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
          class: classItem,
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
  const headers = { Authorization: `Bearer ${token}` };

  const requests = SHEET_IDS.map((sheetId) => {
    return axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        values: [[data.id, data.birth_date, data.name]],
      },
      { headers }
    );
  });

  try {
    await Promise.all(requests);
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function updateStudent(
  token: string,
  range: string,
  data: EditStudentSchema
): Promise<void> {
  const headers = { Authorization: `Bearer ${token}` };

  const requests = SHEET_IDS.map((sheetId) => {
    return axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        values: [[...Object.values(data)]],
      },
      { headers }
    );
  });

  try {
    await Promise.all(requests);
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function deleteStudent(
  token: string,
  range: string
): Promise<void> {
  const headers = { Authorization: `Bearer ${token}` };

  const requests = SHEET_IDS.map((sheetId) => {
    return axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchClear`,
      {
        ranges: [range],
      },
      { headers }
    );
  });

  try {
    await Promise.all(requests);
  } catch (error: any) {
    throw new Error(error?.message);
  }
}
