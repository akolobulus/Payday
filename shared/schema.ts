import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  userType: text("user_type").notNull(), // 'seeker' or 'poster'
  skills: text("skills").array(), // for seekers
  businessName: text("business_name"), // for posters
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gigs = pgTable("gigs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: integer("budget").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  urgency: text("urgency").notNull(), // 'low', 'medium', 'high'
  estimatedDuration: text("estimated_duration").notNull(),
  skillsRequired: text("skills_required").array().notNull(),
  posterId: varchar("poster_id").notNull().references(() => users.id),
  seekerId: varchar("seeker_id").references(() => users.id), // null when not assigned
  status: text("status").notNull().default("open"), // 'open', 'assigned', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  location: true,
  userType: true,
  skills: true,
  businessName: true,
});

export const insertGigSchema = createInsertSchema(gigs).pick({
  title: true,
  description: true,
  budget: true,
  category: true,
  location: true,
  urgency: true,
  estimatedDuration: true,
  skillsRequired: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type User = typeof users.$inferSelect;
export type Gig = typeof gigs.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
