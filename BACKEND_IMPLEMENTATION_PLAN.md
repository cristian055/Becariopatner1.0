# CaddiePro - Backend Implementation Plan

## Overview

This document outlines the complete plan for implementing a backend for the CaddiePro application. The backend will be developed in the same repository as the frontend, providing real-time communication using WebSockets, data persistence with PostgreSQL, and type-safe database access through Prisma.

## Current State Analysis

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **State Management**: Zustand stores (CaddieStore, ListStore, ScheduleStore, UIStore)
- **Data Models**: Well-defined TypeScript interfaces for Caddie, ListConfig, WeeklyShift, WeeklyAssignment
- **Current Data**: Mock data generated in-memory (100 caddies by default)
- **Services**: Service layer exists but operates on local state only

### Key Requirements
1. **Real-time Updates**: Administrators make changes that users see immediately
2. **Data Persistence**: All caddie, list, and schedule data must be stored in PostgreSQL
3. **Type Safety**: Maintain TypeScript types across frontend and backend
4. **Scalability**: Support multiple concurrent users and locations
5. **Performance**: Low latency for real-time updates

---

## Technical Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js (lightweight, well-documented, easy to integrate)
- **WebSockets**: Socket.IO (easier than raw WebSockets, auto-reconnection, room support)
- **Database**: PostgreSQL 15+ (robust, ACID compliant, JSON support)
- **ORM**: Prisma (type-safe, excellent TypeScript integration, migrations)
- **Authentication**: JWT tokens (stateless, scalable)
- **Validation**: Zod (runtime type validation matching TypeScript types)
- **Testing**: Vitest for unit tests, Supertest for API tests

### Infrastructure
- **Containerization**: Docker for PostgreSQL
- **Environment**: Docker Compose for local development
- **Deployment**: Ready for Docker containerization in production

---

## Project Structure

```
Becariopatner1.0/
├── src/                          # Frontend (existing)
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   └── types/
├── server/                       # Backend (new)
│   ├── src/
│   │   ├── config/              # Configuration (database, env, constants)
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth, validation, error handling
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic
│   │   ├── socket/              # WebSocket event handlers
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utilities
│   │   └── server.ts            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Database migrations
│   │   └── seed.ts              # Seed data
│   ├── tests/                   # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml           # PostgreSQL + pgAdmin setup
├── .env.example                 # Updated with backend vars
└── package.json                 # Root package.json (workspaces)
```

---

## Database Schema (Prisma)

### Core Models

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum CaddieStatus {
  AVAILABLE
  IN_PREP
  IN_FIELD
  LATE
  ABSENT
  ON_LEAVE
}

enum CaddieLocation {
  Llanogrande
  Medellin
}

enum CaddieRole {
  Golf
  Tennis
  Hybrid
}

enum CaddieCategory {
  Primera
  Segunda
  Tercera
}

enum ListOrder {
  ASC
  DESC
  RANDOM
  MANUAL
}

enum TimeAvailabilityType {
  before
  after
  between
  full
}

model Caddie {
  id               String          @id @default(uuid())
  name             String
  number           Int             @unique
  status           CaddieStatus    @default(AVAILABLE)
  isActive         Boolean         @default(true)
  listId           String?
  historyCount     Int             @default(0)
  absencesCount    Int             @default(0)
  lateCount        Int             @default(0)
  leaveCount       Int             @default(0)
  lastActionTime   String
  category         CaddieCategory  @default(Primera)
  location         CaddieLocation  @default(Llanogrande)
  role             CaddieRole      @default(Golf)
  weekendPriority  Int
  isSkippedNextWeek Boolean        @default(false)
  
  list             ListConfig?     @relation(fields: [listId], references: [id])
  availability     DayAvailability[]
  assignments      WeeklyAssignment[]
  
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  
  @@index([status])
  @@index([category])
  @@index([location])
  @@index([isActive])
}

model DayAvailability {
  id            String                  @id @default(uuid())
  caddieId      String
  day           String
  isAvailable   Boolean
  rangeType     TimeAvailabilityType?
  rangeTime     String?
  rangeEndTime  String?
  
  caddie        Caddie                  @relation(fields: [caddieId], references: [id], onDelete: Cascade)
  
  @@unique([caddieId, day])
  @@index([caddieId])
}

model ListConfig {
  id           String         @id @default(uuid())
  name         String
  order        ListOrder      @default(ASC)
  rangeStart   Int
  rangeEnd     Int
  category     CaddieCategory
  
  caddies      Caddie[]
  
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  
  @@unique([name, category])
}

