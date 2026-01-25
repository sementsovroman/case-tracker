import { CalendarEvent } from "../types";

function getApiBase() {
  const raw = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";
  return raw.replace(/\/$/, "");
}

function buildUrl(path: string) {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}

export async function fetchEvents(fromISO: string, toISO: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({ from: fromISO, to: toISO });
  const res = await fetch(`${buildUrl("/events")}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}

export async function createEvent(payload: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  const res = await fetch(buildUrl("/events"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create event: ${res.status}`);
  return res.json();
}

export async function updateEvent(id: string, payload: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  const res = await fetch(buildUrl(`/events/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update event: ${res.status}`);
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(buildUrl(`/events/${id}`), { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete event: ${res.status}`);
}
