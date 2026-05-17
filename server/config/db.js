import mongoose from "mongoose";
import logger from "../utils/logger.js";

function maskMongoUri(uri) {
  if (!uri) return "not set";

  return uri.replace(
    /(mongodb(?:\+srv)?:\/\/[^:\s]+:)([^@\s]+)(@)/i,
    "$1****$3"
  );
}

export async function connectDB() {
  try {

    const mongoUri = process.env.MONGO_URI?.trim();

    logger.info(
      `MONGO_URI loaded: ${mongoUri ? "yes" : "no"}`
    );

    logger.info(
      `Mongo target: ${maskMongoUri(mongoUri)}`
    );

    if (!mongoUri) {
      throw new Error("MONGO_URI missing");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(mongoUri);

    logger.info(
      `✅ MongoDB Connected: ${conn.connection.host}`
    );

  } catch (error) {

    logger.error(
      `❌ MongoDB connection failed: ${error.message}`
    );

    process.exit(1);
  }
}