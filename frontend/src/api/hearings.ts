import { Hearing } from "../types";
import { buildUrl } from "./base";

export async function fetchHearings(fromISO: string, toISO: string): Promise<Hearing[]> {
  const params = new URLSearchParams({ from: fromISO, to: toISO });
  const res = await fetch(`${buildUrl("/hearings")}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch hearings: ${res.status}`);
  return res.json();
}

export async function createHearing(payload: Omit<Hearing, "id">): Promise<Hearing> {
  const res = await fetch(buildUrl("/hearings"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create hearing: ${res.status}`);
  return res.json();
}

export async function updateHearing(id: string, payload: Omit<Hearing, "id">): Promise<Hearing> {
  const res = await fetch(buildUrl(`/hearings/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update hearing: ${res.status}`);
  return res.json();
}

export async function deleteHearing(id: string): Promise<void> {
  const res = await fetch(buildUrl(`/hearings/${id}`), { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete hearing: ${res.status}`);
}
