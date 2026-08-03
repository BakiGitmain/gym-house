import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import {
  checkDatabaseConnection,
} from "./db/pool.js";
import { ApiError } from "./lib/api-error.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";
import {
  enforceTrustedOrigin,
} from "./middleware/trusted-origin.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.disable("x-powered-by");

app.set(
  "trust proxy",
  env.isProduction ? 1 : false,
);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin =
        origin.replace(/\/+$/, "");

      if (
        env.clientUrls.includes(
          normalizedOrigin,
        )
      ) {
        return callback(null, true);
      }

      return callback(
        new ApiError(
          403,
          "CORS_ORIGIN_REJECTED",
          {
            en: "This website is not allowed to access the Gym House API.",
            am: "ይህ ድረ ገጽ የጂም ሃውስ ኤፒአይን እንዲጠቀም አልተፈቀደለትም።",
          },
        ),
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Accept",
    ],

    exposedHeaders: [
      "Retry-After",
    ],

    maxAge: 86_400,
  }),
);

app.use(
  express.json({
    limit: "20kb",
  }),
);

app.use(cookieParser());

app.use(enforceTrustedOrigin);

app.get("/", (_request, response) => {
  return response.status(200).json({
    success: true,
    service: "Gym House API",
  });
});

app.get(
  "/api/health",
  async (_request, response, next) => {
    try {
      await checkDatabaseConnection();

      return response.status(200).json({
        success: true,

        message: {
          en: "Gym House backend and database are running.",
          am: "የጂም ሃውስ ባክኤንድና ዳታቤዝ እየሰሩ ነው።",
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

app.use("/api/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;