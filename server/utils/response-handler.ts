import type { Response } from "express";
import { ZodError } from "zod";

export function sendResponse(
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data: data ?? null,
  });
}

export function handleError(res: Response, error: any) {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return sendResponse(
      res,
      400,
      "Validation error",
      error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }))
    );
  }

  // Handle other errors
  if (error instanceof Error) {
    return sendResponse(res, 500, error.message || "An error occurred");
  }

  return sendResponse(res, 500, "An unexpected error occurred");
}