import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const requireHost = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.auth) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.auth.role !== "HOST") {
    res.status(403).json({
      success: false,
      message: "Host access required",
    });
    return;
  }

  next();
};