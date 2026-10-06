import express from "express";
import cors from "cors";
import routes from "./routes";
import parkingRoutes from "./routes/parking.routes";
import hostParkingRoutes from "./routes/host.parking.routes";
import bookingRoutes, { hostBookingRouter } from "./routes/booking.routes";

const app = express();

// Strip whitespace and trailing slashes so a stray "/" in the env var can't break CORS.
const normalize = (url: string) => url.trim().replace(/\/+$/, "");

const allowedOrigins = [
  ...(process.env.FRONTEND_URL ?? "").split(","), // supports comma-separated list
  "http://localhost:3000",
  "http://localhost:5173",
]
  .map(normalize)
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, Postman, server-to-server) with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use("/api", routes);

app.use("/api/parkings", parkingRoutes);
app.use("/api/bookings", bookingRoutes);

app.use("/api/host/parkings", hostParkingRoutes);
app.use("/api/host/bookings", hostBookingRouter);

export default app;