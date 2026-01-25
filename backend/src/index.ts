import Fastify from "fastify";
import cors from "@fastify/cors";
import { casesRoutes } from "./routes/cases.js";
import { hearingsRoutes } from "./routes/hearings.js";

import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

await app.register(casesRoutes, { prefix: "/cases" });
await app.register(hearingsRoutes, { prefix: "/hearings" });

app.get("/health", async () => ({ ok: true }));

// --- serve frontend build ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/dist/index.js -> backend/dist -> backend
const publicDir = path.resolve(__dirname, "../public");
const hasPublicDir = fs.existsSync(publicDir);

if (hasPublicDir) {
  await app.register(fastifyStatic, {
    root: publicDir,
  });

  // SPA fallback:
  app.setNotFoundHandler((req, reply) => {
    // API 404 как JSON:
    if (
      req.url.startsWith("/cases") ||
      req.url.startsWith("/hearings") ||
      req.url.startsWith("/health")
    ) {
      return reply.code(404).send({ error: "NOT_FOUND" });
    }
    // Frontend fallback:
    return reply.sendFile("index.html");
  });
} else {
  app.log.info("Static frontend not found, skipping static serve.");
}
// --- end serve frontend build ---

const PORT = Number(process.env.PORT ?? 3001);
app.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});