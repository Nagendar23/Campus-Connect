import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./config/env";
import { User } from "./models/User";
import { Event } from "./models/Event";
import { Registration } from "./models/Registration";
import { Ticket } from "./models/Ticket";
import { generateQRToken } from "./utils/qr";

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    const dbName = mongoose.connection.db?.databaseName;
    console.log(`✓ Connected to MongoDB`);
    console.log(`✓ Using database: ${dbName}`);

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Ticket.deleteMany({}),
    ]);
    console.log("✓ Cleared existing data");

    console.log("✓ Cleared existing data");

    console.log("\n✨ Database cleared successfully! No dummy data added.\n");

    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("✗ Seed failed:", error);
    process.exit(1);
  }
}

seed();
