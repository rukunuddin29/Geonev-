import { Response } from "express";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export const param = (value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, "Invalid parameter");
  }

  return value.trim();
};

export const qstr = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
};

export const qnum = (value: unknown): number | undefined => {
  const str = qstr(value);

  if (str === undefined) {
    return undefined;
  }

  const number = Number(str);

  if (!Number.isFinite(number)) {
    throw new HttpError(400, `Invalid number: ${str}`);
  }

  return number;
};

export const qdate = (value: unknown): Date | undefined => {
  const str = qstr(value);

  if (str === undefined) {
    return undefined;
  }

  const date = new Date(str);

  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `Invalid date: ${str}`);
  }

  return date;
};

export const qlist = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const str = qstr(value);

  if (!str) {
    return [];
  }

  return str
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const round2 = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getPagination = (
  query: Record<string, unknown>,
  defaultLimit = 20
) => {
  const rawPage = qnum(query.page);
  const rawLimit = qnum(query.limit);

  const page = Math.max(1, Math.floor(rawPage ?? 1));
  const limit = Math.min(
    100,
    Math.max(1, Math.floor(rawLimit ?? defaultLimit))
  );

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

export const pageMeta = (
  total: number,
  page: number,
  limit: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const handleError = (
  res: Response,
  error: unknown,
  logMessage: string,
  defaultMessage: string
): void => {
  console.error(logMessage, error);

  if (error instanceof HttpError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: defaultMessage,
  });
};