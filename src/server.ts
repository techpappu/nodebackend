import { app } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";

async function start(): Promise<void> {
  await connectDatabase();
  const server = app.listen(env.port, () => console.log(`API listening on port ${env.port}`));

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down`);
    server.close(() => void disconnectDatabase().finally(() => process.exit(0)));
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((error) => { console.error("Failed to start server", error); process.exit(1); });
