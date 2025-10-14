import { type User, type InsertUser, type Gig, type InsertGig, type Review, type InsertReview, type CompletionConfirmation, type InsertCompletionConfirmation, type VideoCallSession, type InsertVideoCallSession, type Wallet, type InsertWallet, type PaymentMethod, type InsertPaymentMethod, type AddPaymentMethod, type EscrowTransaction, type InsertEscrowTransaction, type Transaction, type InsertTransaction, type Message, type InsertMessage, type Badge, type InsertBadge, type DailyStreak, type InsertDailyStreak, type AIAssistantChat, type InsertAIAssistantChat, type BudgetTracking, type InsertBudgetTracking, type SavingsVault, type InsertSavingsVault, type Course, type InsertCourse, type UserCourseProgress, type InsertUserCourseProgress, type Microloan, type InsertMicroloan, type GigApplication, type InsertGigApplication, type UpdateApplicationStatus } from "@shared/schema";
import { randomUUID } from "crypto";
import { encryptSensitiveData, decryptSensitiveData, validateNigerianBankAccount } from "./payment-providers";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Gig management
  createGig(gig: InsertGig & { posterId: string }): Promise<Gig>;
  getGig(id: string): Promise<Gig | undefined>;
  getAllGigs(): Promise<Gig[]>;
  getAvailableGigs(): Promise<Gig[]>;
  getGigsByPoster(posterId: string): Promise<Gig[]>;
  getGigsBySeeker(seekerId: string): Promise<Gig[]>;
  applyToGig(gigId: string, seekerId: string): Promise<boolean>;
  assignSeekerToGig(gigId: string, seekerId: string): Promise<boolean>;
  updateGigStatus(gigId: string, status: string): Promise<boolean>;
  
  // Review management
  createReview(review: InsertReview & { reviewerId: string }): Promise<Review>;
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  getReviewsForUser(userId: string): Promise<Review[]>;
  getReviewsByGig(gigId: string): Promise<Review[]>;
  getExistingReview(reviewerId: string, revieweeId: string, gigId: string): Promise<Review | undefined>;
  getUserRating(userId: string): Promise<{ averageRating: number; reviewCount: number }>;
  
  // Completion confirmation management
  createCompletionConfirmation(confirmation: InsertCompletionConfirmation): Promise<CompletionConfirmation>;
  getCompletionConfirmation(gigId: string): Promise<CompletionConfirmation | undefined>;
  updateCompletionConfirmation(gigId: string, userType: 'seeker' | 'poster'): Promise<boolean>;
  checkMutualConfirmation(gigId: string): Promise<boolean>;
  
  // Video call session management
  createVideoCallSession(session: InsertVideoCallSession & { initiatedBy: string }): Promise<VideoCallSession>;
  getVideoCallSession(id: string): Promise<VideoCallSession | undefined>;
  getVideoCallSessionByRoomId(roomId: string): Promise<VideoCallSession | undefined>;
  getVideoCallSessionsByGig(gigId: string): Promise<VideoCallSession[]>;
  getVideoCallSessionsByUser(userId: string): Promise<VideoCallSession[]>;
  updateVideoCallSessionStatus(roomId: string, status: string, startedAt?: Date, endedAt?: Date, duration?: number): Promise<boolean>;
  
  // Wallet management
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByUser(userId: string): Promise<Wallet | undefined>;
  updateWalletBalance(walletId: string, amount: number, pendingAmount?: number): Promise<boolean>;
  
  // Payment method management
  createPaymentMethod(paymentMethod: AddPaymentMethod & { userId: string }): Promise<PaymentMethod>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  getPaymentMethodsByUser(userId: string): Promise<PaymentMethod[]>;
  getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | undefined>;
  updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<boolean>;
  deletePaymentMethod(id: string): Promise<boolean>;
  setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean>;
  validatePaymentMethod(paymentMethodId: string, userId: string): Promise<{ valid: boolean; error?: string }>;
  
  // Escrow transaction management
  createEscrowTransaction(escrow: InsertEscrowTransaction): Promise<EscrowTransaction>;
  getEscrowTransaction(id: string): Promise<EscrowTransaction | undefined>;
  getEscrowTransactionByGig(gigId: string): Promise<EscrowTransaction | undefined>;
  updateEscrowStatus(id: string, status: string, timestamp?: Date, reference?: string): Promise<boolean>;
  getEscrowTransactionsByUser(userId: string, userType: 'poster' | 'seeker'): Promise<EscrowTransaction[]>;
  
  // Transaction logging
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByWallet(walletId: string): Promise<Transaction[]>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransactionsByEscrow(escrowId: string): Promise<Transaction[]>;
  
  // Message management
  createMessage(message: InsertMessage & { senderId: string }): Promise<Message>;
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByGig(gigId: string): Promise<Message[]>;
  getMessagesBetweenUsers(senderId: string, receiverId: string, gigId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<boolean>;
  getUnreadMessageCount(userId: string, gigId?: string): Promise<number>;
  
  // Payment operations
  processEscrowPayment(gigId: string, posterId: string, amount: number, seekerId?: string): Promise<{ success: boolean; escrowId?: string; error?: string }>;
  releaseEscrowPayment(gigId: string): Promise<{ success: boolean; error?: string }>;
  refundEscrowPayment(gigId: string, reason: string): Promise<{ success: boolean; error?: string }>;
  withdrawFunds(userId: string, amount: number, paymentMethodId: string): Promise<{ success: boolean; reference?: string; error?: string }>;
  
  // AI Assistant management
  createAIChat(chat: InsertAIAssistantChat): Promise<AIAssistantChat>;
  getAIChats(userId: string): Promise<AIAssistantChat[]>;
  
  // Badge management
  getUserBadges(userId: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Daily streak management
  getDailyStreaks(userId: string): Promise<DailyStreak[]>;
  createDailyStreak(streak: InsertDailyStreak): Promise<DailyStreak>;
  
  // Budget tracking management
  getUserBudgets(userId: string): Promise<BudgetTracking[]>;
  createBudget(budget: InsertBudgetTracking): Promise<BudgetTracking>;
  
  // Savings vault management
  getSavingsVault(userId: string): Promise<SavingsVault | undefined>;
  updateSavingsVault(data: { userId: string; targetAmount?: number; autoSavePercentage?: number }): Promise<SavingsVault>;
  withdrawFromSavings(userId: string, amount: number): Promise<{ success: boolean; error?: string }>;
  
  // Microloan management
  getUserMicroloans(userId: string): Promise<Microloan[]>;
  createMicroloan(loan: InsertMicroloan): Promise<Microloan>;
  repayMicroloan(loanId: string, userId: string): Promise<{ success: boolean; error?: string }>;
  getUserById(userId: string): Promise<User | undefined>;
  
  // Course management
  getAllCourses(): Promise<Course[]>;
  getUserCourseProgress(userId: string): Promise<UserCourseProgress[]>;
  
  // Gig Application management
  createGigApplication(application: InsertGigApplication & { seekerId: string }): Promise<GigApplication>;
  getApplicationsByGig(gigId: string): Promise<GigApplication[]>;
  getApplicationsBySeeker(seekerId: string): Promise<GigApplication[]>;
  updateApplicationStatus(applicationId: string, status: string): Promise<boolean>;
  getApplicationCountByGig(gigId: string): Promise<number>;
  getApplication(id: string): Promise<GigApplication | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gigs: Map<string, Gig>;
  private reviews: Map<string, Review>;
  private completionConfirmations: Map<string, CompletionConfirmation>;
  private videoCallSessions: Map<string, VideoCallSession>;
  private wallets: Map<string, Wallet>;
  private paymentMethods: Map<string, PaymentMethod>;
  private escrowTransactions: Map<string, EscrowTransaction>;
  private transactions: Map<string, Transaction>;
  private messages: Map<string, Message>;
  private badges: Map<string, Badge>;
  private dailyStreaks: Map<string, DailyStreak>;
  private aiAssistantChats: Map<string, AIAssistantChat>;
  private budgetTracking: Map<string, BudgetTracking>;
  private savingsVaults: Map<string, SavingsVault>;
  private microloans: Map<string, Microloan>;
  private courses: Map<string, Course>;
  private userCourseProgress: Map<string, UserCourseProgress>;
  private gigApplications: Map<string, GigApplication>;

  constructor() {
    this.users = new Map();
    this.gigs = new Map();
    this.reviews = new Map();
    this.completionConfirmations = new Map();
    this.videoCallSessions = new Map();
    this.wallets = new Map();
    this.paymentMethods = new Map();
    this.escrowTransactions = new Map();
    this.transactions = new Map();
    this.messages = new Map();
    this.badges = new Map();
    this.dailyStreaks = new Map();
    this.aiAssistantChats = new Map();
    this.budgetTracking = new Map();
    this.savingsVaults = new Map();
    this.microloans = new Map();
    this.courses = new Map();
    this.userCourseProgress = new Map();
    this.gigApplications = new Map();
    this.initializeTestUsers();
    this.initializeTestGigs();
    this.initializeTestReviews();
    this.initializeTestWallets();
    this.initializeTestApplications();
  }

  private initializeTestUsers() {
    // Test Gig Poster Account
    const posterUser: User = {
      id: "test-poster-1",
      email: "team@payday.ng",
      password: "123456789",
      firstName: "Team",
      trustScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalGigsCompleted: 0,
      lastName: "Payday",
      phone: "+234 704 200 1836",
      location: "Lagos",
      userType: "poster",
      skills: null,
      businessName: "Team Payday",
      isVerified: true,
      createdAt: new Date(),
    };

    // Test Gig Seeker Account
    const seekerUser: User = {
      id: "test-seeker-1",
      email: "demo@payday.ng",
      password: "123456789",
      firstName: "Demo",
      lastName: "User",
      phone: "+234 703 123 4567",
      location: "Abuja",
      userType: "seeker",
      skills: ["delivery", "tutoring", "data-entry"],
      businessName: null,
      isVerified: true,
      trustScore: 750,
      currentStreak: 5,
      longestStreak: 12,
      totalGigsCompleted: 15,
      createdAt: new Date(),
    };

    this.users.set(posterUser.id, posterUser);
    this.users.set(seekerUser.id, seekerUser);
  }

  private initializeTestWallets() {
    // Create wallets for test users
    const posterWallet: Wallet = {
      id: "wallet-poster-1",
      userId: "test-poster-1",
      balance: 5000000, // ₦50,000 in kobo
      pendingBalance: 0,
      totalEarnings: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const seekerWallet: Wallet = {
      id: "wallet-seeker-1", 
      userId: "test-seeker-1",
      balance: 2500000, // ₦25,000 in kobo
      pendingBalance: 0,
      totalEarnings: 12000000, // ₦120,000 in kobo
      totalSpent: 9500000, // ₦95,000 in kobo
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.wallets.set(posterWallet.id, posterWallet);
    this.wallets.set(seekerWallet.id, seekerWallet);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      skills: insertUser.skills || null,
      businessName: insertUser.businessName || null,
      isVerified: false,
      trustScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalGigsCompleted: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  private initializeTestGigs() {
    const testGigs: Gig[] = [
      {
        id: "gig-1",
        title: "Social Media Content Creation",
        description: "Create engaging posts and stories for a small business Instagram account. Need 10 posts and 5 stories for the week.",
        audioDescriptionUrl: null,
        budget: 15000,
        category: "Social Media",
        location: "Jos, Plateau",
        urgency: "medium",
        estimatedDuration: "3-4 hours",
        skillsRequired: ["social-media", "content-creation", "photography"],
        posterId: "test-poster-1",
        seekerId: null,
        status: "open",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        id: "gig-2",
        title: "Delivery Service - Electronics",
        description: "Pick up laptop from computer village and deliver to customer in Jos North. Must handle with care.",
        audioDescriptionUrl: null,
        budget: 3000,
        category: "Delivery",
        location: "Jos North, Plateau",
        urgency: "high",
        estimatedDuration: "2 hours",
        skillsRequired: ["delivery", "motorcycle", "customer-service"],
        posterId: "test-poster-1",
        seekerId: null,
        status: "open",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        id: "gig-3",
        title: "Data Entry - Customer Database",
        description: "Enter 200 customer records into Excel spreadsheet. All information will be provided in handwritten forms.",
        audioDescriptionUrl: null,
        budget: 8000,
        category: "Data Entry",
        location: "Remote",
        urgency: "low",
        estimatedDuration: "4-5 hours",
        skillsRequired: ["data-entry", "excel", "attention-to-detail"],
        posterId: "test-poster-1",
        seekerId: null,
        status: "open",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        id: "gig-4",
        title: "Math Tutoring Session",
        description: "Teach secondary school student calculus and algebra. One-on-one session at student's home.",
        audioDescriptionUrl: null,
        budget: 5000,
        category: "Tutoring",
        location: "Jos South, Plateau",
        urgency: "medium",
        estimatedDuration: "2 hours",
        skillsRequired: ["tutoring", "mathematics", "teaching"],
        posterId: "test-poster-1",
        seekerId: null,
        status: "open",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        id: "gig-5",
        title: "Event Photography",
        description: "Photograph a birthday party - candid shots, group photos, and party highlights. Need edited photos within 24 hours.",
        audioDescriptionUrl: null,
        budget: 20000,
        category: "Photography",
        location: "Jos, Plateau",
        urgency: "high",
        estimatedDuration: "4-6 hours",
        skillsRequired: ["photography", "photo-editing", "event-coverage"],
        posterId: "test-poster-1",
        seekerId: null,
        status: "open",
        createdAt: new Date(),
        completedAt: null,
      }
    ];

    testGigs.forEach(gig => {
      this.gigs.set(gig.id, gig);
    });
  }

  // Gig methods
  async createGig(insertGig: InsertGig & { posterId: string }): Promise<Gig> {
    const id = randomUUID();
    const gig: Gig = {
      ...insertGig,
      id,
      audioDescriptionUrl: insertGig.audioDescriptionUrl || null,
      seekerId: null,
      status: "open",
      createdAt: new Date(),
      completedAt: null,
    };
    
    this.gigs.set(id, gig);
    return gig;
  }

  async getGig(id: string): Promise<Gig | undefined> {
    return this.gigs.get(id);
  }

  async getAllGigs(): Promise<Gig[]> {
    return Array.from(this.gigs.values());
  }

  async getAvailableGigs(): Promise<Gig[]> {
    return Array.from(this.gigs.values()).filter(gig => gig.status === "open");
  }

  async getGigsByPoster(posterId: string): Promise<Gig[]> {
    return Array.from(this.gigs.values()).filter(gig => gig.posterId === posterId);
  }

  async getGigsBySeeker(seekerId: string): Promise<Gig[]> {
    return Array.from(this.gigs.values()).filter(gig => gig.seekerId === seekerId);
  }

  async applyToGig(gigId: string, seekerId: string): Promise<boolean> {
    const gig = this.gigs.get(gigId);
    if (!gig || gig.status !== "open") {
      return false;
    }

    // Check if gig is already assigned
    if (gig.seekerId) {
      return false; // Gig is already assigned to someone
    }

    // Just mark that this seeker applied - don't assign yet
    // Assignment will happen when poster explicitly assigns via /assign-seeker endpoint
    gig.status = "has_applications";
    this.gigs.set(gigId, gig);

    return true;
  }

  async assignSeekerToGig(gigId: string, seekerId: string): Promise<boolean> {
    const gig = this.gigs.get(gigId);
    if (!gig || !["open", "has_applications"].includes(gig.status)) {
      return false;
    }

    // Verify seeker exists
    const seeker = await this.getUser(seekerId);
    if (!seeker || seeker.userType !== 'seeker') {
      return false;
    }

    // Assign seeker to gig but don't mark as assigned yet - that happens after funding
    gig.seekerId = seekerId;
    gig.status = "assigned_pending_funding";
    this.gigs.set(gigId, gig);

    return true;
  }

  async updateGigStatus(gigId: string, status: string): Promise<boolean> {
    const gig = this.gigs.get(gigId);
    if (gig) {
      gig.status = status;
      if (status === "completed") {
        gig.completedAt = new Date();
      }
      this.gigs.set(gigId, gig);
      return true;
    }
    return false;
  }

  private initializeTestReviews() {
    // Add some test reviews for demonstration
    const testReviews: Review[] = [
      {
        id: "review-1",
        reviewerId: "test-poster-1",
        revieweeId: "test-seeker-1",
        gigId: "gig-1",
        rating: 5,
        comment: "Excellent work! Very professional and delivered on time. Would definitely hire again.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        id: "review-2",
        reviewerId: "test-seeker-1",
        revieweeId: "test-poster-1",
        gigId: "gig-1",
        rating: 4,
        comment: "Great client to work with. Clear instructions and prompt payment. Highly recommended!",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      }
    ];

    testReviews.forEach(review => {
      this.reviews.set(review.id, review);
    });
  }

  // Review methods
  async createReview(insertReview: InsertReview & { reviewerId: string }): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    
    this.reviews.set(id, review);
    return review;
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.reviewerId === userId);
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.revieweeId === userId);
  }

  async getReviewsByGig(gigId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.gigId === gigId);
  }

  async getExistingReview(reviewerId: string, revieweeId: string, gigId: string): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      review => review.reviewerId === reviewerId && 
                review.revieweeId === revieweeId && 
                review.gigId === gigId
    );
  }

  async getUserRating(userId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const userReviews = await this.getReviewsForUser(userId);
    
    if (userReviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / userReviews.length;
    
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: userReviews.length
    };
  }

  // Completion confirmation methods
  async createCompletionConfirmation(insertConfirmation: InsertCompletionConfirmation): Promise<CompletionConfirmation> {
    const id = randomUUID();
    const confirmation: CompletionConfirmation = {
      ...insertConfirmation,
      id,
      confirmedBySeeker: false,
      confirmedByPoster: false,
      seekerConfirmedAt: null,
      posterConfirmedAt: null,
      createdAt: new Date(),
    };
    
    this.completionConfirmations.set(id, confirmation);
    return confirmation;
  }

  async getCompletionConfirmation(gigId: string): Promise<CompletionConfirmation | undefined> {
    return Array.from(this.completionConfirmations.values()).find(
      confirmation => confirmation.gigId === gigId
    );
  }

  async updateCompletionConfirmation(gigId: string, userType: 'seeker' | 'poster'): Promise<boolean> {
    const confirmation = await this.getCompletionConfirmation(gigId);
    if (!confirmation) {
      return false;
    }

    // Check if user has already confirmed (idempotency check)
    const alreadyConfirmed = userType === 'seeker' ? confirmation.confirmedBySeeker : confirmation.confirmedByPoster;
    
    if (!alreadyConfirmed) {
      if (userType === 'seeker') {
        confirmation.confirmedBySeeker = true;
        confirmation.seekerConfirmedAt = new Date();
      } else if (userType === 'poster') {
        confirmation.confirmedByPoster = true;
        confirmation.posterConfirmedAt = new Date();
      }
      this.completionConfirmations.set(confirmation.id, confirmation);
    }

    // Check if both parties have confirmed (atomic mutual confirmation check)
    const mutuallyConfirmed = confirmation.confirmedBySeeker && confirmation.confirmedByPoster;
    
    if (mutuallyConfirmed) {
      // Get current gig status to ensure idempotency
      const gig = await this.getGig(gigId);
      if (!gig) {
        return false;
      }

      // Only process completion if not already completed (idempotency)
      if (gig.status !== "completed") {
        try {
          // Start atomic operation: update status first
          await this.updateGigStatus(gigId, "completed");
          
          // Automatically release escrow payment (with built-in idempotency)
          const releaseResult = await this.releaseEscrowPayment(gigId);
          if (!releaseResult.success) {
            // Log error but don't revert - payment can be released manually later
            console.error(`Automatic payment release failed for gig ${gigId}:`, releaseResult.error);
            
            // Create a transaction log for the failed release attempt
            await this.createTransaction({
              userId: gig.posterId,
              walletId: "system", // placeholder for system transactions
              escrowId: null,
              type: "fee",
              amount: 0,
              balanceBefore: 0,
              balanceAfter: 0,
              description: `Failed automatic payment release for gig ${gigId}: ${releaseResult.error}`,
              reference: `failed-release-${gigId}`,
              status: "failed",
              metadata: JSON.stringify({ 
                gigId, 
                error: releaseResult.error,
                timestamp: new Date().toISOString(),
                action: "automatic_release"
              }),
            }).catch(() => {}); // Ignore logging errors
          }
        } catch (error) {
          console.error(`Critical error in completion confirmation for gig ${gigId}:`, error);
          // Even on error, we don't revert the confirmation to prevent losing completion state
        }
      }
    } else {
      // Update status to awaiting mutual confirmation if not already there
      const gig = await this.getGig(gigId);
      if (gig && !["completed", "awaiting_mutual_confirmation"].includes(gig.status)) {
        await this.updateGigStatus(gigId, "awaiting_mutual_confirmation");
      }
    }

    return true;
  }

  async checkMutualConfirmation(gigId: string): Promise<boolean> {
    const confirmation = await this.getCompletionConfirmation(gigId);
    return confirmation ? (!!confirmation.confirmedBySeeker && !!confirmation.confirmedByPoster) : false;
  }

  // Video call session methods
  async createVideoCallSession(insertSession: InsertVideoCallSession & { initiatedBy: string }): Promise<VideoCallSession> {
    const id = randomUUID();
    const session: VideoCallSession = {
      ...insertSession,
      id,
      status: "pending",
      startedAt: null,
      endedAt: null,
      duration: null,
      createdAt: new Date(),
    };
    
    this.videoCallSessions.set(id, session);
    return session;
  }

  async getVideoCallSession(id: string): Promise<VideoCallSession | undefined> {
    return this.videoCallSessions.get(id);
  }

  async getVideoCallSessionByRoomId(roomId: string): Promise<VideoCallSession | undefined> {
    return Array.from(this.videoCallSessions.values()).find(session => session.roomId === roomId);
  }

  async getVideoCallSessionsByGig(gigId: string): Promise<VideoCallSession[]> {
    return Array.from(this.videoCallSessions.values()).filter(session => session.gigId === gigId);
  }

  async getVideoCallSessionsByUser(userId: string): Promise<VideoCallSession[]> {
    return Array.from(this.videoCallSessions.values()).filter(
      session => session.posterId === userId || session.seekerId === userId || session.initiatedBy === userId
    );
  }

  async updateVideoCallSessionStatus(
    roomId: string, 
    status: string, 
    startedAt?: Date, 
    endedAt?: Date, 
    duration?: number
  ): Promise<boolean> {
    const session = await this.getVideoCallSessionByRoomId(roomId);
    if (!session) {
      return false;
    }

    session.status = status;
    if (startedAt) session.startedAt = startedAt;
    if (endedAt) session.endedAt = endedAt;
    if (duration !== undefined) session.duration = duration;

    this.videoCallSessions.set(session.id, session);
    return true;
  }

  // Wallet management methods
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = {
      ...insertWallet,
      id,
      balance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.wallets.set(id, wallet);
    return wallet;
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByUser(userId: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(wallet => wallet.userId === userId);
  }

  async updateWalletBalance(walletId: string, amount: number, pendingAmount?: number): Promise<boolean> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) return false;

    wallet.balance += amount;
    if (pendingAmount !== undefined) {
      wallet.pendingBalance += pendingAmount;
    }
    wallet.updatedAt = new Date();
    
    this.wallets.set(walletId, wallet);
    return true;
  }

  // Payment method management
  async createPaymentMethod(paymentMethodData: AddPaymentMethod & { userId: string }): Promise<PaymentMethod> {
    const id = randomUUID();
    
    // Encrypt sensitive data
    const encryptedData = { ...paymentMethodData };
    if (encryptedData.accountNumber) {
      encryptedData.accountNumber = encryptSensitiveData(encryptedData.accountNumber);
    }
    if (encryptedData.phoneNumber) {
      encryptedData.phoneNumber = encryptSensitiveData(encryptedData.phoneNumber);
    }
    
    const paymentMethod: PaymentMethod = {
      ...encryptedData,
      id,
      isVerified: false,
      createdAt: new Date(),
      accountNumber: encryptedData.accountNumber || null,
      accountName: encryptedData.accountName || null,
      bankCode: encryptedData.bankCode || null,
      phoneNumber: encryptedData.phoneNumber || null,
      isDefault: encryptedData.isDefault || false,
    };
    
    this.paymentMethods.set(id, paymentMethod);
    return paymentMethod;
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async getPaymentMethodsByUser(userId: string): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(pm => pm.userId === userId);
  }

  async getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | undefined> {
    return Array.from(this.paymentMethods.values()).find(pm => pm.userId === userId && pm.isDefault);
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<boolean> {
    const paymentMethod = this.paymentMethods.get(id);
    if (!paymentMethod) return false;

    Object.assign(paymentMethod, updates);
    this.paymentMethods.set(id, paymentMethod);
    return true;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    // First, unset all current defaults for this user
    const userPaymentMethods = await this.getPaymentMethodsByUser(userId);
    for (const pm of userPaymentMethods) {
      if (pm.isDefault) {
        pm.isDefault = false;
        this.paymentMethods.set(pm.id, pm);
      }
    }

    // Set the new default
    const paymentMethod = this.paymentMethods.get(paymentMethodId);
    if (!paymentMethod || paymentMethod.userId !== userId) return false;
    
    paymentMethod.isDefault = true;
    this.paymentMethods.set(paymentMethodId, paymentMethod);
    return true;
  }

  async validatePaymentMethod(paymentMethodId: string, userId: string): Promise<{ valid: boolean; error?: string }> {
    const paymentMethod = await this.getPaymentMethod(paymentMethodId);
    
    if (!paymentMethod) {
      return { valid: false, error: "Payment method not found" };
    }
    
    if (paymentMethod.userId !== userId) {
      return { valid: false, error: "Payment method does not belong to user" };
    }
    
    if (paymentMethod.type === 'bank_account') {
      if (!paymentMethod.accountNumber || !paymentMethod.bankCode) {
        return { valid: false, error: "Bank account details incomplete" };
      }
      
      try {
        const decryptedAccountNumber = decryptSensitiveData(paymentMethod.accountNumber);
        const validation = validateNigerianBankAccount(decryptedAccountNumber, paymentMethod.bankCode);
        if (!validation.valid) {
          return validation;
        }
      } catch (error) {
        return { valid: false, error: "Invalid encrypted account data" };
      }
    }
    
    if (paymentMethod.type === 'mobile_money') {
      if (!paymentMethod.phoneNumber) {
        return { valid: false, error: "Mobile money phone number required" };
      }
      
      try {
        const decryptedPhone = decryptSensitiveData(paymentMethod.phoneNumber);
        // Basic Nigerian phone number validation
        if (!/^(\+234|234|0)[7-9][0-1]\d{8}$/.test(decryptedPhone.replace(/\s+/g, ''))) {
          return { valid: false, error: "Invalid Nigerian phone number format" };
        }
      } catch (error) {
        return { valid: false, error: "Invalid encrypted phone data" };
      }
    }
    
    return { valid: true };
  }

  // Escrow transaction management
  async createEscrowTransaction(escrowData: InsertEscrowTransaction): Promise<EscrowTransaction> {
    const id = randomUUID();
    const escrow: EscrowTransaction = {
      ...escrowData,
      id,
      status: "pending",
      seekerId: escrowData.seekerId || null,
      platformFee: escrowData.platformFee || 0,
      escrowedAt: null,
      releasedAt: null,
      refundedAt: null,
      paymentReference: null,
      releaseReference: null,
      createdAt: new Date(),
    };
    
    this.escrowTransactions.set(id, escrow);
    return escrow;
  }

  async getEscrowTransaction(id: string): Promise<EscrowTransaction | undefined> {
    return this.escrowTransactions.get(id);
  }

  async getEscrowTransactionByGig(gigId: string): Promise<EscrowTransaction | undefined> {
    return Array.from(this.escrowTransactions.values()).find(escrow => escrow.gigId === gigId);
  }

  async updateEscrowStatus(id: string, status: string, timestamp?: Date, reference?: string): Promise<boolean> {
    const escrow = this.escrowTransactions.get(id);
    if (!escrow) return false;

    escrow.status = status;
    
    if (status === "escrowed" && timestamp) {
      escrow.escrowedAt = timestamp;
      escrow.paymentReference = reference || null;
    } else if (status === "released" && timestamp) {
      escrow.releasedAt = timestamp;
      escrow.releaseReference = reference || null;
    } else if (status === "refunded" && timestamp) {
      escrow.refundedAt = timestamp;
    }

    this.escrowTransactions.set(id, escrow);
    return true;
  }

  async getEscrowTransactionsByUser(userId: string, userType: 'poster' | 'seeker'): Promise<EscrowTransaction[]> {
    const field = userType === 'poster' ? 'posterId' : 'seekerId';
    return Array.from(this.escrowTransactions.values()).filter(escrow => escrow[field] === userId);
  }

  // Message management methods
  async createMessage(insertMessage: InsertMessage & { senderId: string }): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    };
    
    this.messages.set(id, message);
    return message;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByGig(gigId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.gigId === gigId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getMessagesBetweenUsers(senderId: string, receiverId: string, gigId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.gigId === gigId && 
        ((message.senderId === senderId && message.receiverId === receiverId) ||
         (message.senderId === receiverId && message.receiverId === senderId))
      )
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async markMessageAsRead(messageId: string): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (!message) return false;

    message.isRead = true;
    message.readAt = new Date();
    this.messages.set(messageId, message);
    return true;
  }

  async getUnreadMessageCount(userId: string, gigId?: string): Promise<number> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.receiverId === userId && 
        !message.isRead &&
        (gigId ? message.gigId === gigId : true)
      ).length;
  }

  // Transaction logging
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...transactionData,
      id,
      status: transactionData.status || "completed",
      escrowId: transactionData.escrowId || null,
      reference: transactionData.reference || null,
      metadata: transactionData.metadata || null,
      createdAt: new Date(),
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByWallet(walletId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.walletId === walletId);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }

  async getTransactionsByEscrow(escrowId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.escrowId === escrowId);
  }

  // Payment operations
  async processEscrowPayment(gigId: string, posterId: string, amount: number, seekerId?: string): Promise<{ success: boolean; escrowId?: string; error?: string }> {
    try {
      // Get poster's wallet
      const posterWallet = await this.getWalletByUser(posterId);
      if (!posterWallet) {
        return { success: false, error: "Poster wallet not found" };
      }

      // Check if poster has sufficient balance
      if (posterWallet.balance < amount) {
        return { success: false, error: "Insufficient balance" };
      }

      // Calculate platform fee (12% as mentioned in pitch deck)
      const platformFee = Math.floor(amount * 0.12);
      const totalAmount = amount + platformFee;

      if (posterWallet.balance < totalAmount) {
        return { success: false, error: "Insufficient balance including platform fee" };
      }

      // Create escrow transaction with proper seeker assignment
      const escrow = await this.createEscrowTransaction({
        gigId,
        posterId,
        seekerId: seekerId || null,
        amount,
        platformFee,
      });

      // Deduct from poster's balance and add to pending
      await this.updateWalletBalance(posterWallet.id, -totalAmount, totalAmount);
      
      // Log the transaction
      await this.createTransaction({
        userId: posterId,
        walletId: posterWallet.id,
        escrowId: escrow.id,
        type: "escrow_hold",
        amount: -totalAmount,
        balanceBefore: posterWallet.balance,
        balanceAfter: posterWallet.balance - totalAmount,
        description: `Escrow payment for gig ${gigId}`,
        reference: `escrow-${escrow.id}`,
        status: "completed",
        metadata: JSON.stringify({ gigId, platformFee, seekerId }),
      });

      // Update escrow status to escrowed
      await this.updateEscrowStatus(escrow.id, "escrowed", new Date(), `payment-${randomUUID()}`);

      return { success: true, escrowId: escrow.id };
    } catch (error) {
      return { success: false, error: "Payment processing failed" };
    }
  }

  async releaseEscrowPayment(gigId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const escrow = await this.getEscrowTransactionByGig(gigId);
      if (!escrow) {
        return { success: false, error: "Escrow transaction not found" };
      }

      // Idempotency check - if already released, return success
      if (escrow.status === "released") {
        return { success: true };
      }

      if (escrow.status !== "escrowed") {
        return { success: false, error: `Escrow is not in escrowed state (current: ${escrow.status})` };
      }

      if (!escrow.seekerId) {
        return { success: false, error: "No seeker assigned to this gig" };
      }

      // Get wallets
      const posterWallet = await this.getWalletByUser(escrow.posterId);
      const seekerWallet = await this.getWalletByUser(escrow.seekerId);
      
      if (!posterWallet || !seekerWallet) {
        return { success: false, error: "User wallets not found" };
      }

      // Release payment to seeker
      const seekerAmount = escrow.amount;
      await this.updateWalletBalance(seekerWallet.id, seekerAmount);
      
      // Update poster's pending balance
      await this.updateWalletBalance(posterWallet.id, 0, -(escrow.amount + escrow.platformFee));

      // Update seeker's total earnings
      const updatedSeekerWallet = await this.getWallet(seekerWallet.id);
      if (updatedSeekerWallet) {
        updatedSeekerWallet.totalEarnings += seekerAmount;
        this.wallets.set(seekerWallet.id, updatedSeekerWallet);
      }

      // Update poster's total spent
      const updatedPosterWallet = await this.getWallet(posterWallet.id);
      if (updatedPosterWallet) {
        updatedPosterWallet.totalSpent += (escrow.amount + escrow.platformFee);
        this.wallets.set(posterWallet.id, updatedPosterWallet);
      }

      // Log transactions
      await this.createTransaction({
        userId: escrow.seekerId,
        walletId: seekerWallet.id,
        escrowId: escrow.id,
        type: "escrow_release",
        amount: seekerAmount,
        balanceBefore: seekerWallet.balance,
        balanceAfter: seekerWallet.balance + seekerAmount,
        description: `Payment received for gig ${gigId}`,
        reference: `release-${randomUUID()}`,
        status: "completed",
        metadata: JSON.stringify({ gigId, originalAmount: escrow.amount }),
      });

      // Update escrow status
      await this.updateEscrowStatus(escrow.id, "released", new Date(), `release-${randomUUID()}`);

      return { success: true };
    } catch (error) {
      return { success: false, error: "Payment release failed" };
    }
  }

  async refundEscrowPayment(gigId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const escrow = await this.getEscrowTransactionByGig(gigId);
      if (!escrow) {
        return { success: false, error: "Escrow transaction not found" };
      }

      if (escrow.status !== "escrowed") {
        return { success: false, error: "Escrow is not in escrowed state" };
      }

      const posterWallet = await this.getWalletByUser(escrow.posterId);
      if (!posterWallet) {
        return { success: false, error: "Poster wallet not found" };
      }

      // Refund the full amount (including platform fee) back to poster
      const refundAmount = escrow.amount + escrow.platformFee;
      await this.updateWalletBalance(posterWallet.id, refundAmount, -refundAmount);

      // Log the refund transaction
      await this.createTransaction({
        userId: escrow.posterId,
        walletId: posterWallet.id,
        escrowId: escrow.id,
        type: "refund",
        amount: refundAmount,
        balanceBefore: posterWallet.balance,
        balanceAfter: posterWallet.balance + refundAmount,
        description: `Refund for gig ${gigId}: ${reason}`,
        reference: `refund-${randomUUID()}`,
        status: "completed",
        metadata: JSON.stringify({ gigId, reason }),
      });

      // Update escrow status
      await this.updateEscrowStatus(escrow.id, "refunded", new Date());

      return { success: true };
    } catch (error) {
      return { success: false, error: "Refund processing failed" };
    }
  }

  async withdrawFunds(userId: string, amount: number, paymentMethodId: string): Promise<{ success: boolean; reference?: string; error?: string }> {
    try {
      const wallet = await this.getWalletByUser(userId);
      const paymentMethod = await this.getPaymentMethod(paymentMethodId);

      if (!wallet) {
        return { success: false, error: "Wallet not found" };
      }

      if (!paymentMethod || paymentMethod.userId !== userId) {
        return { success: false, error: "Payment method not found" };
      }

      if (!paymentMethod.isVerified) {
        return { success: false, error: "Payment method not verified" };
      }

      if (wallet.balance < amount) {
        return { success: false, error: "Insufficient balance" };
      }

      // Minimum withdrawal is ₦100 (10,000 kobo)
      if (amount < 10000) {
        return { success: false, error: "Minimum withdrawal is ₦100" };
      }

      // Deduct from wallet
      await this.updateWalletBalance(wallet.id, -amount);

      const reference = `withdraw-${randomUUID()}`;

      // Log the withdrawal transaction
      await this.createTransaction({
        userId,
        walletId: wallet.id,
        escrowId: null,
        type: "withdrawal",
        amount: -amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description: `Withdrawal to ${paymentMethod.provider} ${paymentMethod.accountNumber || paymentMethod.phoneNumber}`,
        reference,
        status: "completed",
        metadata: JSON.stringify({ 
          paymentMethodId, 
          provider: paymentMethod.provider,
          accountInfo: paymentMethod.accountNumber || paymentMethod.phoneNumber 
        }),
      });

      return { success: true, reference };
    } catch (error) {
      return { success: false, error: "Withdrawal processing failed" };
    }
  }

  // AI Assistant methods
  async createAIChat(chat: InsertAIAssistantChat): Promise<AIAssistantChat> {
    const newChat: AIAssistantChat = {
      id: randomUUID(),
      ...chat,
      createdAt: new Date(),
    };
    this.aiAssistantChats.set(newChat.id, newChat);
    return newChat;
  }

  async getAIChats(userId: string): Promise<AIAssistantChat[]> {
    return Array.from(this.aiAssistantChats.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  // Badge methods
  async getUserBadges(userId: string): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter(badge => badge.userId === userId)
      .sort((a, b) => b.earnedAt!.getTime() - a.earnedAt!.getTime());
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const newBadge: Badge = {
      id: randomUUID(),
      ...badge,
      earnedAt: new Date(),
    };
    this.badges.set(newBadge.id, newBadge);
    return newBadge;
  }

  // Daily streak methods
  async getDailyStreaks(userId: string): Promise<DailyStreak[]> {
    return Array.from(this.dailyStreaks.values())
      .filter(streak => streak.userId === userId)
      .sort((a, b) => b.streakDate.getTime() - a.streakDate.getTime());
  }

  async createDailyStreak(streak: InsertDailyStreak): Promise<DailyStreak> {
    const newStreak: DailyStreak = {
      id: randomUUID(),
      ...streak,
      gigsCompleted: streak.gigsCompleted || 0,
      createdAt: new Date(),
    };
    this.dailyStreaks.set(newStreak.id, newStreak);
    return newStreak;
  }

  // Budget tracking methods
  async getUserBudgets(userId: string): Promise<BudgetTracking[]> {
    return Array.from(this.budgetTracking.values())
      .filter(budget => budget.userId === userId);
  }

  async createBudget(budget: InsertBudgetTracking): Promise<BudgetTracking> {
    const newBudget: BudgetTracking = {
      id: randomUUID(),
      ...budget,
      spentAmount: budget.spentAmount || 0,
      createdAt: new Date(),
    };
    this.budgetTracking.set(newBudget.id, newBudget);
    return newBudget;
  }

  // Savings vault methods
  async getSavingsVault(userId: string): Promise<SavingsVault | undefined> {
    return Array.from(this.savingsVaults.values())
      .find(vault => vault.userId === userId);
  }

  async updateSavingsVault(data: { userId: string; targetAmount?: number; autoSavePercentage?: number }): Promise<SavingsVault> {
    let vault = await this.getSavingsVault(data.userId);
    
    if (!vault) {
      vault = {
        id: randomUUID(),
        userId: data.userId,
        totalSaved: 0,
        autoSavePercentage: data.autoSavePercentage || 0,
        targetAmount: data.targetAmount || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.savingsVaults.set(vault.id, vault);
    } else {
      if (data.targetAmount !== undefined) vault.targetAmount = data.targetAmount;
      if (data.autoSavePercentage !== undefined) vault.autoSavePercentage = data.autoSavePercentage;
      vault.updatedAt = new Date();
    }
    
    return vault;
  }

  async withdrawFromSavings(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    const vault = await this.getSavingsVault(userId);
    if (!vault) {
      return { success: false, error: "Savings vault not found" };
    }
    
    if (vault.totalSaved < amount) {
      return { success: false, error: "Insufficient savings balance" };
    }
    
    vault.totalSaved -= amount;
    vault.updatedAt = new Date();
    
    const wallet = await this.getWalletByUser(userId);
    if (wallet) {
      await this.updateWalletBalance(wallet.id, amount);
    }
    
    return { success: true };
  }

  // Microloan methods
  async getUserMicroloans(userId: string): Promise<Microloan[]> {
    return Array.from(this.microloans.values())
      .filter(loan => loan.userId === userId);
  }

  async createMicroloan(loan: InsertMicroloan): Promise<Microloan> {
    const newLoan: Microloan = {
      id: randomUUID(),
      ...loan,
      repaidAmount: 0,
      status: "active",
      repaidAt: null,
      createdAt: new Date(),
    };
    this.microloans.set(newLoan.id, newLoan);
    return newLoan;
  }

  async repayMicroloan(loanId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const loan = this.microloans.get(loanId);
    if (!loan) {
      return { success: false, error: "Loan not found" };
    }
    
    if (loan.userId !== userId) {
      return { success: false, error: "Unauthorized: You don't own this loan" };
    }
    
    if (loan.status !== "active") {
      return { success: false, error: "Loan is not active" };
    }
    
    const wallet = await this.getWalletByUser(loan.userId);
    if (!wallet) {
      return { success: false, error: "Wallet not found" };
    }
    
    if (wallet.balance < loan.loanAmount) {
      return { success: false, error: "Insufficient wallet balance" };
    }
    
    loan.repaidAmount = loan.loanAmount;
    loan.status = "repaid";
    loan.repaidAt = new Date();
    
    await this.updateWalletBalance(wallet.id, -loan.loanAmount);
    
    return { success: true };
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.users.get(userId);
  }

  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getUserCourseProgress(userId: string): Promise<UserCourseProgress[]> {
    return Array.from(this.userCourseProgress.values())
      .filter(progress => progress.userId === userId);
  }

  private initializeTestApplications() {
    const mockSeekers = [
      { id: "seeker-app-1", name: "Amina Mohammed", skills: ["social-media", "content-creation"], rating: 4.5 },
      { id: "seeker-app-2", name: "Chidi Okafor", skills: ["delivery", "customer-service"], rating: 4.8 },
      { id: "seeker-app-3", name: "Fatima Bello", skills: ["data-entry", "excel"], rating: 4.2 },
      { id: "seeker-app-4", name: "Tunde Adebayo", skills: ["tutoring", "mathematics"], rating: 4.9 },
      { id: "seeker-app-5", name: "Blessing Nwosu", skills: ["photography", "photo-editing"], rating: 4.6 },
    ];

    const testGigs = ["gig-1", "gig-2", "gig-3", "gig-4", "gig-5"];

    testGigs.forEach((gigId, gigIndex) => {
      const numApplications = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numApplications && i < mockSeekers.length; i++) {
        const seeker = mockSeekers[i];
        const application: GigApplication = {
          id: `app-${gigId}-${seeker.id}`,
          gigId,
          seekerId: seeker.id,
          status: "pending",
          coverLetter: `I am ${seeker.name} and I'm very interested in this gig. With my skills in ${seeker.skills.join(", ")}, I believe I can deliver excellent results. I have a ${seeker.rating}/5 rating and would love to work on this project.`,
          audioUrl: null,
          createdAt: new Date(Date.now() - (i * 3600000)),
        };
        this.gigApplications.set(application.id, application);
      }
    });
  }

  async createGigApplication(insertApplication: InsertGigApplication & { seekerId: string }): Promise<GigApplication> {
    const id = randomUUID();
    const application: GigApplication = {
      ...insertApplication,
      id,
      status: "pending",
      audioUrl: insertApplication.audioUrl || null,
      createdAt: new Date(),
    };
    
    this.gigApplications.set(id, application);
    
    const gig = await this.getGig(insertApplication.gigId);
    if (gig && gig.status === "open") {
      gig.status = "has_applications";
      this.gigs.set(gig.id, gig);
    }
    
    return application;
  }

  async getApplicationsByGig(gigId: string): Promise<GigApplication[]> {
    return Array.from(this.gigApplications.values())
      .filter(app => app.gigId === gigId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getApplicationsBySeeker(seekerId: string): Promise<GigApplication[]> {
    return Array.from(this.gigApplications.values())
      .filter(app => app.seekerId === seekerId);
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<boolean> {
    const application = this.gigApplications.get(applicationId);
    if (!application) {
      return false;
    }

    application.status = status;
    this.gigApplications.set(applicationId, application);

    if (status === "accepted") {
      await this.assignSeekerToGig(application.gigId, application.seekerId);
      
      const otherApplications = await this.getApplicationsByGig(application.gigId);
      otherApplications.forEach(app => {
        if (app.id !== applicationId && app.status === "pending") {
          app.status = "rejected";
          this.gigApplications.set(app.id, app);
        }
      });
    }

    return true;
  }

  async getApplicationCountByGig(gigId: string): Promise<number> {
    const applications = await this.getApplicationsByGig(gigId);
    return applications.length;
  }

  async getApplication(id: string): Promise<GigApplication | undefined> {
    return this.gigApplications.get(id);
  }
}

export const storage = new MemStorage();
