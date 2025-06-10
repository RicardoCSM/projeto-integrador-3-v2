import { create } from "zustand";
import { Student } from "~/types/student";

export interface StudentsState {
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  removeStudent: (student: Student) => void;
}

/**
 * Hook para gerenciar o estado dos alunos.
 * Utiliza Zustand para criar um store que armazena os alunos e fornece funções para manipular a lista de alunos.
 * @returns Um objeto com a lista de alunos, a função para definir os alunos, adicionar um aluno e remover um aluno.
 */
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
