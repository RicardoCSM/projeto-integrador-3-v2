import axios from "axios";
import { getGoogleSheetsColumnByIndex } from "~/lib/utils";
import { AttendanceDate } from "~/types/attendance-date";
import { Class } from "~/types/class";

const SHEET_IDS = {
  "1": process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM1,
  "2": process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM2,
  "3": process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM3,
  "4": process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM4,
};

export async function fetchAttendanceDates(
  token: string,
  range: string
): Promise<AttendanceDate[]> {
  const headers = { Authorization: `Bearer ${token}` };

  const results = await Promise.all(
    Object.entries(SHEET_IDS).map(async ([bimKey, sheetId]) => {
      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
          { headers }
        );

        const data: {
          majorDimension: string;
          range: string;
          values: string[][];
        } = response.data;

        if (
          !data.values ||
          data.values[0].length === 0 ||
          data.values[2].length === 0
        ) {
          return [];
        }

        const attendanceDates = data.values[0]
          .slice(0, -2)
          .map((date: string, index) => {
            if (!date) return null;

            const hasAttendanceList = data.values[2][index] !== "0";

            return {
              date,
              position: getGoogleSheetsColumnByIndex(index + 4),
              hasAttendanceList,
              bim: bimKey as "1" | "2" | "3" | "4",
            };
          })
          .filter(Boolean) as AttendanceDate[];

        return attendanceDates;
      } catch (error: any) {
        console.error(`Erro no ${bimKey}:`, error?.message);
        return [];
      }
    })
  );

  return results.flat();
}

export async function startAttendanceDateList(
  token: string,
  classes: Class[],
  attendanceDate: AttendanceDate
) {
  const SHEET_ID = SHEET_IDS[attendanceDate.bim];
  if (!SHEET_ID) {
    throw new Error("Invalid bim key");
  }

  await Promise.all(
    classes.map(async (classItem) => {
      const range = `${classItem.name}!${attendanceDate.position}4:${attendanceDate.position}100`;

      try {
        const numRows = 97;
        const values = Array.from({ length: numRows }, () => ["F"]);

        await axios.put(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`,
          {
            values,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error: any) {
        console.error(
          `Erro ao iniciar lista de chamada para ${classItem.name}:`,
          error?.message
        );
      }
    })
  );
}

export async function confirmStudentAttendance(
  bim: "1" | "2" | "3" | "4",
  token: string,
  range: string
): Promise<void> {
  try {
    const SHEET_ID = SHEET_IDS[bim];
    if (!SHEET_ID) {
      throw new Error("Invalid bim key");
    }

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
