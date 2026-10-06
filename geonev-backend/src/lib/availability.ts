import { BookingStatus } from "@prisma/client";
import { prisma } from "./prisma";

export const BLOCKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
];

export const calculatePrice = (
  hours: number,
  pricePerHour: number,
  pricePerDay?: number | null
): number => {
  let total: number;

  if (pricePerDay && hours >= 24) {
    const fullDays = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    total =
      fullDays * pricePerDay +
      remainingHours * pricePerHour;
  } else {
    total = hours * pricePerHour;
  }

  return Math.round(total * 100) / 100;
};

export const getBookedCounts = async (
  parkingIds: string[],
  startTime: Date,
  endTime: Date
): Promise<Map<string, number>> => {
  if (!parkingIds.length) {
    return new Map();
  }

  const rows = await prisma.booking.groupBy({
    by: ["parkingId"],
    where: {
      parkingId: {
        in: parkingIds,
      },
      status: {
        in: BLOCKING_STATUSES,
      },
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
    _count: {
      _all: true,
    },
  });

  return new Map(
    rows.map((row) => [
      row.parkingId,
      row._count._all,
    ])
  );
};