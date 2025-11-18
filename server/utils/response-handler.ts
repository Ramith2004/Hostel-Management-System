export function responseHandler(
  res: any,
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