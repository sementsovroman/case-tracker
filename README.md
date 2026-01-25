# Calendar Organizer Prototype (FullCalendar + React + Fastify)

Прототип календаря-органайзера: режимы **Day / Week / Month**, создание/редактирование/удаление событий, хранение на сервере.

## Стек
- Frontend: React + TypeScript + Vite + FullCalendar
- Backend: Node.js + TypeScript + Fastify + Prisma + SQLite
- API: REST

## Быстрый старт (macOS / Linux / Windows)
Требования: Node.js 18+ и npm.

### 1) Установка зависимостей
Из корня проекта:
```bash
npm i
```

### 2) Поднять backend (БД SQLite создастся автоматически)
```bash
npm run prisma:migrate --workspace backend
npm run dev:backend
```
Backend: http://localhost:3001

### 3) Поднять frontend
В новом терминале:
```bash
npm run dev:frontend
```
Frontend: http://localhost:5173

> В dev режиме Vite проксирует `/events` и `/health` на backend.
> Опционально можно указать API base:
> `frontend/.env` → `VITE_API_BASE=http://localhost:3001`

### 4) Запуск в одном терминале (опционально)
```bash
npm run dev
```

## API (кратко)
- `GET /events?from=ISO&to=ISO` — события, пересекающие диапазон
- `POST /events` — создать
- `GET /events/:id` — получить по id
- `PUT /events/:id` — обновить
- `DELETE /events/:id` — удалить

## Замечания про время/таймзоны
UI использует `datetime-local` (локальное время), на сервер отправляется ISO (UTC).
Для закрытого прототипа это обычно нормально. Для продукта можно добавить поддержку таймзон и хранение в UTC + отображение по TZ пользователя.

## Roadmap (идеи на будущее)
- Авторизация/права доступа
- Теги/категории, фильтры
- Повторяющиеся события (RRULE)
- Поиск по событиям
- Экспорт/импорт (ICS)
- Коллаборация/комментарии
