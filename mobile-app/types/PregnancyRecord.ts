export interface PregnancyRecord {
  id: number;
  week: number;
  weight: number | null;
  symptoms: string | null;
  notes: string | null;
}