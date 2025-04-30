import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables with fallbacks
const envPaths = ['.env', '.env.local', '.env.development'];
for (const envPath of envPaths) {
  const envFilePath = path.resolve(process.cwd(), envPath);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    console.log(`Loaded environment from ${envPath}`);
    break;
  }
}

// Set SendGrid API key manually if not found in environment
if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.warn("SendGrid API key not found in environment variables. Setting default for development...");
  // IMPORTANT: Replace this with your actual SendGrid API key from sendgrid.com
  // Your key should start with "SG." followed by the actual key
  process.env.SENDGRID_API_KEY = 'SG.your_actual_api_key_here';
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5001
  // this serves both the API and the client.
  // Port 5000 is already in use, so we're using 5001
  const port = 5001;
  server.listen({
    port,
    host: "localhost",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
