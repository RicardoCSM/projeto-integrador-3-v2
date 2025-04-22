import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGoogleSheetsColumnByIndex(index: number) {
  const letters = [];
  let columnIndex = index + 1;

  while (columnIndex > 0) {
    const remainder = (columnIndex - 1) % 26;
    letters.unshift(String.fromCharCode(remainder + 65));
    columnIndex = Math.floor((columnIndex - remainder) / 26);
  }

  return letters.join("");
}
