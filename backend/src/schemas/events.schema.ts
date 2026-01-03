import { z } from "zod";

export const EventCreateSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(5000).default(""),
  start: z.string().datetime(),
  end: z.string().datetime(),
  color: z.string().min(1).max(32).default("#3b82f6"),

  // future
  timezone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isPublic: z.boolean().optional().nullable(),
  meta: z.record(z.unknown()).optional().nullable(),
});

export const EventUpdateSchema = EventCreateSchema;

export const EventsRangeQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
