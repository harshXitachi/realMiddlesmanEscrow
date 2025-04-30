import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup middleware and routes
const setupServer = async () => {
  // Register routes
  await registerRoutes(app);
  
  // Return the fully configured app
  return app;
};

// Export the handler
export const handler = async (event: any, context: any) => {
  // Initialize the app
  const app = await setupServer();
  
  // Create and invoke the serverless handler
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
}; 