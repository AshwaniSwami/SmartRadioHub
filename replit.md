# SMART Radio Content Management System

## Overview

SMART Radio is a comprehensive content management platform designed for radio scriptwriting and content workflow management. The application provides a multi-stage approval process with role-based permissions, enabling teams to collaborate on script creation, review, and production management.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Rich Text Editing**: TipTap editor for script content creation
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

## Key Components

### Authentication System
- Replit Auth integration using OpenID Connect
- Session-based authentication with PostgreSQL session storage
- Role-based access control (scriptwriter, producer, program_manager, administrator)
- Automatic session management and user provisioning

### Database Schema
- **Users**: Profile management with role-based permissions
- **Projects**: Organizational units for grouping scripts
- **Topics**: Tagging system for content categorization
- **Scripts**: Core content entities with rich text support
- **Activity Logs**: Audit trail for system actions
- **Sessions**: Secure session storage for authentication

### Content Management
- Rich text editor for script creation and editing
- Multi-status workflow (draft, submitted, under_review, approved, etc.)
- Project-based organization with hierarchical permissions
- Topic tagging system for content discovery
- Activity logging for audit trails

### User Interface
- Responsive design optimized for desktop and mobile
- Dark/light theme support with CSS custom properties
- Sidebar navigation with role-based menu items
- Dashboard with statistics and recent activity
- Comprehensive script management interface

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions are stored in PostgreSQL, user profiles are synchronized
2. **Content Creation**: Scripts are created with rich text editor, saved with draft status, associated with projects and topics
3. **Review Process**: Scripts progress through workflow states based on user roles and permissions
4. **Data Persistence**: All operations use Drizzle ORM with PostgreSQL for consistent data management
5. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation

## External Dependencies

### Database
- **PostgreSQL**: Primary data store using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with migration support
- **Connection Pooling**: Neon serverless connection pooling for scalability

### Authentication
- **Replit Auth**: OAuth 2.0/OpenID Connect provider
- **Session Storage**: PostgreSQL-backed session store with automatic cleanup

### UI Framework
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Comprehensive icon library

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static typing for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- Replit-hosted development with hot module replacement
- PostgreSQL database provisioned via Replit modules
- Environment variables managed through Replit secrets

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static files served directly by Express in production

### Hosting
- Replit autoscale deployment target
- Port 5000 (internal) mapped to port 80 (external)
- Node.js 20 runtime environment

### Database
- PostgreSQL 16 with automatic migrations via Drizzle
- Environment-based connection string configuration
- Session storage integrated with authentication system

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```