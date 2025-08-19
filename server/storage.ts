import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
    this.initializeTestUsers();
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
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
