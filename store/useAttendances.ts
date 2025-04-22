import { create } from "zustand";
import { AttendanceDate } from "~/types/attendance-date";

export interface AttendanceDatesState {
  attendanceDates: AttendanceDate[];
  setAttendanceDates: (attendanceDates: AttendanceDate[]) => void;
  selectedAttendanceDate: AttendanceDate | null;
  setSelectedAttendanceDate: (attendanceDate: AttendanceDate | null) => void;
}

export const useAttendances = create<AttendanceDatesState>((set) => ({
  attendanceDates: [],
  setAttendanceDates: (attendanceDates) => set({ attendanceDates }),
  selectedAttendanceDate: null,
  setSelectedAttendanceDate: (attendanceDate) =>
    set({ selectedAttendanceDate: attendanceDate }),
}));
