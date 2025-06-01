import axios from "axios";
import { Class } from "~/types/class";

export async function fetchClasses(token: string): Promise<Class[]> {
  try {
    const SHEET_ID = process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM1;
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const sheets: {
      properties: {
        title: string;
      };
    }[] = response.data.sheets;

    const classes = sheets.slice(0, -1).map((sheet) => sheet.properties.title);

    return classes.map((name, index) => ({
      index,
      name,
    }));
  } catch (error: any) {
    console.error(error?.message);
    return [];
  }
}
