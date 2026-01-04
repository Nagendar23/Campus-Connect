import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 8001,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/test",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000").replace(/\/$/, ""),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "change_me_access",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh",
    accessTTL: (process.env.JWT_ACCESS_TTL || "15m") as string,
    refreshTTL: (process.env.JWT_REFRESH_TTL || "7d") as string,
  },
  qrSecret: process.env.QR_SECRET || "change_me_qr",
};

export function validateEnv() {
  const required = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "QR_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && config.nodeEnv === "production") {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
