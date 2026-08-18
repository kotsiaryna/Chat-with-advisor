"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMeetings,
  formatMeetingDate,
  type MeetingStatus,
} from "@/lib/meetings";
import { queryKeys } from "@/lib/query-keys";

const statusLabel: Record<MeetingStatus, string> = {
  upcoming: "Предстоит",
  completed: "Завершена",
  cancelled: "Отменена",
};

const statusClass: Record<MeetingStatus, string> = {
  upcoming: "bg-sky-50 text-sky-800",
  completed: "bg-zinc-100 text-zinc-700",
  cancelled: "bg-red-50 text-red-700",
};

export function MeetingsList() {
  const queryClient = useQueryClient();
  const { data, isError, isFetching } = useQuery({
    queryKey: queryKeys.meetings,
    queryFn: fetchMeetings,
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Встречи</h2>
        <button
          type="button"
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60"
          disabled={isFetching}
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: queryKeys.meetings })
          }
        >
          {isFetching ? "Обновление…" : "Обновить"}
        </button>
      </div>

      {isError ? (
        <p className="text-sm text-red-700">Не удалось загрузить встречи.</p>
      ) : data?.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-600">
          Встреч пока нет.
        </p>
      ) : data ? (
        <ul className="flex flex-col gap-3">
          {data.map((meeting) => (
            <li
              key={meeting.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{meeting.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {formatMeetingDate(meeting.date)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${statusClass[meeting.status]}`}
                >
                  {statusLabel[meeting.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