model WeeklyShift {
  id           String         @id @default(uuid())
  day          String
  time         String
  
  requirements ShiftRequirement[]
  assignments  WeeklyAssignment[]
  
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  
  @@unique([day, time])
}

model ShiftRequirement {
  id           String         @id @default(uuid())
  shiftId      String
  category     CaddieCategory
  count        Int
  
  shift        WeeklyShift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  
  @@index([shiftId])
}

model WeeklyAssignment {
  id           String         @id @default(uuid())
  shiftId      String
  caddieId     String
  
  shift        WeeklyShift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  caddie       Caddie         @relation(fields: [caddieId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime       @default(now())
  
  @@unique([shiftId, caddieId])
  @@index([shiftId])
  @@index([caddieId])
}

model User {
  id           String         @id @default(uuid())
  email        String         @unique
  password     String
  name         String
  role         String         @default("viewer") // admin, operator, viewer
  isActive     Boolean        @default(true)
  
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}
```

---

## API Design

### REST Endpoints

#### Authentication
```
POST   /api/auth/login          # Login with email/password
POST   /api/auth/logout         # Logout (invalidate token)
POST   /api/auth/refresh        # Refresh JWT token
GET    /api/auth/me             # Get current user info
```

#### Caddies
```
GET    /api/caddies             # List all caddies (with filters)
GET    /api/caddies/:id         # Get single caddie
POST   /api/caddies             # Create caddie
PUT    /api/caddies/:id         # Update caddie
DELETE /api/caddies/:id         # Delete (soft delete)
PATCH  /api/caddies/:id/status  # Update status only
POST   /api/caddies/bulk-update # Bulk update statuses
```

#### Lists
```
GET    /api/lists               # Get all list configs
GET    /api/lists/:id           # Get single list
POST   /api/lists               # Create list
PUT    /api/lists/:id           # Update list
DELETE /api/lists/:id           # Delete list
POST   /api/lists/:id/reorder   # Reorder caddies in list
```

#### Weekly Schedule
```
GET    /api/schedule/shifts     # Get all shifts
GET    /api/schedule/shifts/:id # Get single shift
POST   /api/schedule/shifts     # Create shift
PUT    /api/schedule/shifts/:id # Update shift
DELETE /api/schedule/shifts/:id # Delete shift

GET    /api/schedule/assignments           # Get all assignments
POST   /api/schedule/assignments           # Create assignment
DELETE /api/schedule/assignments/:id       # Delete assignment
POST   /api/schedule/generate              # Auto-generate weekly schedule
```

#### Health & Utility
```
GET    /api/health              # Health check
GET    /api/version             # API version info
```

---

## WebSocket Events

### Client → Server

```typescript
// Connection
'connect'                        // Client connects
'authenticate'                   // Send JWT token

// Caddie Events
'caddie:create'                  // Create caddie
'caddie:update'                  // Update caddie
'caddie:delete'                  // Delete caddie
'caddie:bulk-update'             // Bulk update statuses
'caddie:reorder'                 // Reorder in list

// List Events
'list:create'                    // Create list
'list:update'                    // Update list
'list:delete'                    // Delete list

// Schedule Events
'schedule:shift:create'          // Create shift
'schedule:shift:update'          // Update shift
'schedule:shift:delete'          // Delete shift
'schedule:assignment:create'     // Create assignment
'schedule:assignment:delete'     // Delete assignment
'schedule:generate'              // Generate weekly schedule

// Subscription
'subscribe:caddies'              // Subscribe to caddie updates
'subscribe:lists'                // Subscribe to list updates
'subscribe:schedule'             // Subscribe to schedule updates
'unsubscribe:caddies'            // Unsubscribe
'unsubscribe:lists'              // Unsubscribe
'unsubscribe:schedule'           // Unsubscribe
```

### Server → Client

```typescript
// Connection
'authenticated'                  // Authentication successful
'unauthorized'                   // Authentication failed
'error'                          // General error

// Caddie Events (broadcasts)
'caddie:created'                 // New caddie created
'caddie:updated'                 // Caddie updated
'caddie:deleted'                 // Caddie deleted
'caddie:bulk-updated'            // Multiple caddies updated
'caddie:reordered'               // List order changed

// List Events (broadcasts)
'list:created'                   // New list created
'list:updated'                   // List updated
'list:deleted'                   // List deleted

// Schedule Events (broadcasts)
'schedule:shift:created'         // New shift created
'schedule:shift:updated'         // Shift updated
'schedule:shift:deleted'         // Shift deleted
'schedule:assignment:created'    // New assignment
'schedule:assignment:deleted'    // Assignment removed
'schedule:generated'             // Full schedule regenerated

// Sync Events
'sync:full'                      // Full data sync (on connect)
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up backend infrastructure and database

- [ ] Create server directory structure
- [ ] Initialize backend package.json with dependencies
- [ ] Configure TypeScript for backend
- [ ] Set up Docker Compose with PostgreSQL
- [ ] Create Prisma schema
- [ ] Generate Prisma client
- [ ] Create initial migration
- [ ] Create seed script with sample data
- [ ] Set up Express server with basic routing
- [ ] Configure environment variables
- [ ] Add basic error handling middleware

**Deliverables**:
- Working PostgreSQL database in Docker
- Prisma schema matches frontend types
- Basic Express server running on port 3001
- Health check endpoint working

---

### Phase 2: REST API (Week 2)
**Goal**: Implement CRUD operations for all entities

- [ ] Implement authentication middleware (JWT)
- [ ] Create Caddie CRUD endpoints
- [ ] Create List CRUD endpoints
- [ ] Create Schedule CRUD endpoints
- [ ] Add input validation with Zod
- [ ] Implement error handling
- [ ] Add request logging
- [ ] Write API tests
- [ ] Create API documentation

**Deliverables**:
- All REST endpoints functional
- API tests passing
- Postman/Thunder Client collection

---

### Phase 3: WebSocket Integration (Week 3)
**Goal**: Add real-time communication

- [ ] Set up Socket.IO server
- [ ] Implement authentication for WebSocket
- [ ] Create event handlers for all entities
- [ ] Implement room-based broadcasting
- [ ] Add connection management
- [ ] Handle reconnection logic
- [ ] Implement event logging
- [ ] Write WebSocket tests
- [ ] Add rate limiting for events

**Deliverables**:
- WebSocket server functional
- Real-time updates working
- Connection stability tested

---

### Phase 4: Frontend Integration (Week 4)
**Goal**: Connect frontend to backend

- [ ] Create API client service in frontend
- [ ] Add Socket.IO client to frontend
- [ ] Update Zustand stores to use API
- [ ] Implement optimistic updates
- [ ] Add error handling in frontend
- [ ] Update services to call backend
- [ ] Remove mock data generation
- [ ] Add loading states
- [ ] Add offline detection
- [ ] Test end-to-end functionality

**Deliverables**:
- Frontend fully integrated with backend
- Real-time updates working in UI
- Error handling robust

---

### Phase 5: Testing & Documentation (Week 5)
**Goal**: Ensure quality and maintainability

- [ ] Write comprehensive tests
  - Unit tests for services
  - Integration tests for API
  - E2E tests for critical flows
- [ ] Load testing for WebSocket connections
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update README with backend setup
- [ ] Create deployment guide
- [ ] API documentation
- [ ] Architecture diagrams

**Deliverables**:
- >80% test coverage
- Complete documentation
- Deployment ready

---

## Development Setup

### Prerequisites
```bash
# Install Node.js 18+
node --version  # v18.x or higher

# Install Docker
docker --version
docker-compose --version
```

### Initial Setup
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with database credentials

# Start PostgreSQL
docker-compose up -d

# Run Prisma migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start backend dev server
npm run dev

# In another terminal, start frontend
cd ..
npm run dev
```

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://caddiepro:caddiepro_password@localhost:5432/caddiepro_db?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# WebSocket
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=5000

# Logging
LOG_LEVEL=debug
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
VITE_ENABLE_PERFORMANCE_MONITORING=false
```

---

## Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: caddiepro_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: caddiepro_db
      POSTGRES_USER: caddiepro
      POSTGRES_PASSWORD: caddiepro_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U caddiepro"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: caddiepro_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@caddiepro.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Security Considerations

1. **Authentication**
   - JWT tokens with refresh mechanism
   - Password hashing with bcrypt (10 rounds)
   - Token expiration and rotation

2. **Authorization**
   - Role-based access control (admin, operator, viewer)
   - Middleware for route protection
   - WebSocket event authorization

3. **Input Validation**
   - Zod schemas for all inputs
   - SQL injection prevention (Prisma)
   - XSS prevention

4. **Rate Limiting**
   - API rate limiting (express-rate-limit)
   - WebSocket event throttling
   - Connection limits per user

5. **CORS**
   - Whitelist allowed origins
   - Credentials support for cookies

6. **HTTPS**
   - Use HTTPS in production
   - Secure WebSocket (WSS)

---

## Performance Optimization

1. **Database**
   - Indexes on frequently queried fields
   - Connection pooling
   - Query optimization

2. **Caching**
   - Redis for session storage (future)
   - In-memory cache for static data

3. **WebSocket**
   - Room-based broadcasting (avoid N+1 broadcasts)
   - Message batching for bulk updates
   - Connection pooling

4. **API**
   - Pagination for list endpoints
   - Field filtering (select only needed fields)
   - Compression (gzip)

---

## Monitoring & Logging

1. **Application Logs**
   - Winston logger with levels
   - Structured logging (JSON)
   - Separate error logs

2. **Metrics**
   - API response times
   - WebSocket connection count
   - Database query performance

3. **Error Tracking**
   - Centralized error logging
   - Stack traces in development
   - Error alerts in production

---

## Testing Strategy

### Unit Tests
- Services (business logic)
- Utilities
- Middleware

### Integration Tests
- API endpoints
- Database operations
- WebSocket events

### E2E Tests
- Critical user flows
- Real-time updates
- Multi-user scenarios

### Load Tests
- Concurrent WebSocket connections
- API throughput
- Database performance

---

## Migration Strategy

### Data Migration
1. Export existing mock data format
2. Transform to match Prisma schema
3. Bulk insert into database
4. Verify data integrity
5. Update frontend to use API

### User Migration
1. Keep mock data as fallback
2. Add feature flag for backend integration
3. Gradual rollout by location
4. Monitor for issues
5. Full cutover

---

## Deployment Plan

### Development
- Docker Compose for local development
- Hot reload for backend
- Auto-restart on crashes

### Staging
- Docker containers
- PostgreSQL RDS or managed database
- Environment-specific configs

### Production
- Containerized deployment (Docker/Kubernetes)
- Managed PostgreSQL (AWS RDS, Azure Database, etc.)
- SSL/TLS for all connections
- CDN for frontend assets
- Load balancer for backend
- Monitoring and alerting

---

## Success Criteria

1. **Functionality**
   - ✅ All CRUD operations working
   - ✅ Real-time updates < 500ms latency
   - ✅ Data persistence across sessions
   - ✅ Multi-user support

2. **Performance**
   - ✅ API response time < 200ms (p95)
   - ✅ Support 100+ concurrent WebSocket connections
   - ✅ Database queries < 100ms

3. **Reliability**
   - ✅ 99.9% uptime
   - ✅ Automatic reconnection
   - ✅ No data loss on disconnection

4. **Code Quality**
   - ✅ >80% test coverage
   - ✅ TypeScript strict mode
   - ✅ No ESLint errors
   - ✅ Documented APIs

---

## Future Enhancements

1. **Advanced Features**
   - Audit logging (track all changes)
   - Undo/redo functionality
   - Advanced analytics
   - Mobile app API support

2. **Scalability**
   - Redis for caching
   - Message queue for async tasks
   - Horizontal scaling with load balancer
   - Database read replicas

3. **DevOps**
   - CI/CD pipeline
   - Automated testing
   - Automated deployments
   - Infrastructure as Code (Terraform)

---

## Next Steps

To start implementation:

1. **Review and approve this plan**
2. **Set up development environment**
3. **Begin Phase 1: Foundation**
4. **Regular check-ins and demos**
5. **Iterative feedback and adjustments**

---

## Questions & Decisions Needed

1. **Authentication**: Should we use an existing service (Auth0, Firebase) or build custom JWT auth?
   - **Recommendation**: Custom JWT auth (simpler, fewer dependencies, fits use case)

2. **Deployment**: Where will the application be deployed?
   - **Recommendation**: Docker containers on cloud provider (AWS, Azure, GCP)

3. **Database Hosting**: Managed service or self-hosted?
   - **Recommendation**: Managed PostgreSQL (less maintenance, better reliability)

4. **User Management**: How will users be created and managed?
   - **Recommendation**: Admin panel for user management, seeded admin account

5. **Data Retention**: How long should historical data be kept?
   - **Recommendation**: Keep all data, add archival system later if needed

---

## Contact & Support

For questions or clarifications on this implementation plan:
- Technical Lead: [To be assigned]
- Backend Developer: [To be assigned]
- DevOps: [To be assigned]

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-08  
**Status**: Proposed - Awaiting Approval
