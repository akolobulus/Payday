import { type User, type InsertUser, type Gig, type InsertGig } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gigs: Map<string, Gig>;

  constructor() {
    this.users = new Map();
    this.gigs = new Map();
    this.initializeTestUsers();
    this.initializeTestGigs();
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
}

export const storage = new MemStorage();
