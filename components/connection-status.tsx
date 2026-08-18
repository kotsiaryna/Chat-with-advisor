import type { ConnectionState } from "@/lib/use-chat";

const labels: Record<ConnectionState, string> = {
  open: "На связи",
  connecting: "Подключение…",
  closed: "Нет связи",
};

const tones: Record<ConnectionState, string> = {
  open: "bg-emerald-50 text-emerald-800",
  connecting: "bg-amber-50 text-amber-800",
  closed: "bg-red-50 text-red-700",
};

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${tones[state]}`}
    >
      {labels[state]}
    </span>
  );
}
