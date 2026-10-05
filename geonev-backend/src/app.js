import express from "express";
import cors from "cors";
import routes from "./routes";
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use("/api", routes); // routes/index.ts should do: router.use("/auth", authRoutes)
export default app;
