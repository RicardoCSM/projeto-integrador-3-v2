import axios from "axios";
import {
  CreateStudentSchema,
  EditStudentSchema,
} from "~/lib/validations/students";
import { Class } from "~/types/class";
import { Student } from "~/types/student";

/*
 * Ids das planilhas do Google Sheets onde os alunos são armazenados.
 */
const SHEET_IDS = [
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM1,
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM2,
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM3,
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID_BIM4,
];

/**
 * Função para buscar alunos de uma turma específica em uma planilha do Google Sheets.
 * @param token - Token de autenticação para acessar a API do Google Sheets.
 * @param classItem - Objeto representando a turma.
 * @param range - Intervalo da planilha onde os dados dos alunos estão localizados.
 * @returns Uma lista de objetos `Student` representando os alunos encontrados.
 */
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

/**
 * Função para inserir um novo aluno em uma planilha do Google Sheets.
 * @param token - Token de autenticação para acessar a API do Google Sheets.
 * @param range - Intervalo da planilha onde os dados dos alunos serão inseridos.
 * @param data - Objeto representando os dados do aluno a ser inserido.
 * @returns Uma Promise que resolve quando o aluno for inserido com sucesso.
 */
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

/*
 * Função para atualizar os dados de um aluno em uma planilha do Google Sheets.
 * @param token - Token de autenticação para acessar a API do Google Sheets.
 * @param range - Intervalo da planilha onde os dados do aluno serão atualizados.
 * @param data - Objeto representando os novos dados do aluno.
 * @returns Uma Promise que resolve quando os dados do aluno forem atualizados com sucesso.
 */
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

/**
 * Função para deletar um aluno de uma planilha do Google Sheets.
 * @param token - Token de autenticação para acessar a API do Google Sheets.
 * @param range - Intervalo da planilha onde os dados do aluno serão removidos.
 * @returns Uma Promise que resolve quando o aluno for removido com sucesso.
 */
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
