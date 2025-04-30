import express, { Router } from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from './routes';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create a router for API routes
const api = Router();
app.use('/.netlify/functions/netlify', api);

// Register all routes
(async () => {
  await registerRoutes(app);
})();

// Export the serverless function
export const handler = serverless(app); 