import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertGigSchema, insertReviewSchema, insertCompletionConfirmationSchema, insertVideoCallSessionSchema, addPaymentMethodSchema, insertEscrowTransactionSchema, insertMessageSchema, insertAIAssistantChatSchema, insertBadgeSchema, insertDailyStreakSchema, insertBudgetTrackingSchema, insertSavingsVaultSchema, insertMicroloanSchema } from "@shared/schema";
import { generateGigRecommendations, matchUserToGig, analyzeGigDescription } from "./gemini";
import { z } from "zod";
import { nanoid } from "nanoid";
// @ts-ignore: flutterwave-node-v3 doesn't have proper TypeScript definitions
import Flutterwave from 'flutterwave-node-v3';

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

  app.put("/api/user/profile", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const profileSchema = z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        phone: z.string().min(10),
        location: z.string().min(2),
        businessName: z.string().optional(),
        skills: z.array(z.string()).optional(),
      });

      const profileData = profileSchema.parse(req.body);
      
      // Update current user object
      currentUser = {
        ...currentUser,
        ...profileData,
      };

      res.json(currentUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Track processed transactions to prevent double-spending
  const processedTransactions = new Set<string>();

  // Flutterwave payment routes
  app.post("/api/flutterwave/verify-payment", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { transaction_id, tx_ref } = req.body;

      // Check for required environment variables
      if (!process.env.FLW_SECRET_KEY || !process.env.VITE_FLW_PUBLIC_KEY) {
        return res.status(500).json({ 
          message: "Payment verification unavailable - server configuration error" 
        });
      }

      // Idempotency check - prevent duplicate processing
      if (processedTransactions.has(tx_ref)) {
        return res.status(409).json({ 
          message: "Transaction already processed" 
        });
      }

      // Initialize Flutterwave with real keys
      const flw = new Flutterwave(
        process.env.VITE_FLW_PUBLIC_KEY,
        process.env.FLW_SECRET_KEY
      );

      try {
        // CRITICAL: Always verify with Flutterwave API - never trust client
        const response = await flw.Transaction.verify({ id: transaction_id });

        if (!response.data) {
          return res.status(400).json({ 
            message: "Invalid transaction verification response" 
          });
        }

        const { status, tx_ref: verifiedTxRef, amount, currency } = response.data;

        // Verify transaction details match our expectations
        if (
          status === "successful" && 
          verifiedTxRef === tx_ref && 
          currency === "NGN" &&
          amount > 0
        ) {
          // Mark transaction as processed
          processedTransactions.add(tx_ref);

          // Get user wallet
          let wallet = await storage.getWalletByUser(currentUser.id);
          if (!wallet) {
            wallet = await storage.createWallet({ userId: currentUser.id });
          }

          // Convert amount from Naira to kobo (multiply by 100)
          const amountInKobo = Math.round(amount * 100);

          // Add funds to wallet using verified amount
          await storage.updateWalletBalance(wallet.id, amountInKobo);

          // Create transaction record with verified data
          await storage.createTransaction({
            type: "deposit",
            description: `Wallet top-up via Flutterwave`,
            userId: currentUser.id,
            amount: amountInKobo,
            walletId: wallet.id,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance + amountInKobo,
            reference: transaction_id.toString(),
            metadata: JSON.stringify({ 
              payment_method: "flutterwave", 
              tx_ref: verifiedTxRef,
              verified_amount: amount,
              currency: currency
            }),
          });

          res.json({ 
            success: true, 
            message: "Payment verified and wallet updated",
            amount: amountInKobo
          });
        } else {
          res.status(400).json({ 
            success: false, 
            message: `Payment verification failed: ${status}`,
            details: { status, tx_ref: verifiedTxRef, currency }
          });
        }
      } catch (flwError) {
        console.error('Flutterwave verification error:', flwError);
        res.status(500).json({ 
          message: "Payment verification failed - unable to verify with payment provider" 
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: "Payment verification failed" });
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
      
      // Check gig exists and is open
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      if (gig.status !== 'open') {
        return res.status(400).json({ message: "This gig is no longer available" });
      }

      // Check if seeker already applied or gig is already assigned
      if (gig.seekerId) {
        return res.status(400).json({ message: "This gig is already assigned to a seeker" });
      }

      const success = await storage.applyToGig(gigId, currentUser.id);
      
      if (!success) {
        return res.status(400).json({ message: "Unable to apply to gig" });
      }

      res.json({ 
        message: "Application successful! The poster will review and assign the gig soon.",
        gigId,
        status: "application_submitted"
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gigs/:gigId/assign-seeker", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (currentUser.userType !== 'poster') {
        return res.status(403).json({ message: "Only gig posters can assign seekers" });
      }

      const { gigId } = req.params;
      const { seekerId } = req.body;
      
      if (!seekerId) {
        return res.status(400).json({ message: "Seeker ID is required" });
      }

      // Verify gig ownership
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      if (gig.posterId !== currentUser.id) {
        return res.status(403).json({ message: "You can only assign seekers to your own gigs" });
      }

      const success = await storage.assignSeekerToGig(gigId, seekerId);
      
      if (!success) {
        return res.status(400).json({ message: "Unable to assign seeker to gig" });
      }

      res.json({ 
        message: "Seeker assigned successfully. Please fund the escrow to complete the assignment.",
        gigId,
        seekerId,
        status: "assigned_pending_funding"
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gigs/:gigId/fund-escrow", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (currentUser.userType !== 'poster') {
        return res.status(403).json({ message: "Only gig posters can fund escrow" });
      }

      const { gigId } = req.params;
      
      // Verify gig and assignment
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      if (gig.posterId !== currentUser.id) {
        return res.status(403).json({ message: "You can only fund escrow for your own gigs" });
      }

      if (gig.status !== "assigned_pending_funding") {
        return res.status(400).json({ message: "Gig must have an assigned seeker before funding escrow" });
      }

      if (!gig.seekerId) {
        return res.status(400).json({ message: "No seeker assigned to this gig" });
      }

      // Fund escrow with proper seeker assignment
      const result = await storage.processEscrowPayment(gigId, currentUser.id, gig.budget, gig.seekerId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      // Update gig status to assigned now that escrow is funded
      await storage.updateGigStatus(gigId, "assigned");

      res.json({ 
        message: "Escrow funded successfully! The gig is now fully assigned.",
        escrowId: result.escrowId,
        gigStatus: "assigned"
      });
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

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const reviewData = insertReviewSchema.parse(req.body);
      
      // Verify the gig exists and has mutual completion confirmation
      const gig = await storage.getGig(reviewData.gigId);
      if (!gig || gig.status !== 'completed') {
        return res.status(400).json({ message: "Can only review gigs with mutual completion confirmation" });
      }

      // Verify mutual completion confirmation exists
      const isMutuallyConfirmed = await storage.checkMutualConfirmation(reviewData.gigId);
      if (!isMutuallyConfirmed) {
        return res.status(400).json({ message: "Both parties must confirm completion before reviews can be submitted" });
      }

      // Verify the user was involved in this gig
      const isInvolvedInGig = gig.posterId === currentUser.id || gig.seekerId === currentUser.id;
      if (!isInvolvedInGig) {
        return res.status(403).json({ message: "Can only review gigs you were involved in" });
      }

      // Prevent self-review
      if (reviewData.revieweeId === currentUser.id) {
        return res.status(400).json({ message: "Cannot review yourself" });
      }

      // Check if review already exists
      const existingReview = await storage.getExistingReview(
        currentUser.id,
        reviewData.revieweeId,
        reviewData.gigId
      );
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this user for this gig" });
      }

      // Verify the reviewee was involved in this gig
      const revieweeInvolvedInGig = gig.posterId === reviewData.revieweeId || gig.seekerId === reviewData.revieweeId;
      if (!revieweeInvolvedInGig) {
        return res.status(400).json({ message: "The reviewee was not involved in this gig" });
      }

      const review = await storage.createReview({
        ...reviewData,
        reviewerId: currentUser.id,
      });

      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getReviewsForUser(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/gig/:gigId", async (req, res) => {
    try {
      const { gigId } = req.params;
      const reviews = await storage.getReviewsByGig(gigId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:userId/rating", async (req, res) => {
    try {
      const { userId } = req.params;
      const rating = await storage.getUserRating(userId);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/by-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messageData = insertMessageSchema.parse(req.body);
      
      // Verify the gig exists
      const gig = await storage.getGig(messageData.gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      // Verify the user is involved in this gig (either poster or seeker)
      const isInvolvedInGig = gig.posterId === currentUser.id || gig.seekerId === currentUser.id;
      if (!isInvolvedInGig) {
        return res.status(403).json({ message: "You can only send messages for gigs you are involved in" });
      }

      // Verify the receiver is also involved in this gig
      const receiverInvolvedInGig = gig.posterId === messageData.receiverId || gig.seekerId === messageData.receiverId;
      if (!receiverInvolvedInGig) {
        return res.status(400).json({ message: "Receiver must be involved in this gig" });
      }

      // Prevent sending messages to yourself
      if (messageData.receiverId === currentUser.id) {
        return res.status(400).json({ message: "Cannot send message to yourself" });
      }

      const message = await storage.createMessage({
        ...messageData,
        senderId: currentUser.id,
      });

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/messages/gig/:gigId", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      
      // Verify the gig exists
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      // Verify the user is involved in this gig
      const isInvolvedInGig = gig.posterId === currentUser.id || gig.seekerId === currentUser.id;
      if (!isInvolvedInGig) {
        return res.status(403).json({ message: "You can only view messages for gigs you are involved in" });
      }

      const messages = await storage.getMessagesByGig(gigId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/messages/conversation/:gigId/:otherUserId", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId, otherUserId } = req.params;
      
      // Verify the gig exists
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      // Verify both users are involved in this gig
      const isCurrentUserInvolvedInGig = gig.posterId === currentUser.id || gig.seekerId === currentUser.id;
      const isOtherUserInvolvedInGig = gig.posterId === otherUserId || gig.seekerId === otherUserId;
      
      if (!isCurrentUserInvolvedInGig || !isOtherUserInvolvedInGig) {
        return res.status(403).json({ message: "Both users must be involved in this gig" });
      }

      const messages = await storage.getMessagesBetweenUsers(currentUser.id, otherUserId, gigId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/messages/:messageId/read", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { messageId } = req.params;
      
      // Get the message
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Verify the current user is the receiver
      if (message.receiverId !== currentUser.id) {
        return res.status(403).json({ message: "You can only mark your own messages as read" });
      }

      const success = await storage.markMessageAsRead(messageId);
      if (!success) {
        return res.status(500).json({ message: "Failed to mark message as read" });
      }

      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/messages/unread-count", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.query;
      const count = await storage.getUnreadMessageCount(currentUser.id, gigId as string);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Completion confirmation routes
  app.post("/api/gigs/:gigId/initiate-completion", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      
      // Verify the gig exists and user is involved
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      const isInvolvedInGig = gig.posterId === currentUser.id || gig.seekerId === currentUser.id;
      if (!isInvolvedInGig) {
        return res.status(403).json({ message: "Not authorized to initiate completion for this gig" });
      }

      if (gig.status !== "assigned") {
        return res.status(400).json({ message: "Can only initiate completion for assigned gigs" });
      }

      // Check if completion confirmation already exists
      let confirmation = await storage.getCompletionConfirmation(gigId);
      
      if (!confirmation) {
        // Create new completion confirmation
        confirmation = await storage.createCompletionConfirmation({ gigId });
        
        // Update gig status to pending_completion
        await storage.updateGigStatus(gigId, "pending_completion");
      }

      res.status(201).json({ 
        message: "Completion initiated",
        confirmation 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gigs/:gigId/confirm-completion", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      
      // Verify the gig exists and user is involved
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      const isInvolvedInGig = gig.posterId === currentUser.id || gig.seekerId === currentUser.id;
      if (!isInvolvedInGig) {
        return res.status(403).json({ message: "Not authorized to confirm completion for this gig" });
      }

      // Check if gig is in a confirmable state
      if (!["pending_completion", "awaiting_mutual_confirmation"].includes(gig.status)) {
        return res.status(400).json({ message: "Gig is not in a state that allows completion confirmation" });
      }

      // Get or create completion confirmation
      let confirmation = await storage.getCompletionConfirmation(gigId);
      if (!confirmation) {
        confirmation = await storage.createCompletionConfirmation({ gigId });
      }

      // Determine user type for this gig
      const userType = gig.posterId === currentUser.id ? 'poster' : 'seeker';
      
      // Check if user has already confirmed
      const alreadyConfirmed = userType === 'poster' ? confirmation.confirmedByPoster : confirmation.confirmedBySeeker;
      if (alreadyConfirmed) {
        return res.status(400).json({ message: "You have already confirmed completion for this gig" });
      }

      // Update confirmation
      const success = await storage.updateCompletionConfirmation(gigId, userType);
      if (!success) {
        return res.status(500).json({ message: "Failed to update completion confirmation" });
      }

      // Get updated confirmation and gig status
      const updatedConfirmation = await storage.getCompletionConfirmation(gigId);
      const updatedGig = await storage.getGig(gigId);

      res.json({ 
        message: "Completion confirmed",
        confirmation: updatedConfirmation,
        gigStatus: updatedGig?.status,
        mutuallyConfirmed: updatedConfirmation?.confirmedBySeeker && updatedConfirmation?.confirmedByPoster
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/gigs/:gigId/completion-status", async (req, res) => {
    try {
      const { gigId } = req.params;
      
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      const confirmation = await storage.getCompletionConfirmation(gigId);
      const isMutuallyConfirmed = await storage.checkMutualConfirmation(gigId);

      res.json({
        gigStatus: gig.status,
        confirmation: confirmation || null,
        mutuallyConfirmed: isMutuallyConfirmed,
        canInitiateCompletion: gig.status === "assigned",
        canConfirmCompletion: ["pending_completion", "awaiting_mutual_confirmation"].includes(gig.status),
        canSubmitReviews: isMutuallyConfirmed
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Video Call Session routes
  app.post("/api/video-calls/create", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.body;
      
      // Verify the gig exists and user is participant
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      // Check if user is either the poster or assigned seeker
      if (gig.posterId !== currentUser.id && gig.seekerId !== currentUser.id) {
        return res.status(403).json({ message: "Not authorized to create video call for this gig" });
      }

      // Check if gig is in assigned status (has a seeker)
      if (!gig.seekerId || gig.status !== "assigned") {
        return res.status(400).json({ message: "Gig must be assigned to a seeker before video call can be initiated" });
      }

      // Check if there's already an active video call session for this gig
      const existingSession = await storage.getVideoCallSessionsByGig(gigId);
      const activeSession = existingSession.find(session => session.status === "active" || session.status === "pending");
      
      if (activeSession) {
        return res.json({
          message: "Video call session already exists",
          session: activeSession,
          roomId: activeSession.roomId
        });
      }

      // Generate unique room ID
      const roomId = `room-${nanoid(12)}`;
      
      const sessionData = {
        gigId,
        roomId,
        posterId: gig.posterId,
        seekerId: gig.seekerId!,
        initiatedBy: currentUser.id
      };

      const session = await storage.createVideoCallSession(sessionData);
      
      res.status(201).json({
        message: "Video call session created",
        session,
        roomId: session.roomId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/video-calls/:roomId/join", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { roomId } = req.params;
      
      const session = await storage.getVideoCallSessionByRoomId(roomId);
      if (!session) {
        return res.status(404).json({ message: "Video call session not found" });
      }

      // Verify user is authorized to join this call
      if (session.posterId !== currentUser.id && session.seekerId !== currentUser.id) {
        return res.status(403).json({ message: "Not authorized to join this video call" });
      }

      // Update session status to active if this is the first join
      if (session.status === "pending") {
        await storage.updateVideoCallSessionStatus(roomId, "active", new Date());
      }

      res.json({
        message: "Joined video call successfully",
        session,
        roomId: session.roomId,
        canJoin: true
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/video-calls/:roomId/end", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { roomId } = req.params;
      const { duration } = req.body; // duration in seconds
      
      const session = await storage.getVideoCallSessionByRoomId(roomId);
      if (!session) {
        return res.status(404).json({ message: "Video call session not found" });
      }

      // Verify user is authorized to end this call
      if (session.posterId !== currentUser.id && session.seekerId !== currentUser.id) {
        return res.status(403).json({ message: "Not authorized to end this video call" });
      }

      // Update session status to ended
      const endedAt = new Date();
      await storage.updateVideoCallSessionStatus(roomId, "ended", undefined, endedAt, duration);

      res.json({
        message: "Video call ended successfully",
        endedAt,
        duration
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/video-calls/:roomId/status", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { roomId } = req.params;
      
      const session = await storage.getVideoCallSessionByRoomId(roomId);
      if (!session) {
        return res.status(404).json({ message: "Video call session not found" });
      }

      // Verify user is authorized to view this call status
      if (session.posterId !== currentUser.id && session.seekerId !== currentUser.id) {
        return res.status(403).json({ message: "Not authorized to view this video call" });
      }

      // Get participant info
      const poster = await storage.getUser(session.posterId);
      const seeker = await storage.getUser(session.seekerId);

      res.json({
        session,
        participants: {
          poster: poster ? { 
            id: poster.id, 
            name: `${poster.firstName} ${poster.lastName}`,
            userType: poster.userType 
          } : null,
          seeker: seeker ? { 
            id: seeker.id, 
            name: `${seeker.firstName} ${seeker.lastName}`,
            userType: seeker.userType 
          } : null
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/video-calls/history", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const sessions = await storage.getVideoCallSessionsByUser(currentUser.id);
      
      // Get additional gig and participant info for each session
      const sessionsWithDetails = await Promise.all(
        sessions.map(async (session) => {
          const gig = await storage.getGig(session.gigId);
          const poster = await storage.getUser(session.posterId);
          const seeker = await storage.getUser(session.seekerId);
          
          return {
            ...session,
            gig: gig ? { id: gig.id, title: gig.title, category: gig.category } : null,
            participants: {
              poster: poster ? { 
                id: poster.id, 
                name: `${poster.firstName} ${poster.lastName}`,
                userType: poster.userType 
              } : null,
              seeker: seeker ? { 
                id: seeker.id, 
                name: `${seeker.firstName} ${seeker.lastName}`,
                userType: seeker.userType 
              } : null
            }
          };
        })
      );

      res.json(sessionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/gigs/:gigId/video-calls", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      
      // Verify the gig exists and user is participant
      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      // Check if user is either the poster or assigned seeker
      if (gig.posterId !== currentUser.id && gig.seekerId !== currentUser.id) {
        return res.status(403).json({ message: "Not authorized to view video calls for this gig" });
      }

      const sessions = await storage.getVideoCallSessionsByGig(gigId);
      
      res.json({
        gigId,
        canInitiateCall: gig.seekerId && gig.status === "assigned",
        hasActiveCall: sessions.some(s => s.status === "active" || s.status === "pending"),
        sessions
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wallet routes
  app.get("/api/wallet", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      let wallet = await storage.getWalletByUser(currentUser.id);
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = await storage.createWallet({ userId: currentUser.id });
      }
      
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/wallet/transactions", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const transactions = await storage.getTransactionsByUser(currentUser.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment methods routes
  app.get("/api/payment-methods", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const paymentMethods = await storage.getPaymentMethodsByUser(currentUser.id);
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const paymentMethodData = addPaymentMethodSchema.parse(req.body);
      const paymentMethod = await storage.createPaymentMethod({
        ...paymentMethodData,
        userId: currentUser.id,
      });

      res.status(201).json(paymentMethod);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/payment-methods/:id", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const paymentMethod = await storage.getPaymentMethod(id);
      
      if (!paymentMethod || paymentMethod.userId !== currentUser.id) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      const success = await storage.updatePaymentMethod(id, req.body);
      if (!success) {
        return res.status(400).json({ message: "Failed to update payment method" });
      }

      const updatedPaymentMethod = await storage.getPaymentMethod(id);
      res.json(updatedPaymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const paymentMethod = await storage.getPaymentMethod(id);
      
      if (!paymentMethod || paymentMethod.userId !== currentUser.id) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      const success = await storage.deletePaymentMethod(id);
      if (!success) {
        return res.status(400).json({ message: "Failed to delete payment method" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/payment-methods/:id/set-default", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const success = await storage.setDefaultPaymentMethod(currentUser.id, id);
      
      if (!success) {
        return res.status(400).json({ message: "Failed to set default payment method" });
      }

      res.json({ message: "Default payment method updated" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Escrow routes
  app.post("/api/escrow/fund-gig", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (currentUser.userType !== 'poster') {
        return res.status(403).json({ message: "Only gig posters can fund escrow" });
      }

      const { gigId } = req.body;
      
      if (!gigId) {
        return res.status(400).json({ message: "Gig ID is required" });
      }

      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      if (gig.posterId !== currentUser.id) {
        return res.status(403).json({ message: "You can only fund your own gigs" });
      }

      if (gig.status !== 'open') {
        return res.status(400).json({ message: "Gig must be open to fund escrow" });
      }

      const result = await storage.processEscrowPayment(gigId, currentUser.id, gig.budget);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({ 
        message: "Escrow funded successfully", 
        escrowId: result.escrowId 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/escrow/gig/:gigId", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      const escrow = await storage.getEscrowTransactionByGig(gigId);
      
      if (!escrow) {
        return res.status(404).json({ message: "Escrow transaction not found" });
      }

      // Check if user is involved in this gig
      if (escrow.posterId !== currentUser.id && escrow.seekerId !== currentUser.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(escrow);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/escrow/release/:gigId", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      const gig = await storage.getGig(gigId);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      // Check if both parties have confirmed completion
      const mutualConfirmation = await storage.checkMutualConfirmation(gigId);
      if (!mutualConfirmation) {
        return res.status(400).json({ message: "Both parties must confirm completion before payment release" });
      }

      const result = await storage.releaseEscrowPayment(gigId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({ message: "Payment released successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/escrow/refund/:gigId", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gigId } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Refund reason is required" });
      }

      const gig = await storage.getGig(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      // Only poster can initiate refund or admin/system
      if (gig.posterId !== currentUser.id) {
        return res.status(403).json({ message: "Only the gig poster can request a refund" });
      }

      const result = await storage.refundEscrowPayment(gigId, reason);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({ message: "Refund processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/escrow/transactions", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userType = currentUser.userType as 'poster' | 'seeker';
      const escrowTransactions = await storage.getEscrowTransactionsByUser(currentUser.id, userType);
      
      res.json(escrowTransactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Withdrawal/Payout endpoints
  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { amount, paymentMethodId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }
      
      if (!paymentMethodId) {
        return res.status(400).json({ message: "Payment method required" });
      }

      // Validate payment method
      const validation = await storage.validatePaymentMethod(paymentMethodId, currentUser.id);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Process withdrawal
      const result = await storage.withdrawFunds(currentUser.id, amount, paymentMethodId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({
        message: "Withdrawal initiated successfully",
        reference: result.reference,
        amount,
        status: "processing"
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/wallet/banks", async (req, res) => {
    try {
      // Import and use payment provider for bank list
      const { PaymentProviderFactory } = await import("./payment-providers");
      const provider = PaymentProviderFactory.getProvider('paystack');
      
      if (!provider) {
        return res.status(500).json({ message: "Payment provider not available" });
      }

      const result = await provider.getBankList();
      
      if (!result.success) {
        return res.status(500).json({ message: result.error || "Failed to fetch bank list" });
      }

      res.json({
        banks: result.banks,
        message: "Bank list retrieved successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wallet/validate-account", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { accountNumber, bankCode } = req.body;
      
      if (!accountNumber || !bankCode) {
        return res.status(400).json({ message: "Account number and bank code are required" });
      }

      // Use payment provider for account validation
      const { PaymentProviderFactory } = await import("./payment-providers");
      const provider = PaymentProviderFactory.getProvider('paystack');
      
      if (!provider) {
        return res.status(500).json({ message: "Payment provider not available" });
      }

      const result = await provider.resolveAccountNumber(accountNumber, bankCode);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Account validation failed" });
      }

      res.json({
        valid: true,
        account_name: result.account_name,
        message: "Account validated successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Withdrawal routes
  app.post("/api/withdraw", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { amount, paymentMethodId } = req.body;
      
      if (!amount || !paymentMethodId) {
        return res.status(400).json({ message: "Amount and payment method are required" });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const result = await storage.withdrawFunds(currentUser.id, amount, paymentMethodId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({ 
        message: "Withdrawal initiated successfully", 
        reference: result.reference 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Currency utility route for Naira formatting
  app.get("/api/currency/format/:amount", async (req, res) => {
    try {
      const { amount } = req.params;
      const amountInKobo = parseInt(amount);
      
      if (isNaN(amountInKobo)) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const amountInNaira = amountInKobo / 100;
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amountInNaira);

      res.json({ 
        amountInKobo, 
        amountInNaira, 
        formatted,
        symbol: '₦' 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Nigerian fintech provider information
  app.get("/api/payment-providers", async (req, res) => {
    try {
      const providers = [
        {
          id: 'kuda',
          name: 'Kuda Bank',
          type: 'mobile_money',
          description: 'Digital bank for young Nigerians',
          supported: true,
          popular: true
        },
        {
          id: 'opay',
          name: 'OPay',
          type: 'mobile_money',
          description: 'Leading fintech for payments and transfers',
          supported: true,
          popular: true
        },
        {
          id: 'palmpay',
          name: 'PalmPay',
          type: 'mobile_money',
          description: 'Mobile payment solution',
          supported: true,
          popular: true
        },
        {
          id: 'gtbank',
          name: 'GTBank',
          type: 'bank_account',
          description: 'Guaranty Trust Bank',
          supported: true,
          popular: false
        },
        {
          id: 'access_bank',
          name: 'Access Bank',
          type: 'bank_account',
          description: 'Access Bank Nigeria',
          supported: true,
          popular: false
        },
        {
          id: 'first_bank',
          name: 'First Bank',
          type: 'bank_account',
          description: 'First Bank of Nigeria',
          supported: true,
          popular: false
        },
        {
          id: 'zenith_bank',
          name: 'Zenith Bank',
          type: 'bank_account',
          description: 'Zenith Bank Nigeria',
          supported: true,
          popular: false
        }
      ];

      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Assistant routes
  app.get("/api/ai/chats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const chats = await storage.getAIChats(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { userId, message } = req.body;
      const user = await storage.getUser(userId);
      
      let responseText = "I'm Zee, your AI assistant! I can help you find gigs, give career advice, or answer questions about the platform. What would you like to know?";
      
      if (user && user.skills && user.skills.length > 0) {
        const gigList = await storage.getAllGigs();
        responseText = `Based on your skills (${user.skills.join(', ')}), I found ${gigList.length} available gigs. Would you like me to recommend the best ones for you?`;
      }
      
      const chat = await storage.createAIChat({
        userId,
        message,
        response: responseText,
        chatType: "general"
      });
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Badges routes
  app.get("/api/badges/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Daily streaks routes
  app.get("/api/streaks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const streaks = await storage.getDailyStreaks(userId);
      res.json(streaks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Budget tracking routes
  app.get("/api/budgets/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const budgets = await storage.getUserBudgets(userId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = insertBudgetTrackingSchema.parse(req.body);
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Savings vault routes
  app.get("/api/savings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const vault = await storage.getSavingsVault(userId);
      res.json(vault);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/savings/update", async (req, res) => {
    try {
      const updateSchema = z.object({
        userId: z.string(),
        targetAmount: z.number().min(0).optional(),
        autoSavePercentage: z.number().min(0).max(50).optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      const vault = await storage.updateSavingsVault(updateData);
      res.json(vault);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/savings/withdraw", async (req, res) => {
    try {
      const { userId, amount } = req.body;
      
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Valid user ID and amount required" });
      }
      
      const result = await storage.withdrawFromSavings(userId, amount);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Withdrawal failed" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Microloans routes
  app.get("/api/microloans/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const loans = await storage.getUserMicroloans(userId);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/microloans/request", async (req, res) => {
    try {
      const { userId, loanAmount } = req.body;
      
      if (!userId || !loanAmount || loanAmount <= 0) {
        return res.status(400).json({ message: "Valid user ID and loan amount required" });
      }
      
      const user = await storage.getUserById(userId);
      
      if (!user || user.trustScore < 500) {
        return res.status(400).json({ message: "Trust score too low for loans" });
      }

      // Check for active loans
      const existingLoans = await storage.getUserMicroloans(userId);
      if (existingLoans.some(loan => loan.status === 'active')) {
        return res.status(400).json({ message: "You already have an active loan" });
      }

      const maxLoan = Math.min(user.trustScore * 10, 50000);
      if (loanAmount > maxLoan) {
        return res.status(400).json({ message: `Loan amount exceeds limit of ₦${maxLoan / 100}` });
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const loan = await storage.createMicroloan({
        userId,
        loanAmount,
        dueDate: dueDate,
      });

      const wallet = await storage.getWalletByUser(userId);
      if (wallet) {
        await storage.updateWalletBalance(wallet.id, loanAmount);
      }
      
      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/microloans/repay", async (req, res) => {
    try {
      const { loanId, userId } = req.body;
      
      if (!loanId || !userId) {
        return res.status(400).json({ message: "Loan ID and User ID are required" });
      }
      
      const result = await storage.repayMicroloan(loanId, userId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Loan repayment failed" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Courses routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/courses/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserCourseProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
