"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ConnectionStatus } from "@/components/connection-status";
import { useChat } from "@/lib/use-chat";

export function ChatPanel() {
  const { messages, connection, sendMessage, retryMessage } = useChat();
  const [text, setText] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) {
      return;
    }
    feed.scrollTop = feed.scrollHeight;
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(text);
    setText("");
  }

  return (
    <section className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <h2 className="text-lg font-medium">Консультант</h2>
        <ConnectionStatus state={connection} />
      </header>

      <div ref={feedRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-zinc-500">
            Напишите сообщение — консультант повторит его с небольшой задержкой.
          </p>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    isUser
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-900"
                  }`}
                >
                  {message.text}
                </div>
                {isUser && message.status === "failed" ? (
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <span>Не отправлено</span>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => retryMessage(message.id, message.text)}
                    >
                      Повторить
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <form
        className="flex gap-2 border-t border-zinc-200 p-3"
        onSubmit={handleSubmit}
      >
        <input
          className="min-w-0 flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
          value={text}
          placeholder="Сообщение"
          onChange={(event) => setText(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-40"
          disabled={text.trim().length === 0}
        >
          Отправить
        </button>
      </form>
    </section>
  );
}
