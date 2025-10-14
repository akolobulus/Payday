# Payday - Instant Gigs Platform for Nigerian Youth

## Overview

Payday is a full-stack web application designed to connect Nigerian youth with instant-paying gigs. The platform serves as a marketplace where gig seekers (students, fresh graduates) can find quick work opportunities, while gig posters (businesses, individuals) can find reliable help for their tasks. The core value proposition is instant payment upon gig completion, addressing the financial needs of young Nigerians who need money "today, not tomorrow."

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with React 18+ using TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing with dashboard pages (/dashboard/seeker, /dashboard/poster)
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **UI Framework**: Radix UI primitives with custom Tailwind CSS styling using the shadcn/ui design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom color scheme (Payday Blue #0029F7, Payday Yellow #FDF00B)
- **AI Integration**: Gemini AI for job matching, recommendations, and gig analysis

### Backend Architecture
- **Server**: Express.js with TypeScript for REST API endpoints
- **Authentication**: Simple email/password with automatic dashboard redirection based on user type
- **Data Layer**: In-memory storage (MemStorage class) with full CRUD operations for users and gigs
- **Validation**: Shared Zod schemas between frontend and backend for consistent validation
- **AI Services**: Gemini API integration for personalized recommendations and job matching
- **Development**: Hot module replacement via Vite integration in development mode

### Data Storage Architecture
- **Database Schema**: Extended to include gigs table with comprehensive gig management and gigApplications table for application tracking
- **User Management**: Support for both gig seekers and gig posters with role-based fields
- **Gig Management**: Complete gig lifecycle management (create, apply, assign, complete)
- **Application Management**: Track gig applications with status (pending, accepted, rejected) and cover letters
- **Audio Features**: Support for audio descriptions on gigs and optional audio recordings on applications
- **Current Implementation**: In-memory storage with test data for immediate functionality (3-5 mock applicants per gig)
- **Migration Ready**: Drizzle configuration and schema prepared for PostgreSQL deployment

### Authentication & Authorization
- **Current State**: Basic email/password authentication with automatic dashboard routing and working demo account buttons
- **User Types**: Dual-role system with separate dashboards for 'seeker' and 'poster' user types
- **Demo Accounts**: One-click demo login buttons for team@payday.ng (poster) and demo@payday.ng (seeker) with automatic dashboard redirection
- **Session Management**: Simple in-memory user tracking for development
- **Post-Login Flow**: Automatic redirection to role-appropriate dashboard after authentication
- **Security**: Password hashing not yet implemented (development phase)

### AI Integration Architecture
- **Gemini Integration**: AI-powered job matching and recommendations using Google's Gemini API
- **Job Matching**: Intelligent compatibility scoring between user skills and gig requirements
- **Personalized Recommendations**: AI-generated gig suggestions based on user profile and preferences
- **Gig Analysis**: Automatic categorization and skill extraction from gig descriptions
- **Nigerian Context**: AI prompts optimized for Nigerian gig economy and same-day payment focus

### Dashboard Architecture
- **Gig Seeker Dashboard**: 
  - Prominent wallet section showing available balance and pending payments
  - Browse gigs with dual search (title + location) and sidebar filters
  - Enhanced gig cards showing audio descriptions and applicant counts
  - Apply to gigs with cover letter and optional audio recording
  - AI recommendations and application tracking
  - Pending payment indicators for gigs awaiting completion confirmation
  - Fund wallet and withdraw options
  - Profile management with video calls integration
- **Gig Poster Dashboard**: 
  - Prominent wallet section showing available balance, total spent, and funds in escrow
  - Create and manage posted gigs with modern job portal design
  - Add audio descriptions when creating gigs to explain requirements
  - View and manage applications with accept/reject functionality
  - Applicant count displayed on each gig card
  - View applicant details including cover letters and audio recordings
  - Fund escrow payment (with 12% platform fee disclosure)
  - Analytics, business profile, and video calls
  - Completion confirmation for work approval/refund
- **Real-time Updates**: Optimistic updates and cache invalidation for immediate UI feedback
- **Responsive Design**: Mobile-first approach optimized for Nigerian youth usage patterns

### Audio Features Architecture
- **Audio Descriptions**: Gig posters can add audio recordings to explain gig requirements
- **HTML5 Audio Playback**: Resilient audio player with play/pause controls and error handling
- **Application Recordings**: Gig seekers can attach audio recordings to their applications
- **State Management**: Proper audio lifecycle management with cleanup and error recovery
- **Error Handling**: Displays error state when audio fails to load, allows retry on transient failures
- **Event Handling**: Automatically resets playback when audio ends, cleans up listeners on unmount

### Applicant Management System
- **Application Tracking**: Complete CRUD operations for gig applications
- **Status Management**: Track application status (pending, accepted, rejected)
- **Cover Letters**: Applicants can submit cover letters with their applications
- **Applicant Count**: Display number of applicants on each gig card
- **Accept/Reject UI**: Gig posters can review and manage applicants
- **Mock Data**: 3-5 test applicants per gig for demonstration purposes
- **API Endpoints**: RESTful endpoints for creating, listing, and updating applications

### Escrow Payment System
- **Wallet Management**: Each user has a wallet with available balance, pending balance (in escrow), and transaction history
- **Payment Workflow**:
  1. Poster assigns seeker to gig → Status: "assigned_pending_funding"
  2. Poster funds escrow (gig amount + 12% platform fee) → Status: "assigned"
  3. Money held securely in escrow (visible in pending balance)
  4. Seeker completes work and marks as complete → Status: "pending_completion"
  5. Poster confirms completion → Status: "awaiting_mutual_confirmation"
  6. Both parties confirm → Payment released to seeker, Status: "completed"
  7. If poster doesn't confirm or rejects → Refund issued to poster
- **Fund/Withdraw**: Users can fund wallets via payment providers and withdraw earnings to verified payment methods
- **Platform Fee**: 12% fee included in escrow funding, deducted from poster's payment
- **Payment Security**: All payments held in escrow until mutual confirmation of gig completion

## External Dependencies

### Database & ORM
- **Drizzle ORM**: Type-safe SQL toolkit for PostgreSQL integration
- **Neon Database**: Serverless PostgreSQL provider (configured but not actively used)
- **Connection Pool**: PostgreSQL connection management via @neondatabase/serverless

### UI & Design
- **Radix UI**: Headless component primitives for accessibility and flexibility
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide Icons**: Modern icon library for consistent iconography
- **Inter Font**: Google Fonts integration for typography

### Development Tools
- **TypeScript**: Full-stack type safety with strict configuration
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Replit Integration**: Development environment optimization and runtime error handling

### Frontend Libraries
- **TanStack Query**: Advanced data fetching and caching
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Type-safe CSS class composition

### Development & Build
- **Vite**: Modern build tool with HMR and optimized bundling
- **TSX**: TypeScript execution for development server
- **Wouter**: Minimalist routing library for single-page applications