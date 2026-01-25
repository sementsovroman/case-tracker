export function getApiBase() {
  const raw = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";
  return raw.replace(/\/$/, "");
}

export function buildUrl(path: string) {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}
