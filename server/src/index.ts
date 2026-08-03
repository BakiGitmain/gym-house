import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";

if (!process.env.VERCEL) {
  const server = app.listen(
    env.PORT,
    () => {
      console.log(
        `Gym House backend running at http://localhost:${env.PORT}`,
      );
    },
  );

  async function shutdown(
    signal: string,
  ) {
    console.log(
      `Received ${signal}. Shutting down safely...`,
    );

    server.close(async () => {
      await pool.end();
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(1);
    }, 10_000).unref();
  }

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
}

export default app;