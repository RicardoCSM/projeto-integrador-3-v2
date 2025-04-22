import axios from "axios";
import { getGoogleSheetsColumnByIndex } from "~/lib/utils";
import { AttendanceDate } from "~/types/attendance-date";

export async function fetchAttendanceDates(
  token: string,
  range: string
): Promise<AttendanceDate[]> {
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

    if (!data.values || data.values[0].length === 0) {
      return [];
    }

    const attendanceDates = data.values[0].map((date: string, index) => {
      if (!date) {
        return null;
      }

      return {
        date: date,
        position: getGoogleSheetsColumnByIndex(index + 4),
      };
    }) as AttendanceDate[];

    return attendanceDates;
  } catch (error: any) {
    console.error(error?.message);
    return [];
  }
}

export async function confirmStudentAttendance(
  token: string,
  range: string
): Promise<void> {
  try {
    const SHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID;
    await axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        values: [["P"]],
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
