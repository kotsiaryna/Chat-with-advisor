export type MeetingStatus = "upcoming" | "completed" | "cancelled";

export type Meeting = {
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
};

const meetings: Meeting[] = [
  {
    id: "1",
    title: "Консультация по ипотеке",
    date: "2026-08-18",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Разбор инвестиционного портфеля",
    date: "2026-08-21",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Налоговый вычет",
    date: "2026-08-10",
    status: "completed",
  },
  {
    id: "4",
    title: "Страхование жизни",
    date: "2026-08-05",
    status: "cancelled",
  },
];

export function getMeetings(): Meeting[] {
  return meetings;
}

export async function fetchMeetings(): Promise<Meeting[]> {
  const response = await fetch("/api/meetings");

  if (!response.ok) {
    throw new Error("Не удалось загрузить встречи");
  }

  return response.json();
}

export function formatMeetingDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}
