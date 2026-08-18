"use client";

import { useEffect, useRef, useState } from "react";

export type ConnectionState = "connecting" | "open" | "closed";

export type ChatMessage = {
  id: string;
  role: "user" | "advisor";
  text: string;
  status: "pending" | "sent" | "failed";
};

const WS_URL = "ws://localhost:8081";
const RECONNECT_MS = 1000;

function isSocketOpen(ws: WebSocket | null): ws is WebSocket {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const connect = () => {
      if (cancelled) {
        return;
      }

      clearTimer();
      wsRef.current?.close();
      setConnection("connecting");

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled || wsRef.current !== ws) {
          return;
        }

        setConnection("open");

        const outgoing = messagesRef.current.filter(
          (message) =>
            message.role === "user" &&
            (message.status === "failed" || message.status === "pending"),
        );

        for (const message of outgoing) {
          ws.send(message.text);
        }

        if (outgoing.length > 0) {
          setMessages((prev) =>
            prev.map((message) =>
              message.role === "user" &&
              (message.status === "failed" || message.status === "pending")
                ? { ...message, status: "pending" }
                : message,
            ),
          );
        }
      };

      ws.onmessage = (event) => {
        if (cancelled || wsRef.current !== ws) {
          return;
        }

        const text =
          typeof event.data === "string" ? event.data : String(event.data);

        setMessages((prev) => {
          const pendingIndex = prev.findIndex(
            (message) =>
              message.role === "user" &&
              message.status === "pending" &&
              message.text === text,
          );
          const next = [...prev];

          if (pendingIndex !== -1) {
            next[pendingIndex] = { ...next[pendingIndex], status: "sent" };
          }

          next.push({
            id: crypto.randomUUID(),
            role: "advisor",
            text,
            status: "sent",
          });

          return next;
        });
      };

      ws.onclose = () => {
        if (cancelled || wsRef.current !== ws) {
          return;
        }

        setConnection("closed");
        setMessages((prev) =>
          prev.map((message) =>
            message.role === "user" && message.status === "pending"
              ? { ...message, status: "failed" }
              : message,
          ),
        );

        timer = setTimeout(connect, RECONNECT_MS);
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimer();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text) {
      return;
    }

    const ws = wsRef.current;
    const canSend = isSocketOpen(ws);
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      status: canSend ? "pending" : "failed",
    };

    setMessages((prev) => [...prev, message]);

    if (canSend) {
      ws.send(text);
    }
  }

  function retryMessage(id: string, text: string) {
    const ws = wsRef.current;
    if (!isSocketOpen(ws)) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "failed" } : item,
        ),
      );
      return;
    }

    setMessages((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "pending" } : item,
      ),
    );
    ws.send(text);
  }

  return {
    messages,
    connection,
    sendMessage,
    retryMessage,
  };
}
