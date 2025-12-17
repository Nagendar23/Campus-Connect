import { createServer } from "http";
import app from "./app";
import { config, validateEnv } from "./config/env";
import { connectDB } from "./config/db";

async function bootstrap() {
  try {
    // Validate environment variables
    validateEnv();
    console.log("✓ Environment variables validated");

    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const server = createServer(app);

    // Start listening
    server.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ CORS Origin: ${config.corsOrigin}`);
      console.log(`\n🚀 Campus Connect API ready at http://localhost:${config.port}/api`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        console.log("✓ HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
