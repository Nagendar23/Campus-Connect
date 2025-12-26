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
    const dbName = mongoose.connection.db.databaseName;
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

    // Create users
    const passwordHash = await bcrypt.hash("password123", 12);

    const [student1, student2, organizer1, organizer2] = await User.create([
      {
        name: "Alice Student",
        email: "alice@campus.edu",
        passwordHash,
        role: "student",
      },
      {
        name: "Bob Student",
        email: "bob@campus.edu",
        passwordHash,
        role: "student",
      },
      {
        name: "Charlie Organizer",
        email: "charlie@campus.edu",
        passwordHash,
        role: "organizer",
      },
      {
        name: "Diana Organizer",
        email: "diana@campus.edu",
        passwordHash,
        role: "organizer",
      },
    ]);

    console.log("✓ Created users");

    // Create events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [event1, event2, event3, event4] = await Event.create([
      {
        title: "Tech Talk: AI in Education",
        description: "Join us for an insightful discussion on AI's impact in education",
        category: "Technology",
        location: "Main Auditorium",
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        capacity: 100,
        isPaid: false,
        status: "published",
        organizerId: organizer1._id,
        venue: "Building A, Room 101",
      },
      {
        title: "Campus Fest 2025",
        description: "Annual campus cultural festival",
        category: "Cultural",
        location: "Campus Grounds",
        startTime: nextWeek,
        endTime: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000),
        capacity: 500,
        isPaid: true,
        price: 1500, // $15.00
        status: "published",
        organizerId: organizer1._id,
        venue: "Open Air Theater",
      },
      {
        title: "Career Workshop",
        description: "Resume building and interview preparation",
        category: "Career",
        location: "Career Center",
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 50,
        isPaid: false,
        status: "published",
        organizerId: organizer2._id,
        venue: "Career Center, Hall 1",
      },
      {
        title: "Sports Day",
        description: "Inter-department sports competition",
        category: "Sports",
        location: "Sports Complex",
        startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        capacity: 200,
        isPaid: false,
        status: "published",
        organizerId: organizer2._id,
        venue: "Sports Complex",
      },
    ]);

    console.log("✓ Created events");

    // Create registrations and tickets for free events
    const registration1 = await Registration.create({
      userId: student1._id,
      eventId: event1._id,
      status: "confirmed",
    });

    const qrCode1 = generateQRToken(registration1._id.toString(), event1._id.toString());

    const ticket1 = await Ticket.create({
      userId: student1._id,
      eventId: event1._id,
      registrationId: registration1._id,
      qrCode: qrCode1,
    });

    registration1.ticketId = ticket1._id;
    await registration1.save();

    const registration2 = await Registration.create({
      userId: student2._id,
      eventId: event3._id,
      status: "confirmed",
    });

    const qrCode2 = generateQRToken(registration2._id.toString(), event3._id.toString());

    const ticket2 = await Ticket.create({
      userId: student2._id,
      eventId: event3._id,
      registrationId: registration2._id,
      qrCode: qrCode2,
    });

    registration2.ticketId = ticket2._id;
    await registration2.save();

    console.log("✓ Created registrations and tickets");

    console.log("\n✨ Seed completed successfully!\n");
    console.log("Test credentials:");
    console.log("─────────────────────────────────");
    console.log("Students:");
    console.log("  alice@campus.edu / password123");
    console.log("  bob@campus.edu / password123");
    console.log("\nOrganizers:");
    console.log("  charlie@campus.edu / password123");
    console.log("  diana@campus.edu / password123");
    console.log("─────────────────────────────────\n");

    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("✗ Seed failed:", error);
    process.exit(1);
  }
}

seed();
