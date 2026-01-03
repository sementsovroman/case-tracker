export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: string; // ISO
  end: string;   // ISO
  color: string;

  createdAt?: string;
  updatedAt?: string;

  // future
  timezone?: string | null;
  location?: string | null;
  isPublic?: boolean | null;
  meta?: Record<string, unknown> | null;
};
