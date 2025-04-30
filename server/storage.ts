import { 
  User, 
  InsertUser, 
  Transaction, 
  InsertTransaction, 
  Message, 
  InsertMessage, 
  Notification, 
  InsertNotification, 
  Dispute, 
  InsertDispute 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getMessagesByTransactionId(transactionId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  
  // Dispute methods
  getDispute(id: number): Promise<Dispute | undefined>;
  getDisputesByTransactionId(transactionId: number): Promise<Dispute[]>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: number, data: Partial<Dispute>): Promise<Dispute>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private messages: Map<number, Message>;
  private notifications: Map<number, Notification>;
  private disputes: Map<number, Dispute>;
  
  private currentUserId: number;
  private currentTransactionId: number;
  private currentMessageId: number;
  private currentNotificationId: number;
  private currentDisputeId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.disputes = new Map();
    
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentMessageId = 1;
    this.currentNotificationId = 1;
    this.currentDisputeId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$X7SZ5GsVeL.A3Wg6/QsyJ.fvlnzVBWrC14svGQT1lKLSUUTQp1V3W", // "admin123"
      email: "admin@middlesman.com",
      fullName: "Admin User",
      role: "admin"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const newUser: User = { ...user, id, createdAt: now };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      ...data
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => 
        transaction.initiatorId === userId || 
        transaction.receiverId === userId || 
        transaction.brokerId === userId
    );
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.transactions.set(id, newTransaction);
    
    // Create notification for receiver
    await this.createNotification({
      userId: transaction.receiverId,
      title: "New Transaction",
      content: `You have a new transaction: ${transaction.title}`,
      type: "transaction",
      relatedId: id,
      isRead: false
    });
    
    return newTransaction;
  }
  
  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    const updatedTransaction: Transaction = {
      ...transaction,
      ...data,
      updatedAt: new Date()
    };
    
    this.transactions.set(id, updatedTransaction);
    
    // If status changed, create notifications
    if (data.status && data.status !== transaction.status) {
      // For initiator
      await this.createNotification({
        userId: transaction.initiatorId,
        title: "Transaction Status Updated",
        content: `Transaction ${transaction.transactionId} status changed to ${data.status}`,
        type: "transaction",
        relatedId: id,
        isRead: false
      });
      
      // For receiver
      await this.createNotification({
        userId: transaction.receiverId,
        title: "Transaction Status Updated",
        content: `Transaction ${transaction.transactionId} status changed to ${data.status}`,
        type: "transaction",
        relatedId: id,
        isRead: false
      });
      
      // For broker if exists
      if (transaction.brokerId) {
        await this.createNotification({
          userId: transaction.brokerId,
          title: "Transaction Status Updated",
          content: `Transaction ${transaction.transactionId} status changed to ${data.status}`,
          type: "transaction",
          relatedId: id,
          isRead: false
        });
      }
    }
    
    return updatedTransaction;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getMessagesByTransactionId(transactionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.transactionId === transactionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const newMessage: Message = { ...message, id, createdAt: now };
    this.messages.set(id, newMessage);
    
    // Create notification for receiver
    await this.createNotification({
      userId: message.receiverId,
      title: "New Message",
      content: "You have received a new message",
      type: "message",
      relatedId: id,
      isRead: false
    });
    
    return newMessage;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const now = new Date();
    const newNotification: Notification = { ...notification, id, createdAt: now };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    const updatedNotification: Notification = {
      ...notification,
      isRead: true
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Dispute methods
  async getDispute(id: number): Promise<Dispute | undefined> {
    return this.disputes.get(id);
  }
  
  async getDisputesByTransactionId(transactionId: number): Promise<Dispute[]> {
    return Array.from(this.disputes.values())
      .filter(dispute => dispute.transactionId === transactionId);
  }
  
  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const id = this.currentDisputeId++;
    const now = new Date();
    const newDispute: Dispute = { 
      ...dispute, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.disputes.set(id, newDispute);
    
    const transaction = await this.getTransaction(dispute.transactionId);
    if (transaction) {
      // Create notification for other party
      const otherPartyId = dispute.initiatorId === transaction.initiatorId
        ? transaction.receiverId
        : transaction.initiatorId;
      
      await this.createNotification({
        userId: otherPartyId,
        title: "Dispute Filed",
        content: `A dispute has been filed for transaction ${transaction.transactionId}`,
        type: "transaction",
        relatedId: transaction.id,
        isRead: false
      });
      
      // Notify broker if exists
      if (transaction.brokerId) {
        await this.createNotification({
          userId: transaction.brokerId,
          title: "Dispute Filed",
          content: `A dispute has been filed for transaction ${transaction.transactionId}`,
          type: "transaction",
          relatedId: transaction.id,
          isRead: false
        });
      }
      
      // Notify admin
      const adminUsers = Array.from(this.users.values())
        .filter(user => user.role === 'admin');
      
      for (const admin of adminUsers) {
        await this.createNotification({
          userId: admin.id,
          title: "New Dispute",
          content: `A new dispute has been filed for transaction ${transaction.transactionId}`,
          type: "transaction",
          relatedId: transaction.id,
          isRead: false
        });
      }
    }
    
    return newDispute;
  }
  
  async updateDispute(id: number, data: Partial<Dispute>): Promise<Dispute> {
    const dispute = this.disputes.get(id);
    if (!dispute) {
      throw new Error(`Dispute with ID ${id} not found`);
    }
    
    const updatedDispute: Dispute = {
      ...dispute,
      ...data,
      updatedAt: new Date()
    };
    
    this.disputes.set(id, updatedDispute);
    
    // If dispute is resolved, update transaction status
    if (data.status === 'resolved' && data.resolution) {
      const transaction = await this.getTransaction(dispute.transactionId);
      if (transaction) {
        await this.updateTransaction(transaction.id, { 
          status: 'in_progress' // Return to in progress after resolution
        });
        
        // Notify parties
        await this.createNotification({
          userId: transaction.initiatorId,
          title: "Dispute Resolved",
          content: `The dispute for transaction ${transaction.transactionId} has been resolved: ${data.resolution}`,
          type: "transaction",
          relatedId: transaction.id,
          isRead: false
        });
        
        await this.createNotification({
          userId: transaction.receiverId,
          title: "Dispute Resolved",
          content: `The dispute for transaction ${transaction.transactionId} has been resolved: ${data.resolution}`,
          type: "transaction",
          relatedId: transaction.id,
          isRead: false
        });
      }
    }
    
    return updatedDispute;
  }
}

export const storage = new MemStorage();
