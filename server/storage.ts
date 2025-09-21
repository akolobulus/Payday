import { type User, type InsertUser, type Gig, type InsertGig, type Review, type InsertReview, type CompletionConfirmation, type InsertCompletionConfirmation } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gigs: Map<string, Gig>;
  private reviews: Map<string, Review>;
  private completionConfirmations: Map<string, CompletionConfirmation>;

  constructor() {
    this.users = new Map();
    this.gigs = new Map();
    this.reviews = new Map();
    this.completionConfirmations = new Map();
    this.initializeTestUsers();
    this.initializeTestGigs();
    this.initializeTestReviews();
  }

  private initializeTestUsers() {
    // Test Gig Poster Account
    const posterUser: User = {
      id: "test-poster-1",
      email: "officialarikpa@gmail.com",
      password: "123456789",
      firstName: "Akolo",
      lastName: "Bulus",
      phone: "+234 704 200 1836",
      location: "jos",
      userType: "poster",
      skills: null,
      businessName: "Lumina Services",
      isVerified: true,
      createdAt: new Date(),
    };

    // Test Gig Seeker Account
    const seekerUser: User = {
      id: "test-seeker-1",
      email: "bulusakolo6@gmail.com",
      password: "123456789",
      firstName: "Bulus",
      lastName: "Akolo",
      phone: "+234 703 123 4567",
      location: "jos",
      userType: "seeker",
      skills: ["delivery", "tutoring", "data-entry"],
      businessName: null,
      isVerified: true,
      createdAt: new Date(),
    };

    this.users.set(posterUser.id, posterUser);
    this.users.set(seekerUser.id, seekerUser);
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
    if (gig && gig.status === "open") {
      gig.seekerId = seekerId;
      gig.status = "assigned";
      this.gigs.set(gigId, gig);
      return true;
    }
    return false;
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

    if (userType === 'seeker') {
      confirmation.confirmedBySeeker = true;
      confirmation.seekerConfirmedAt = new Date();
    } else if (userType === 'poster') {
      confirmation.confirmedByPoster = true;
      confirmation.posterConfirmedAt = new Date();
    }

    this.completionConfirmations.set(confirmation.id, confirmation);

    // Check if both parties have confirmed and update gig status
    if (confirmation.confirmedBySeeker && confirmation.confirmedByPoster) {
      await this.updateGigStatus(gigId, "completed");
    } else {
      await this.updateGigStatus(gigId, "awaiting_mutual_confirmation");
    }

    return true;
  }

  async checkMutualConfirmation(gigId: string): Promise<boolean> {
    const confirmation = await this.getCompletionConfirmation(gigId);
    return confirmation ? (!!confirmation.confirmedBySeeker && !!confirmation.confirmedByPoster) : false;
  }
}

export const storage = new MemStorage();
