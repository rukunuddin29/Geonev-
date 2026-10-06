import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getParkings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parkings = await prisma.parking.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = parkings.map((parking) => ({
      ...parking,
      isBooked: false,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get parkings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parking stations",
    });
  }
};

export const getParkingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const parking = await prisma.parking.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!parking) {
      res.status(404).json({
        success: false,
        message: "Parking station not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        ...parking,
        isBooked: false,
      },
    });
  } catch (error) {
    console.error("Get parking by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parking station",
    });
  }
};