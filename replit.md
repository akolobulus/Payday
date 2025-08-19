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
- **Database Schema**: Extended to include gigs table with comprehensive gig management
- **User Management**: Support for both gig seekers and gig posters with role-based fields
- **Gig Management**: Complete gig lifecycle management (create, apply, assign, complete)
- **Current Implementation**: In-memory storage with test data for immediate functionality
- **Migration Ready**: Drizzle configuration and schema prepared for PostgreSQL deployment

### Authentication & Authorization
- **Current State**: Basic email/password authentication with automatic dashboard routing
- **User Types**: Dual-role system with separate dashboards for 'seeker' and 'poster' user types
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
- **Gig Seeker Dashboard**: Browse gigs, AI recommendations, application tracking, profile management
- **Gig Poster Dashboard**: Create gigs, manage posted gigs, analytics, business profile
- **Real-time Updates**: Optimistic updates and cache invalidation for immediate UI feedback
- **Responsive Design**: Mobile-first approach optimized for Nigerian youth usage patterns

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