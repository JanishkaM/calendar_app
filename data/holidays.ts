export interface Holiday {
  month: number; // 1 = January, 12 = December
  date: number;  // Day of month
  day: string;
  name: string;
  description: string;
  publicHoliday: boolean;
  bankHoliday: boolean;
  mercantileHoliday: boolean;
}

export const holidays: Holiday[] = [
  {
    month: 1,
    date: 3,
    day: "Saturday",
    name: "Duruthu Full Moon Poya Day",
    description: "Commemorates the Buddha’s first visit to Sri Lanka.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 1,
    date: 15,
    day: "Thursday",
    name: "Tamil Thai Pongal Day",
    description: "Hindu harvest festival thanking the Sun God.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  },
  {
    month: 2,
    date: 1,
    day: "Sunday",
    name: "Nawam Full Moon Poya Day",
    description: "Marks key events in early Buddhist history.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 2,
    date: 4,
    day: "Wednesday",
    name: "Independence Day",
    description: "Celebrates Sri Lanka’s independence in 1948.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  },
  {
    month: 2,
    date: 15,
    day: "Sunday",
    name: "Maha Sivarathri Day",
    description: "Hindu religious observance dedicated to Lord Shiva.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 3,
    date: 2,
    day: "Monday",
    name: "Medin Full Moon Poya Day",
    description: "Commemorates the Buddha’s visit to his family.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 3,
    date: 21,
    day: "Saturday",
    name: "Id-Ul-Fitr",
    description: "Islamic festival marking the end of Ramadan.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 4,
    date: 1,
    day: "Wednesday",
    name: "Bak Full Moon Poya Day",
    description: "Associated with the Buddha’s second visit to Sri Lanka.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 4,
    date: 3,
    day: "Friday",
    name: "Good Friday",
    description: "Christian observance of the crucifixion of Jesus Christ.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 4,
    date: 13,
    day: "Monday",
    name: "Day Prior to Sinhala and Tamil New Year",
    description: "Traditional preparation day before the New Year.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  },
  {
    month: 4,
    date: 14,
    day: "Tuesday",
    name: "Sinhala and Tamil New Year Day",
    description: "Traditional New Year celebrated by Sinhala and Tamil communities.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  },
  {
    month: 5,
    date: 1,
    day: "Friday",
    name: "Vesak Full Moon Poya Day",
    description: "Celebrates the birth, enlightenment, and passing of the Buddha.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 5,
    date: 1,
    day: "Friday",
    name: "May Day",
    description: "International Workers’ Day recognizing labor rights.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  },
  {
    month: 5,
    date: 2,
    day: "Saturday",
    name: "Day Following Vesak Full Moon Poya Day",
    description: "Continuation of Vesak religious observances.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  },
  {
    month: 5,
    date: 28,
    day: "Thursday",
    name: "Id-Ul-Alha",
    description: "Islamic festival honoring devotion and sacrifice.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 5,
    date: 30,
    day: "Saturday",
    name: "Adhi Poson Full Moon Poya Day",
    description: "Special Poson observance highlighting Buddhist heritage.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 6,
    date: 29,
    day: "Monday",
    name: "Poson Full Moon Poya Day",
    description: "Commemorates the introduction of Buddhism to Sri Lanka.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 7,
    date: 29,
    day: "Wednesday",
    name: "Esala Full Moon Poya Day",
    description: "Marks the Buddha’s first sermon.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 8,
    date: 26,
    day: "Wednesday",
    name: "Milad-Un-Nabi",
    description: "Celebrates the birth of Prophet Muhammad.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  },
  {
    month: 8,
    date: 27,
    day: "Thursday",
    name: "Nikini Full Moon Poya Day",
    description: "Associated with the establishment of the Bhikkhuni order.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 9,
    date: 26,
    day: "Saturday",
    name: "Binara Full Moon Poya Day",
    description: "Highlights the role of Buddhist nuns.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 10,
    date: 25,
    day: "Sunday",
    name: "Vap Full Moon Poya Day",
    description: "Marks the Buddha’s return from heavenly realms.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 11,
    date: 8,
    day: "Sunday",
    name: "Deepavali",
    description: "Hindu festival of lights symbolizing victory of good over evil.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 11,
    date: 24,
    day: "Tuesday",
    name: "Il Full Moon Poya Day",
    description: "Associated with spreading Buddhism beyond Sri Lanka.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 12,
    date: 23,
    day: "Wednesday",
    name: "Unduvap Full Moon Poya Day",
    description: "Commemorates the arrival of the Sacred Bo Sapling.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: false
  },
  {
    month: 12,
    date: 25,
    day: "Friday",
    name: "Christmas Day",
    description: "Christian festival celebrating the birth of Jesus Christ.",
    publicHoliday: true,
    bankHoliday: true,
    mercantileHoliday: true
  }
];
