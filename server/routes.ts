import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTransactionSchema, insertMessageSchema, insertDisputeSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API error handler middleware
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ error: validationError.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  };

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) return res.sendStatus(401);
      
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) return res.status(400).json({ error: "Invalid transaction ID" });
      
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });
      
      // Check if user is part of this transaction
      const userId = req.user?.id;
      if (transaction.initiatorId !== userId && 
          transaction.receiverId !== userId && 
          transaction.brokerId !== userId && 
          req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Not authorized to view this transaction" });
      }
      
      res.json(transaction);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) return res.sendStatus(401);
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        initiatorId: userId,
        transactionId: `ETX${Math.floor(100 + Math.random() * 900)}` // Generate a transaction ID
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) return res.status(400).json({ error: "Invalid transaction ID" });
      
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });
      
      // Check if user is authorized to update this transaction
      const userId = req.user?.id;
      if (transaction.initiatorId !== userId && 
          transaction.receiverId !== userId && 
          transaction.brokerId !== userId && 
          req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Not authorized to update this transaction" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
      res.json(updatedTransaction);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) return res.sendStatus(401);
      
      const messages = await storage.getMessagesByUserId(userId);
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) return res.sendStatus(401);
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Dispute routes
  app.post("/api/disputes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) return res.sendStatus(401);
      
      const disputeData = insertDisputeSchema.parse({
        ...req.body,
        initiatorId: userId
      });
      
      // Verify the user is part of the transaction
      const transaction = await storage.getTransaction(disputeData.transactionId);
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });
      
      if (transaction.initiatorId !== userId && 
          transaction.receiverId !== userId && 
          req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Not authorized to create a dispute for this transaction" });
      }
      
      // Update transaction status to disputed
      await storage.updateTransaction(disputeData.transactionId, { status: "disputed" });
      
      const dispute = await storage.createDispute(disputeData);
      res.status(201).json(dispute);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Not authorized" });
    
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) return res.sendStatus(401);
      
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) return res.status(400).json({ error: "Invalid notification ID" });
      
      const notification = await storage.getNotification(notificationId);
      if (!notification) return res.status(404).json({ error: "Notification not found" });
      
      if (notification.userId !== req.user?.id) {
        return res.status(403).json({ error: "Not authorized to mark this notification as read" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
