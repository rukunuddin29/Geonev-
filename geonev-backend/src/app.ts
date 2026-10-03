import express from "express";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Geonev backend is running",
  });
});

app.use("/api/v1/auth", authRoutes);

export default app;