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
  status: text("status").notNull().default("open"), // 'open', 'assigned', 'pending_completion', 'awaiting_mutual_confirmation', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  gigId: varchar("gig_id").notNull().references(() => gigs.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const completionConfirmations = pgTable("completion_confirmations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gigId: varchar("gig_id").notNull().references(() => gigs.id),
  confirmedBySeeker: boolean("confirmed_by_seeker").default(false),
  confirmedByPoster: boolean("confirmed_by_poster").default(false),
  seekerConfirmedAt: timestamp("seeker_confirmed_at"),
  posterConfirmedAt: timestamp("poster_confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoCallSessions = pgTable("video_call_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gigId: varchar("gig_id").notNull().references(() => gigs.id),
  roomId: text("room_id").notNull().unique(),
  initiatedBy: varchar("initiated_by").notNull().references(() => users.id), // user who started the call
  posterId: varchar("poster_id").notNull().references(() => users.id),
  seekerId: varchar("seeker_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'ended', 'failed'
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // duration in seconds
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertReviewSchema = createInsertSchema(reviews).pick({
  revieweeId: true,
  gigId: true,
  rating: true,
  comment: true,
}).extend({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(500, "Comment must be less than 500 characters"),
});

export const insertCompletionConfirmationSchema = createInsertSchema(completionConfirmations).pick({
  gigId: true,
});

export const insertVideoCallSessionSchema = createInsertSchema(videoCallSessions).pick({
  gigId: true,
  roomId: true,
  posterId: true,
  seekerId: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertCompletionConfirmation = z.infer<typeof insertCompletionConfirmationSchema>;
export type InsertVideoCallSession = z.infer<typeof insertVideoCallSessionSchema>;
export type User = typeof users.$inferSelect;
export type Gig = typeof gigs.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type CompletionConfirmation = typeof completionConfirmations.$inferSelect;
export type VideoCallSession = typeof videoCallSessions.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
