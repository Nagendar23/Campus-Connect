import mongoose from "mongoose";
import { config } from "./env";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`✓ MongoDB connected: ${config.mongoUri}`);
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("✓ MongoDB disconnected");
}
