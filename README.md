# Чат с консультантом

Мини-страница `/chat`: список встреч (SSR + TanStack Query) и echo-чат по WebSocket.

Стек: Next.js App Router, TypeScript, TanStack Query, Tailwind. 

## Запуск

Нужны Node.js и два терминала в корне проекта.

```bash
npm install
npm run dev
```

```bash
npm run ws
```

Открыть [http://localhost:3000](http://localhost:3000) — редирект на `/chat`.

Без `npm run ws` список встреч работает, чат показывает «Нет связи» и копит сообщения в очереди.

## Решения

**Граница Server / Client.**  
`app/chat/page.tsx` — Server Component: префетчит встречи, отдаёт HTML. Список виден при выключенном JS.  
Интерактив только в Client Components: `MeetingsList` (кнопка «Обновить») и `ChatPanel` (сокет).

Встречи на сервере берутся через `getMeetings()` из общего мока, не через `fetch('/api/meetings')`: у сервера нет относительного URL на себя, лишний HTTP не нужен. Тот же мок отдаёт `GET /api/meetings` — им пользуется только клиентский refetch.

Данные prefetch кладутся в одноразовый `QueryClient`, снимок уходит в `HydrationBoundary`. Браузерный клиент живёт в `Providers` (`getQueryClient()`: на сервере новый на запрос, в браузере один на вкладку).

**Чат**  `useChat` держит сокет, ленту и очередь. Сообщение сразу в UI (`pending` или `failed`, если нет связи). Echo через 300 мс — ответ консультанта; pending с тем же текстом (FIFO) становится `sent`. Обрыв: бейдж «Нет связи», pending → failed, текст не пропадает. Reconnect через 1 с, без reload; на `open` очередь уходит сама, точечно — «Повторить». 

