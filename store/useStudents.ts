import { create } from "zustand";
import { Student } from "~/types/student";

export interface StudentsState {
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  removeStudent: (student: Student) => void;
}

export const useStudents = create<StudentsState>((set) => ({
  students: [],
  setStudents: (students) => set({ students }),
  addStudent: (student) =>
    set((state) => ({ students: [...state.students, student] })),
  removeStudent: (student) =>
    set((state) => ({
      students: state.students.filter((s) => s.id !== student.id),
    })),
}));
