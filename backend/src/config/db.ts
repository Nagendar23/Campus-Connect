import mongoose from "mongoose";
import { config } from "./env";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✓ MongoDB connected successfully`);
    console.log(`✓ Connected to database: ${dbName}`);
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("✓ MongoDB disconnected");
}
