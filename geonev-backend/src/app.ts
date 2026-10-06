import express from "express";
import cors from "cors";
import routes from "./routes";
import parkingRoutes from "./routes/parking.routes";
import hostParkingRoutes from "./routes/host.parking.routes";

const app = express();

const normalize = (url: string) => url.trim().replace(/\/+$/, "");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
]
  .filter((u): u is string => Boolean(u))
  .map(normalize);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools (curl, Postman) that send no Origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // only needed if you use cookies; harmless otherwise
  })
);

app.use(express.json());

app.use("/api", routes);
app.use("/api/parkings", parkingRoutes);
app.use("/api/host/parkings", hostParkingRoutes);

export default app;