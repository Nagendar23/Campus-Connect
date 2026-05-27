import mongoose from "mongoose";
import { config } from "./env";

export async function connectDB() {
  try {
    // Try primary configured URI first. If SRV/DNS lookup fails (common when offline or
    // when the remote host is unreachable in local dev), fall back to local MongoDB.
    try {
      await mongoose.connect(config.mongoUri);
    } catch (err: any) {
      // If we're in development and the error is a DNS / SRV resolution or connection refused,
      // attempt connecting to local MongoDB to allow `npm run dev` to work offline.
      const isDev = config.nodeEnv === "development";
      const dnsErrors = ["ENOTFOUND", "ECONNREFUSED", "EFETCH", "querySrv"];
      const shouldFallback = isDev && (err.code && dnsErrors.includes(err.code)) || String(err).includes("querySrv");
      if (shouldFallback) {
        console.warn("MongoDB primary connection failed, falling back to local MongoDB (development).");
        await mongoose.connect("mongodb://127.0.0.1:27017/campusconnect-dev");
      } else {
        throw err;
      }
    }
    const dbName = mongoose.connection.db?.databaseName;
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
