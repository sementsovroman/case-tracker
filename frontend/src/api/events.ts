import { CalendarEvent } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

export async function fetchEvents(fromISO: string, toISO: string): Promise<CalendarEvent[]> {
  const url = new URL(`${API_BASE}/events`);
  url.searchParams.set("from", fromISO);
  url.searchParams.set("to", toISO);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}

export async function createEvent(payload: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create event: ${res.status}`);
  return res.json();
}

export async function updateEvent(id: string, payload: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update event: ${res.status}`);
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/events/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete event: ${res.status}`);
}
