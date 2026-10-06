import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const createParking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      name,
      address,
      city,
      state,
      latitude,
      longitude,
      spotType,
      totalSlots,
      pricePerHour,
      chargerType,
      powerKw,
      images,
      amenities,
    } = req.body;

    const parking = await prisma.parking.create({
      data: {
        name,
        address,
        city,
        state: state || null,
        latitude,
        longitude,
        spotType,
        totalSlots,
        pricePerHour,
        chargerType: chargerType || "NONE",
        powerKw: powerKw ?? null,
        images: images || [],
        amenities: amenities || [],
        hostId: req.auth.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Parking station created successfully",
      data: parking,
    });
  } catch (error) {
    console.error("Create parking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create parking station",
    });
  }
};

export const getMyParkings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const parkings = await prisma.parking.findMany({
      where: {
        hostId: req.auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: parkings,
    });
  } catch (error) {
    console.error("Get my parkings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your parking stations",
    });
  }
};

export const updateParking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;

    const existingParking = await prisma.parking.findFirst({
      where: {
        id,
        hostId: req.auth.userId,
      },
    });

    if (!existingParking) {
      res.status(404).json({
        success: false,
        message: "Parking station not found",
      });
      return;
    }

    const parking = await prisma.parking.update({
      where: {
        id,
      },
      data: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Parking station updated successfully",
      data: parking,
    });
  } catch (error) {
    console.error("Update parking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update parking station",
    });
  }
};

export const deleteParking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;

    const existingParking = await prisma.parking.findFirst({
      where: {
        id,
        hostId: req.auth.userId,
      },
    });

    if (!existingParking) {
      res.status(404).json({
        success: false,
        message: "Parking station not found",
      });
      return;
    }

    await prisma.parking.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Parking station deleted successfully",
    });
  } catch (error) {
    console.error("Delete parking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete parking station",
    });
  }
};