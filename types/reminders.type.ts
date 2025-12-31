export interface Reminder {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  month: number;
  day: number;
  year: number;
  email: string;
  created_at: string;
  activity: string;
  startTime: string;
  status: "pending" | "shift" | "done";
}