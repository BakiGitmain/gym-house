import type {
  ErrorRequestHandler,
  RequestHandler,
} from "express";

import { ApiError } from "../lib/api-error.js";

export const notFoundHandler: RequestHandler =
  (request, response) => {
    return response.status(404).json({
      success: false,
      code: "API_ROUTE_NOT_FOUND",

      message: {
        en: "The requested API route was not found.",
        am: "የተጠየቀው የኤፒአይ መንገድ አልተገኘም።",
      },

      path: request.originalUrl,
    });
  };

export const errorHandler: ErrorRequestHandler =
  (
    error,
    _request,
    response,
    next,
  ) => {
    if (response.headersSent) {
      return next(error);
    }

    if (error instanceof ApiError) {
      return response
        .status(error.statusCode)
        .json({
          success: false,
          code: error.code,
          message:
            error.translatedMessage,
        });
    }

    if (
      error instanceof SyntaxError &&
      "body" in error
    ) {
      return response.status(400).json({
        success: false,
        code: "INVALID_JSON",

        message: {
          en: "The request contains invalid JSON.",
          am: "ጥያቄው ትክክለኛ ያልሆነ JSON ይዟል።",
        },
      });
    }

    console.error(
      "Unhandled Gym House backend error:",
      error,
    );

    return response.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",

      message: {
        en: "Something went wrong. Please try again.",
        am: "ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
      },
    });
  };