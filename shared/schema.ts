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
  status: text("status").notNull().default("open"), // 'open', 'has_applications', 'assigned_pending_funding', 'assigned', 'pending_completion', 'awaiting_mutual_confirmation', 'completed', 'cancelled'
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

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  balance: integer("balance").notNull().default(0), // Balance in kobo (smallest currency unit)
  pendingBalance: integer("pending_balance").notNull().default(0), // Funds in escrow
  totalEarnings: integer("total_earnings").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'bank_account', 'mobile_money', 'card'
  provider: text("provider").notNull(), // 'kuda', 'opay', 'palmpay', 'gtbank', etc.
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  bankCode: text("bank_code"),
  phoneNumber: text("phone_number"), // for mobile money
  isDefault: boolean("is_default").default(false),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const escrowTransactions = pgTable("escrow_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gigId: varchar("gig_id").notNull().references(() => gigs.id),
  posterId: varchar("poster_id").notNull().references(() => users.id),
  seekerId: varchar("seeker_id").references(() => users.id), // null if not assigned yet
  amount: integer("amount").notNull(), // Amount in kobo
  platformFee: integer("platform_fee").notNull().default(0), // Platform commission in kobo
  status: text("status").notNull().default("pending"), // 'pending', 'escrowed', 'released', 'refunded', 'disputed'
  escrowedAt: timestamp("escrowed_at"),
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  paymentReference: text("payment_reference"), // External payment gateway reference
  releaseReference: text("release_reference"), // External payout reference
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id),
  escrowId: varchar("escrow_id").references(() => escrowTransactions.id),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'refund', 'fee'
  amount: integer("amount").notNull(), // Amount in kobo (positive for credit, negative for debit)
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  description: text("description").notNull(),
  reference: text("reference"), // External reference for tracking
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gigId: varchar("gig_id").notNull().references(() => gigs.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // 'text', 'image', 'file'
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
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

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  userId: true,
  type: true,
  provider: true,
  accountNumber: true,
  accountName: true,
  bankCode: true,
  phoneNumber: true,
  isDefault: true,
}).extend({
  type: z.enum(["bank_account", "mobile_money", "card"], {
    required_error: "Payment method type is required",
  }),
  provider: z.string().min(1, "Provider is required"),
});

export const insertEscrowTransactionSchema = createInsertSchema(escrowTransactions).pick({
  gigId: true,
  posterId: true,
  seekerId: true,
  amount: true,
  platformFee: true,
}).extend({
  amount: z.number().min(100, "Minimum amount is ₦1.00"), // 100 kobo = ₦1
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  walletId: true,
  escrowId: true,
  type: true,
  amount: true,
  balanceBefore: true,
  balanceAfter: true,
  description: true,
  reference: true,
  status: true,
  metadata: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  gigId: true,
  receiverId: true,
  content: true,
  type: true,
}).extend({
  content: z.string().min(1, "Message content is required").max(1000, "Message must be less than 1000 characters"),
  type: z.enum(["text", "image", "file"]).default("text"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const addPaymentMethodSchema = z.object({
  type: z.enum(["bank_account", "mobile_money", "card"]),
  provider: z.string().min(1, "Provider is required"),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  bankCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  isDefault: z.boolean().default(false),
}).refine((data) => {
  if (data.type === "bank_account") {
    return data.accountNumber && data.accountName && data.bankCode;
  }
  if (data.type === "mobile_money") {
    return data.phoneNumber;
  }
  return true;
}, {
  message: "Required fields missing for payment method type",
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertCompletionConfirmation = z.infer<typeof insertCompletionConfirmationSchema>;
export type InsertVideoCallSession = z.infer<typeof insertVideoCallSessionSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type InsertEscrowTransaction = z.infer<typeof insertEscrowTransactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type AddPaymentMethod = z.infer<typeof addPaymentMethodSchema>;

export type User = typeof users.$inferSelect;
export type Gig = typeof gigs.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type CompletionConfirmation = typeof completionConfirmations.$inferSelect;
export type VideoCallSession = typeof videoCallSessions.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
