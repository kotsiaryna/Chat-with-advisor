import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MeetingsList } from "@/components/meetings-list";
import { makeQueryClient } from "@/lib/get-query-client";
import { getMeetings } from "@/lib/meetings";
import { queryKeys } from "@/lib/query-keys";

export default async function ChatPage() {
  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.meetings,
    queryFn: getMeetings,
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Чат с консультантом
      </h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MeetingsList />
      </HydrationBoundary>
    </main>
  );
}
