import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { applySecurity, corsConfig } from "./middleware/security.js";

import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import { configureSockets } from "./sockets/index.js";
import logger from "./utils/logger.js";
import { seedDemoUser } from "./utils/seedDemoUser.js";
import { initCronJobs } from "./utils/cronJobs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: corsConfig,
});

app.set("io", io);

applySecurity(app);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "KhataTrack API running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", expenseRoutes);

app.use(notFound);
app.use(errorHandler);

configureSockets(io);

const PORT = process.env.PORT || 5000;

function listen(port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => {
      server.off("error", reject);
      logger.info(`🚀 KhataTrack API running on port ${port}`);
      resolve();
    });
  });
}

const startServer = async () => {
  try {
    await connectDB();
    await seedDemoUser();
    initCronJobs();
    await listen(PORT);
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      logger.error(`Port ${PORT} is already in use. Stop the other backend process or set PORT to another value in server/.env.`);
    } else {
      logger.error(`Server startup failed: ${error.message}`);
    }
    process.exit(1);
  }
};

startServer();
