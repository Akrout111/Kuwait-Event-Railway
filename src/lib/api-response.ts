interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(
  data: T,
  message: string,
  meta?: PaginationMeta
) {
  return Response.json({
    success: true,
    data,
    message,
    ...(meta && { meta }),
  });
}

export function errorResponse(
  code: string,
  message: string,
  field?: string,
  status = 400
) {
  return Response.json(
    { success: false, error: { code, message, field: field ?? null } },
    { status }
  );
}
