import { Case } from "../types";
import { buildUrl } from "./base";

export async function fetchCases(): Promise<Case[]> {
  const res = await fetch(buildUrl("/cases"));
  if (!res.ok) throw new Error(`Failed to fetch cases: ${res.status}`);
  return res.json();
}

export async function createCase(payload: Omit<Case, "id">): Promise<Case> {
  const res = await fetch(buildUrl("/cases"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create case: ${res.status}`);
  return res.json();
}

export async function updateCase(id: string, payload: Omit<Case, "id">): Promise<Case> {
  const res = await fetch(buildUrl(`/cases/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update case: ${res.status}`);
  return res.json();
}

export async function deleteCase(id: string): Promise<void> {
  const res = await fetch(buildUrl(`/cases/${id}`), { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete case: ${res.status}`);
}
