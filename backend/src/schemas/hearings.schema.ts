import { z } from "zod";

export const HearingCreateSchema = z.object({
  caseId: z.string().min(1),
  kind: z.enum(["hearing", "meeting"]).default("hearing"),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const HearingUpdateSchema = HearingCreateSchema;

export const HearingsRangeQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
