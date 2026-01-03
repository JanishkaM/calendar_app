export interface Activity {
  id: number;
  value: string;
  name: string;
}

export const activities: Activity[] = [
  { id: 1, value: "work", name: "Work" },
  { id: 2, value: "exercise", name: "Exercise" },
  { id: 3, value: "leisure", name: "Leisure" }, // Merged Relaxing into Leisure
  { id: 4, value: "shopping", name: "Shopping" },
  { id: 5, value: "social", name: "Social" },
  { id: 6, value: "wakeup", name: "Wake Up" },
  { id: 7, value: "meal", name: "Meal" },
  { id: 8, value: "meeting", name: "Meeting" },
  { id: 9, value: "appointment", name: "Appointment" },
  { id: 10, value: "call", name: "Call" },
  { id: 11, value: "email", name: "Email" },
  { id: 12, value: "learning", name: "Learning" },
  { id: 13, value: "sleeping", name: "Sleeping" },
  { id: 14, value: "maintenance", name: "Maintenance" },
  { id: 15, value: "medicine", name: "Medicine" },
  { id: 16, value: "others", name: "Others" },
];