export function errorHandler(res: any, error: any) {
  // Log the error for debugging
  console.error(error);

  // Customize error response as needed
  return res.status(500).json({
    success: false,
    message: error?.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error : undefined,
  });
}