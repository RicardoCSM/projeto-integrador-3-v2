import { create } from "zustand";
import { AttendanceDate } from "~/types/attendance-date";

export interface AttendanceDatesState {
  attendanceDates: AttendanceDate[];
  setAttendanceDates: (attendanceDates: AttendanceDate[]) => void;
  selectedAttendanceDate: AttendanceDate | null;
  setSelectedAttendanceDate: (attendanceDate: AttendanceDate | null) => void;
}

/**
 * Hook para gerenciar o estado das datas de presença.
 * Utiliza Zustand para criar um store que armazena as datas de presença e a data de presença selecionada.
 * @returns Um objeto com as datas de presença, a função para definir as datas e a data de presença selecionada.
 */
export const useAttendances = create<AttendanceDatesState>((set) => ({
  attendanceDates: [],
  setAttendanceDates: (attendanceDates) => set({ attendanceDates }),
  selectedAttendanceDate: null,
  setSelectedAttendanceDate: (attendanceDate) =>
    set({ selectedAttendanceDate: attendanceDate }),
}));
