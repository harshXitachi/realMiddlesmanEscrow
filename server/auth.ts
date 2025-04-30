import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { 
  generateVerificationCode, 
  sendVerificationEmail,
  sendPasswordResetEmail
} from "./emailService";

// Set environment variables for email services
if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: No SendGrid API key found. Email verification will not work correctly.");
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create a verification code that expires in 1 hour
function createVerificationData() {
  const code = generateVerificationCode();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Expires in 1 hour
  return { code, expires };
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "middlesman_secret_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        // Return false if user doesn't exist or password doesn't match
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        
        // Check if user is verified
        if (!user.isVerified) {
          return done(null, false, { message: "Please verify your email address before logging in" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }

      // Generate verification code
      const { code, expires } = createVerificationData();

      // Create user with verification data
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        isVerified: false,
        verificationCode: code,
        verificationExpires: expires,
      });

      // Send verification code via email
      const emailSent = await sendVerificationEmail(
        user.email, 
        code, 
        user.username
      );

      if (!emailSent) {
        console.error(`Failed to send verification code via email`);
      } else {
        console.log(`********************************************************`);
        console.log(`****** VERIFICATION CODE FOR ${user.email} ******`);
        console.log(`****** CODE: ${code} ******`);
        console.log(`********************************************************`);
      }

      // Return success but don't log in the user yet
      // Instead, redirect to verification page
      res.status(201).json({ 
        message: "Registration successful! Please check your email for verification code.",
        userId: user.id,
        email: user.email
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      req.login(user, (err: Error) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Email verification endpoint
  app.post("/api/verify-email", async (req, res, next) => {
    try {
      const { userId, code } = req.body;
      
      if (!userId || !code) {
        return res.status(400).send("User ID and verification code are required");
      }

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(400).send("Email already verified");
      }

      // Check if code is valid and not expired
      if (!user.verificationCode || 
          user.verificationCode !== code || 
          !user.verificationExpires || 
          new Date() > user.verificationExpires) {
        return res.status(400).send("Invalid or expired verification code");
      }

      // Update user as verified
      const updatedUser = await storage.updateUser(user.id, {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null
      });

      // Return success
      res.status(200).json({ 
        message: "Email verification successful! You can now log in."
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Resend email verification code
  app.post("/api/resend-verification", async (req, res, next) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).send("User ID is required");
      }
      
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Check if already verified
      if (user.isVerified) {
        return res.status(400).send("Email already verified");
      }
      
      // Generate new verification code
      const { code, expires } = createVerificationData();
      
      // Update user with new code
      await storage.updateUser(user.id, {
        verificationCode: code,
        verificationExpires: expires
      });
      
      // Send verification code via email
      const emailSent = await sendVerificationEmail(
        user.email, 
        code, 
        user.username
      );
      
      if (!emailSent) {
        console.error(`Failed to send verification code via email`);
      } else {
        console.log(`********************************************************`);
        console.log(`****** VERIFICATION CODE FOR ${user.email} ******`);
        console.log(`****** CODE: ${code} ******`);
        console.log(`********************************************************`);
      }
      
      // Return success
      res.status(200).json({ 
        message: "Verification code sent! Please check your email."
      });
    } catch (error) {
      next(error);
    }
  });

  // Request password reset
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).send("Email is required");
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't reveal if email exists
        return res.status(200).json({ 
          message: "If your email is registered, you will receive a password reset code."
        });
      }

      // Generate reset code
      const { code, expires } = createVerificationData();

      // Update user with reset code
      await storage.updateUser(user.id, {
        resetPasswordCode: code,
        resetPasswordExpires: expires
      });

      // Send password reset code via email
      const emailSent = await sendPasswordResetEmail(
        user.email, 
        code, 
        user.username
      );

      if (!emailSent) {
        console.error(`Failed to send password reset code via email`);
      } else {
        console.log(`********************************************************`);
        console.log(`****** PASSWORD RESET CODE FOR ${user.email} ******`);
        console.log(`****** CODE: ${code} ******`);
        console.log(`********************************************************`);
      }

      // Return success
      res.status(200).json({ 
        message: "If your email is registered, you will receive a password reset code.",
        userId: user.id
      });
    } catch (error) {
      next(error);
    }
  });

  // Reset password
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { userId, code, newPassword } = req.body;
      
      if (!userId || !code || !newPassword) {
        return res.status(400).send("User ID, reset code, and new password are required");
      }

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if code is valid and not expired
      if (!user.resetPasswordCode || 
          user.resetPasswordCode !== code || 
          !user.resetPasswordExpires || 
          new Date() > user.resetPasswordExpires) {
        return res.status(400).send("Invalid or expired reset code");
      }

      // Update user password
      const updatedUser = await storage.updateUser(user.id, {
        password: await hashPassword(newPassword),
        resetPasswordCode: null,
        resetPasswordExpires: null
      });

      // Return success
      res.status(200).json({ 
        message: "Password reset successful! You can now log in with your new password."
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}