import { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";
import { EventCreateSchema, EventUpdateSchema, EventsRangeQuerySchema } from "../schemas/events.schema.js";

function toDto(e: any) {
  let meta: any = null;
  if (typeof e.meta === "string" && e.meta.length) {
    try { meta = JSON.parse(e.meta); } catch { meta = e.meta; }
  }
  return {
    ...e,
    meta,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    createdAt: e.createdAt?.toISOString?.() ?? e.createdAt,
    updatedAt: e.updatedAt?.toISOString?.() ?? e.updatedAt,
  };
}

export async function eventsRoutes(app: FastifyInstance) {
  // GET /events?from=...&to=...
  app.get("/", async (req, reply) => {
    const parsed = EventsRangeQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_QUERY", details: parsed.error.flatten() });
    }

    const from = new Date(parsed.data.from);
    const to = new Date(parsed.data.to);

    const events = await prisma.event.findMany({
      where: {
        AND: [{ start: { lt: to } }, { end: { gt: from } }],
      },
      orderBy: { start: "asc" },
    });

    return events.map(toDto);
  });

  // GET /events/:id
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const e = await prisma.event.findUnique({ where: { id } });
    if (!e) return reply.code(404).send({ error: "NOT_FOUND" });
    return toDto(e);
  });

  // POST /events
  app.post("/", async (req, reply) => {
    const parsed = EventCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_BODY", details: parsed.error.flatten() });
    }

    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);
    if (!(start.getTime() < end.getTime())) {
      return reply.code(400).send({ error: "INVALID_RANGE", message: "start must be before end" });
    }

    const created = await prisma.event.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        start,
        end,
        color: parsed.data.color,
        timezone: parsed.data.timezone ?? null,
        location: parsed.data.location ?? null,
        isPublic: parsed.data.isPublic ?? null,
        meta: parsed.data.meta ? JSON.stringify(parsed.data.meta) : null,
      },
    });

    return reply.code(201).send(toDto(created));
  });

  // PUT /events/:id
  app.put("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const parsed = EventUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_BODY", details: parsed.error.flatten() });
    }

    const exists = await prisma.event.findUnique({ where: { id } });
    if (!exists) return reply.code(404).send({ error: "NOT_FOUND" });

    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);
    if (!(start.getTime() < end.getTime())) {
      return reply.code(400).send({ error: "INVALID_RANGE", message: "start must be before end" });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        start,
        end,
        color: parsed.data.color,
        timezone: parsed.data.timezone ?? null,
        location: parsed.data.location ?? null,
        isPublic: parsed.data.isPublic ?? null,
        meta: parsed.data.meta ? JSON.stringify(parsed.data.meta) : null,
      },
    });

    return toDto(updated);
  });

  // DELETE /events/:id
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.event.findUnique({ where: { id } });
    if (!exists) return reply.code(404).send({ error: "NOT_FOUND" });

    await prisma.event.delete({ where: { id } });
    return reply.code(204).send();
  });
}
