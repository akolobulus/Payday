# Payday - Instant Gigs Platform for Nigerian Youth

## Overview

Payday is a full-stack web application designed to connect Nigerian youth with instant-paying gigs. The platform serves as a marketplace where gig seekers (students, fresh graduates) can find quick work opportunities, while gig posters (businesses, individuals) can find reliable help for their tasks. The core value proposition is instant payment upon gig completion, addressing the financial needs of young Nigerians who need money "today, not tomorrow."

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with React 18+ using TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **UI Framework**: Radix UI primitives with custom Tailwind CSS styling using the shadcn/ui design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom color scheme (Payday Blue #1f5cf4, Payday Yellow #ffde00)

### Backend Architecture
- **Server**: Express.js with TypeScript for REST API endpoints
- **Authentication**: Currently using simple email/password with in-memory session storage
- **Data Layer**: Currently using in-memory storage (MemStorage class) with interfaces designed for easy migration to persistent storage
- **Validation**: Shared Zod schemas between frontend and backend for consistent validation
- **Development**: Hot module replacement via Vite integration in development mode

### Data Storage Architecture
- **Database Schema**: Designed for PostgreSQL using Drizzle ORM with type-safe queries
- **User Management**: Support for both gig seekers and gig posters with role-based fields
- **Current Implementation**: In-memory storage for development/testing
- **Migration Ready**: Drizzle configuration and schema prepared for PostgreSQL deployment

### Authentication & Authorization
- **Current State**: Basic email/password authentication with server-side session management
- **User Types**: Dual-role system supporting 'seeker' and 'poster' user types
- **Session Management**: Express sessions with in-memory storage
- **Security**: Password hashing not yet implemented (development phase)

### UI/UX Architecture
- **Design System**: Custom implementation of shadcn/ui with Nigerian youth-focused branding
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Component Structure**: Modular React components with clear separation between sections
- **Accessibility**: Radix UI primitives provide built-in accessibility features
- **Animation**: CSS-based animations for interactive elements and page transitions

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