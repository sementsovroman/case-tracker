import { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";
import { HearingCreateSchema, HearingUpdateSchema, HearingsRangeQuerySchema } from "../schemas/hearings.schema.js";

function toDto(h: any) {
  return {
    id: h.id,
    caseId: h.caseId,
    kind: h.kind,
    start: h.start.toISOString(),
    end: h.end.toISOString(),
    createdAt: h.createdAt?.toISOString?.() ?? h.createdAt,
    updatedAt: h.updatedAt?.toISOString?.() ?? h.updatedAt,
    case: h.case
      ? {
          id: h.case.id,
          title: h.case.title,
          description: h.case.description,
          color: h.case.color,
        }
      : null,
  };
}

export async function hearingsRoutes(app: FastifyInstance) {
  // GET /hearings?from=...&to=...
  app.get("/", async (req, reply) => {
    const parsed = HearingsRangeQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_QUERY", details: parsed.error.flatten() });
    }

    const from = new Date(parsed.data.from);
    const to = new Date(parsed.data.to);

    const hearings = await prisma.hearing.findMany({
      where: {
        AND: [{ start: { lt: to } }, { end: { gt: from } }],
      },
      include: { case: true },
      orderBy: { start: "asc" },
    });

    return hearings.map(toDto);
  });

  // GET /hearings/:id
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const h = await prisma.hearing.findUnique({
      where: { id },
      include: { case: true },
    });
    if (!h) return reply.code(404).send({ error: "NOT_FOUND" });
    return toDto(h);
  });

  // POST /hearings
  app.post("/", async (req, reply) => {
    const parsed = HearingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_BODY", details: parsed.error.flatten() });
    }

    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);
    if (!(start.getTime() < end.getTime())) {
      return reply.code(400).send({ error: "INVALID_RANGE", message: "start must be before end" });
    }

    const exists = await prisma.case.findUnique({ where: { id: parsed.data.caseId } });
    if (!exists) return reply.code(404).send({ error: "CASE_NOT_FOUND" });

    const created = await prisma.hearing.create({
      data: {
        caseId: parsed.data.caseId,
        kind: parsed.data.kind,
        start,
        end,
      },
      include: { case: true },
    });

    return reply.code(201).send(toDto(created));
  });

  // PUT /hearings/:id
  app.put("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = HearingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_BODY", details: parsed.error.flatten() });
    }

    const exists = await prisma.hearing.findUnique({ where: { id } });
    if (!exists) return reply.code(404).send({ error: "NOT_FOUND" });

    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);
    if (!(start.getTime() < end.getTime())) {
      return reply.code(400).send({ error: "INVALID_RANGE", message: "start must be before end" });
    }

    const caseExists = await prisma.case.findUnique({ where: { id: parsed.data.caseId } });
    if (!caseExists) return reply.code(404).send({ error: "CASE_NOT_FOUND" });

    const updated = await prisma.hearing.update({
      where: { id },
      data: {
        caseId: parsed.data.caseId,
        kind: parsed.data.kind,
        start,
        end,
      },
      include: { case: true },
    });

    return toDto(updated);
  });

  // DELETE /hearings/:id
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.hearing.findUnique({ where: { id } });
    if (!exists) return reply.code(404).send({ error: "NOT_FOUND" });

    await prisma.hearing.delete({ where: { id } });
    return reply.code(204).send();
  });
}
