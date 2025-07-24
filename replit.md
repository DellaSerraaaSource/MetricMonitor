# FlowAnalyzer Dashboard

## Overview

FlowAnalyzer is a comprehensive web application for analyzing and visualizing JSON-based workflow files. The system provides detailed insights into flow structure, action analysis, dependency mapping, and generates comprehensive reports for workflow optimization and debugging.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundling**: Vite for development and production builds
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for flow analysis operations
- **File Processing**: Multer for multipart file uploads (JSON flow files)
- **Development**: Full-stack development with Vite middleware integration

### Data Storage Solutions
- **Primary Storage**: PostgreSQL database with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Flow Analysis Engine
- **Parser**: Validates and processes JSON flow files using Zod schemas
- **KPI Calculator**: Computes comprehensive metrics including health scores, complexity indices, and performance indicators
- **Risk Assessment**: Identifies potential security, performance, and maintainability issues

### Dashboard Interface
- **Multi-tab Layout**: Organized into Overview, Explorer, Actions, Dependencies, and Reports sections
- **Interactive Components**: File upload with drag-and-drop, searchable state explorer, and expandable action details
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

### Storage Abstraction
- **Interface-based Design**: IStorage interface allows switching between memory and database storage
- **Development Mode**: MemStorage class for rapid development and testing
- **Production Mode**: Database storage with full persistence and query capabilities

## Data Flow

### File Upload Process
1. User uploads JSON flow file through drag-and-drop or file picker
2. Server validates file format and parses JSON structure
3. Flow analyzer processes the data and calculates KPIs
4. Results are stored in database with generated analysis ID
5. Frontend receives analysis results and updates dashboard

### Analysis Pipeline
1. **Validation**: JSON schema validation using Zod
2. **Parsing**: Extract states, actions, conditions, and outputs
3. **Metrics Calculation**: Generate health scores, complexity indices, and risk factors
4. **Storage**: Persist original JSON, parsed data, and calculated KPIs
5. **Visualization**: Present results through interactive dashboard components

### Real-time Updates
- React Query handles caching and synchronization of analysis data
- Optimistic updates for immediate user feedback
- Automatic cache invalidation on new uploads

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **esbuild**: Fast JavaScript/TypeScript bundler for production
- **tsx**: TypeScript execution for development server

### File Processing
- **multer**: Multipart form data handling for file uploads
- **zod**: Runtime type validation and schema definition

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend with hot reloading
- **Type Checking**: `npm run check` for TypeScript validation
- **Database Operations**: `npm run db:push` for schema synchronization

### Production Build
1. **Frontend Build**: Vite builds optimized React application
2. **Backend Bundle**: esbuild creates single-file Node.js application
3. **Static Assets**: Frontend assets served from `/dist/public`
4. **Database Migration**: Drizzle Kit handles schema migrations

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **File Storage**: Configurable storage backend through interface abstraction

### Scalability Considerations
- **Database**: PostgreSQL with connection pooling support
- **Caching**: React Query provides client-side caching
- **File Processing**: Memory-based upload handling with configurable limits
- **Static Assets**: CDN-ready build output for production deployment