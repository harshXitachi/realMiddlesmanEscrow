import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["buyer", "seller", "broker", "admin"] }).notNull().default("buyer"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationCode: text("verification_code"),
  verificationExpires: timestamp("verification_expires"),
  resetPasswordCode: text("reset_password_code"),
  resetPasswordExpires: timestamp("reset_password_expires"),
});

// Transaction status enum
export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "disputed"
]);

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(), // Format: ETX123
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  initiatorId: integer("initiator_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  brokerId: integer("broker_id").references(() => users.id),
  status: text("status", { enum: ["pending", "in_progress", "completed", "cancelled", "disputed"] }).notNull().default("pending"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  progress: integer("progress").default(0), // Percentage of completion
  milestones: json("milestones").$type<Milestone[]>(),
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  type: text("type", { enum: ["transaction", "message", "system"] }).notNull(),
  relatedId: integer("related_id"), // ID of related entity (transaction, message)
  createdAt: timestamp("created_at").defaultNow(),
});

// Dispute schema
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  initiatorId: integer("initiator_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["open", "under_review", "resolved"] }).notNull().default("open"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom types
export type Milestone = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  isCompleted: boolean;
  dueDate?: Date;
};

// Schema validations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types for use in the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;
