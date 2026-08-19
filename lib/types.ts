export type ClassId = "2-1" | "2-2" | "2-3" | "2-4" | "2-5";

export const CLASSES: ClassId[] = ["2-1", "2-2", "2-3", "2-4", "2-5"];

export interface StudentData {
  attendanceNumber: string;
  times: number[];
  totalMinutes: number;
  submitCount: number;
  lastSubmittedAt: string | null;
  updatedAt: string;
}

export interface ClassStats {
  classId: ClassId;
  students: StudentData[];
}

export interface SubmitResponse {
  success: boolean;
  totalMinutes: number;
  submitCount: number;
  error?: string;
}
