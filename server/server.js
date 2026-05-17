import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import morgan from "morgan";
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

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: corsConfig,
});

app.set("io", io);

// Security & middleware
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

// Health route
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "KhataTrack API running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", expenseRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Socket setup
configureSockets(io);

const PORT = process.env.PORT || 5000;

// Server listener
function listen(port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);

    server.listen(port, () => {
      server.off("error", reject);

      logger.info(
        `🚀 KhataTrack API running on port ${port}`
      );

      resolve();
    });
  });
}

// Start application
const startServer = async () => {
  try {
    logger.info("Starting KhataTrack server...");

    await connectDB();

    await seedDemoUser();

    initCronJobs();

    await listen(PORT);

  } catch (error) {

    logger.error(
      `❌ Server startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

startServer();