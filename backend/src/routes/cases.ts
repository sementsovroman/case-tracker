import { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";
import { CaseCreateSchema, CaseUpdateSchema } from "../schemas/cases.schema.js";

function toDto(c: any) {
  return {
    ...c,
    createdAt: c.createdAt?.toISOString?.() ?? c.createdAt,
    updatedAt: c.updatedAt?.toISOString?.() ?? c.updatedAt,
  };
}

export async function casesRoutes(app: FastifyInstance) {
  // GET /cases
  app.get("/", async () => {
    const cases = await prisma.case.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
    });
    return cases.map(toDto);
  });

  // GET /cases/:id
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const c = await prisma.case.findUnique({ where: { id } });
    if (!c) return reply.code(404).send({ error: "NOT_FOUND" });
    return toDto(c);
  });

  // POST /cases
  app.post("/", async (req, reply) => {
    const parsed = CaseCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_BODY", details: parsed.error.flatten() });
    }

    const created = await prisma.case.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        court: parsed.data.court,
        judge: parsed.data.judge,
        plaintiff: parsed.data.plaintiff,
        defendant: parsed.data.defendant,
        color: parsed.data.color,
        notes: parsed.data.notes,
        archived: parsed.data.archived ?? false,
      },
    });

    return reply.code(201).send(toDto(created));
  });

  // PUT /cases/:id
  app.put("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const parsed = CaseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "BAD_BODY", details: parsed.error.flatten() });
    }

    const exists = await prisma.case.findUnique({ where: { id } });
    if (!exists) return reply.code(404).send({ error: "NOT_FOUND" });

    const updated = await prisma.case.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        court: parsed.data.court,
        judge: parsed.data.judge,
        plaintiff: parsed.data.plaintiff,
        defendant: parsed.data.defendant,
        color: parsed.data.color,
        notes: parsed.data.notes,
        archived: parsed.data.archived ?? false,
      },
    });

    return toDto(updated);
  });

  // DELETE /cases/:id
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.case.findUnique({ where: { id } });
    if (!exists) return reply.code(404).send({ error: "NOT_FOUND" });

    await prisma.case.delete({ where: { id } });
    return reply.code(204).send();
  });
}
