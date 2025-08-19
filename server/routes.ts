import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertGigSchema } from "@shared/schema";
import { generateGigRecommendations, matchUserToGig, analyzeGigDescription } from "./gemini";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      
      // Remove password from response and set current user  
      const { password, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(credentials.email);
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Remove password from response and set current user
      const { password, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword;
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user stats for landing page
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const seekers = users.filter(u => u.userType === 'seeker').length;
      const posters = users.filter(u => u.userType === 'poster').length;
      
      res.json({
        totalUsers: users.length,
        gigSeekers: seekers,
        gigPosters: posters,
        gigsPosted: Math.floor(seekers * 2.5), // Simulated metric
        totalPayout: Math.floor(seekers * 25000), // Simulated metric in Naira
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Session middleware simulation (simple user tracking)
  let currentUser: any = null;

  // User routes
  app.get("/api/user/profile", async (req, res) => {
    if (!currentUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(currentUser);
  });

  // Update login to set current user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(credentials.email);
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Remove password from response and set current user
      const { password, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword;
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Gig routes
  app.get("/api/gigs/available", async (req, res) => {
    try {
      const gigs = await storage.getAvailableGigs();
      res.json(gigs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/gigs/posted", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const gigs = await storage.getGigsByPoster(currentUser.id);
      res.json(gigs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/gigs/my-applications", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const gigs = await storage.getGigsBySeeker(currentUser.id);
      res.json(gigs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gigs", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (currentUser.userType !== 'poster') {
        return res.status(403).json({ message: "Only gig posters can create gigs" });
      }

      const gigData = insertGigSchema.parse(req.body);
      
      // Use AI to analyze and enhance the gig description
      const analysis = await analyzeGigDescription(gigData.description);
      
      const gig = await storage.createGig({
        ...gigData,
        category: gigData.category || analysis.category,
        urgency: gigData.urgency || analysis.urgency,
        estimatedDuration: gigData.estimatedDuration || analysis.estimatedDuration,
        skillsRequired: gigData.skillsRequired.length > 0 ? gigData.skillsRequired : analysis.skillsRequired,
        posterId: currentUser.id,
      });

      res.status(201).json(gig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gigs/:gigId/apply", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (currentUser.userType !== 'seeker') {
        return res.status(403).json({ message: "Only gig seekers can apply to gigs" });
      }

      const { gigId } = req.params;
      const success = await storage.applyToGig(gigId, currentUser.id);
      
      if (!success) {
        return res.status(400).json({ message: "Unable to apply to gig" });
      }

      res.json({ message: "Application successful" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/gigs/:gigId/status", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      const { status } = req.body;
      
      // Verify ownership
      const gig = await storage.getGig(gigId);
      if (!gig || gig.posterId !== currentUser.id) {
        return res.status(403).json({ message: "Not authorized to update this gig" });
      }

      const success = await storage.updateGigStatus(gigId, status);
      
      if (!success) {
        return res.status(400).json({ message: "Unable to update gig status" });
      }

      res.json({ message: "Gig status updated" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI-powered recommendations
  app.get("/api/gigs/recommendations", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (currentUser.userType !== 'seeker') {
        return res.status(403).json({ message: "Only gig seekers can get recommendations" });
      }

      if (!currentUser.skills || currentUser.skills.length === 0) {
        return res.json([]);
      }

      const recommendations = await generateGigRecommendations(
        currentUser.skills,
        currentUser.location,
        [] // user preferences could be added later
      );

      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/gigs/analysis", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (currentUser.userType !== 'poster') {
        return res.status(403).json({ message: "Only gig posters can view analytics" });
      }

      const gigs = await storage.getGigsByPoster(currentUser.id);
      
      // Simple analytics - could be enhanced with AI insights
      const analytics = {
        totalGigs: gigs.length,
        completedGigs: gigs.filter(g => g.status === 'completed').length,
        activeGigs: gigs.filter(g => g.status === 'open' || g.status === 'assigned').length,
        totalSpent: gigs.filter(g => g.status === 'completed').reduce((sum, g) => sum + g.budget, 0),
        averageGigValue: gigs.length > 0 ? gigs.reduce((sum, g) => sum + g.budget, 0) / gigs.length : 0,
        popularCategories: gigs.reduce((acc, gig) => {
          acc[gig.category] = (acc[gig.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
