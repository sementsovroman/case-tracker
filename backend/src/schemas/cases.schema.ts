import { z } from "zod";

export const CaseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  court: z.string().max(200).default(""),
  judge: z.string().max(200).default(""),
  plaintiff: z.string().max(200).default(""),
  defendant: z.string().max(200).default(""),
  color: z.string().min(1).max(32).default("#3b82f6"),
  notes: z.string().max(5000).default(""),
  archived: z.boolean().optional().default(false),
});

export const CaseUpdateSchema = CaseCreateSchema;
