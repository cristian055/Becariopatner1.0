# Backend Architecture Proposal - CaddiePro Real-Time System

## Executive Summary

Based on code analysis, CaddiePro requires a **real-time, event-driven backend** to synchronize caddie queue operations across multiple clients (admin panels and public monitors). This document proposes three architecture options.

---

## Current State Analysis

### Frontend Stack
- **React 19** + TypeScript + Vite
- **State Management**: Local state via `useCaddieSystem` hook (useState)
- **Data Persistence**: None (in-memory only, resets on refresh)
- **Routing**: Hash-based (#/monitor, #/admin)

### Core Entities

#### Caddie Entity
```typescript
{
  id: string;
  name: string;
  number: number;              // 1-120
  status: CaddieStatus;        // AVAILABLE, IN_PREP, IN_FIELD, LATE, ABSENT, ON_LEAVE
  isActive: boolean;           // Master: Active or Inactive
  category: 'Primera' | 'Segunda' | 'Tercera';
  location: 'Llanogrande' | 'Medellín';
  role: 'Golf' | 'Tennis' | 'Híbrido';
  weekendPriority: number;     // Queue position
  availability: DayAvailability[];
  historyCount: number;
  absencesCount: number;
  lateCount: number;
  leaveCount: number;
  lastActionTime: string;
}
```

#### Supporting Entities
- **ListConfig**: Queue configuration (Primera: 1-40, Segunda: 41-80, Tercera: 81-120)
- **WeeklyShift**: Weekly schedule requirements per day/time
- **WeeklyAssignment**: Caddie assignments to shifts

### Critical Operations Requiring Real-Time Sync
1. **Status Updates**: Caddie status changes (AVAILABLE → IN_PREP → IN_FIELD)
2. **Queue Operations**: Add, remove, reorder caddies in queue
3. **Bulk Dispatch**: Send multiple caddies to field simultaneously
4. **List Randomization**: Shuffle queue order
5. **Weekly Draw Generation**: Auto-assign caddies to shifts
6. **Public Monitor**: Display current queue state to external displays

---

## Architecture Proposals

### Option 1: Node.js + Socket.io + PostgreSQL ⭐ RECOMMENDED

**Stack**:
- Runtime: Node.js 20 LTS
- Real-time: Socket.io 4.x (WebSockets with fallbacks)
- Database: PostgreSQL 16
- ORM: Prisma (TypeScript-first)
- API Framework: Express.js
- Authentication: JWT + bcrypt

**Architecture Diagram**:
```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  React Client   │◄──────────────────►│   Socket.io      │
│  (Admin Panel)  │     (Socket.io)    │   Server         │
└─────────────────┘                    │                  │
                                       │   Express REST   │
┌─────────────────┐     WebSocket      │   API Endpoints  │
│  Public Monitor │◄──────────────────►│                  │
│  (Read-only)    │                    └────────┬─────────┘
└─────────────────┘                            │
                                               │
                                    ┌──────────▼─────────┐
                                    │   PostgreSQL DB    │
                                    │   + Prisma ORM     │
                                    └────────────────────┘
```

**Why This Option**:
✅ **Bidirectional Communication**: Admin can send commands, receive confirmations  
✅ **Broadcast Support**: All clients receive updates simultaneously  
✅ **Auto-Reconnection**: Socket.io handles network interruptions  
✅ **Easy Integration**: Minimal changes to existing React code  
✅ **Battle-Tested**: Used by companies like Microsoft, Trello, Zendesk  
✅ **Event-Driven**: Perfect fit for operations like "caddie dispatched"  

**Event Flow Example**:
```javascript
// Client emits event
socket.emit('caddie:updateStatus', { id: 'c-42', status: 'IN_FIELD' });

// Server processes & broadcasts
io.emit('caddie:statusUpdated', { id: 'c-42', status: 'IN_FIELD', timestamp: Date.now() });

// All clients receive update and update local state
```

**Database Schema** (Prisma):
```prisma
model Caddie {
  id              String        @id @default(uuid())
  name            String
  number          Int           @unique
  status          CaddieStatus
  isActive        Boolean       @default(true)
  category        Category
  location        Location
  role            Role
  weekendPriority Int
  historyCount    Int           @default(0)
  absencesCount   Int           @default(0)
  lateCount       Int           @default(0)
  leaveCount      Int           @default(0)
  lastActionTime  DateTime      @default(now())
  availability    Json          // Store DayAvailability[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  assignments     WeeklyAssignment[]
  @@index([number])
  @@index([status])
}

enum CaddieStatus {
  AVAILABLE
  IN_PREP
  IN_FIELD
  LATE
  ABSENT
  ON_LEAVE
}

enum Category {
  Primera
  Segunda
  Tercera
}

enum Location {
  Llanogrande
  Medellin
}

enum Role {
  Golf
  Tennis
  Hibrido
}

model WeeklyShift {
  id           String   @id @default(uuid())
  day          String
  time         String
  requirements Json     // Store WeeklyShiftRequirement[]
  createdAt    DateTime @default(now())
  
  assignments  WeeklyAssignment[]
}

model WeeklyAssignment {
  id           String      @id @default(uuid())
  shiftId      String
  caddieId     String
  assignedAt   DateTime    @default(now())
  
  shift        WeeklyShift @relation(fields: [shiftId], references: [id])
  caddie       Caddie      @relation(fields: [caddieId], references: [id])
  
  @@unique([shiftId, caddieId])
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  role         String   @default("admin")
  location     Location
  createdAt    DateTime @default(now())
}
```

**Project Structure**:
```
backend/
├── src/
│   ├── server.ts                 # Express + Socket.io setup
│   ├── socket/
│   │   ├── handlers/
│   │   │   ├── caddieHandlers.ts
│   │   │   ├── queueHandlers.ts
│   │   │   └── weeklyHandlers.ts
│   │   └── middleware/
│   │       └── authMiddleware.ts
│   ├── api/
│   │   ├── routes/
│   │   │   ├── caddies.ts
│   │   │   ├── lists.ts
│   │   │   ├── auth.ts
│   │   │   └── reports.ts
│   │   └── controllers/
│   ├── services/
│   │   ├── caddieService.ts
│   │   ├── queueService.ts
│   │   └── weeklyDrawService.ts
│   ├── database/
│   │   ├── prisma.ts
│   │   └── migrations/
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── logger.ts
│       └── errorHandler.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── .env
```

**Implementation Steps**:

1. **Initialize Backend** (Week 1)
   ```bash
   mkdir backend && cd backend
   npm init -y
   npm install express socket.io @prisma/client bcrypt jsonwebtoken cors dotenv
   npm install -D typescript @types/node @types/express @types/socket.io prisma ts-node-dev
   npx prisma init
   ```

2. **Setup Database** (Week 1)
   - Create PostgreSQL database
   - Define Prisma schema
   - Run migrations: `npx prisma migrate dev`
   - Seed initial data

3. **Create Socket.io Server** (Week 2)
   ```typescript
   // src/server.ts
   import express from 'express';
   import { createServer } from 'http';
   import { Server } from 'socket.io';
   import prisma from './database/prisma';
   
   const app = express();
   const httpServer = createServer(app);
   const io = new Server(httpServer, {
     cors: { origin: 'http://localhost:3000', credentials: true }
   });
   
   io.on('connection', (socket) => {
     console.log('Client connected:', socket.id);
     
     // Send current state on connection
     socket.emit('initialState', {
       caddies: await prisma.caddie.findMany(),
       shifts: await prisma.weeklyShift.findMany(),
     });
     
     // Register event handlers
     socket.on('caddie:update', handleCaddieUpdate);
     socket.on('queue:reorder', handleQueueReorder);
     socket.on('dispatch:bulk', handleBulkDispatch);
   });
   
   httpServer.listen(4000, () => {
     console.log('Server running on port 4000');
   });
   ```

4. **Implement Event Handlers** (Week 2-3)
   ```typescript
   // src/socket/handlers/caddieHandlers.ts
   export const handleCaddieUpdate = async (socket, io, data) => {
     const { id, updates } = data;
     
     // Validate & update database
     const caddie = await prisma.caddie.update({
       where: { id },
       data: { ...updates, lastActionTime: new Date() }
     });
     
     // Broadcast to all clients
     io.emit('caddie:updated', caddie);
   };
   ```

5. **Update Frontend** (Week 3-4)
   ```typescript
   // hooks/useSocketConnection.ts
   import { io } from 'socket.io-client';
   
   export const useSocketConnection = () => {
     const [socket, setSocket] = useState(null);
     
     useEffect(() => {
       const newSocket = io('http://localhost:4000');
       
       newSocket.on('connect', () => console.log('Connected'));
       newSocket.on('initialState', (data) => {
         setCaddies(data.caddies);
         setShifts(data.shifts);
       });
       newSocket.on('caddie:updated', (caddie) => {
         setCaddies(prev => prev.map(c => c.id === caddie.id ? caddie : c));
       });
       
       setSocket(newSocket);
       return () => newSocket.close();
     }, []);
     
     return socket;
   };
   ```

**Deployment**:
- Backend: Railway, Render, or DigitalOcean App Platform
- Database: Railway PostgreSQL, Supabase, or AWS RDS
- Frontend: Vercel or Netlify (unchanged)

**Estimated Timeline**: 4-5 weeks  
**Cost**: ~$20-30/month (Railway Starter + PostgreSQL)

---

### Option 2: Node.js + Server-Sent Events (SSE) + PostgreSQL

**Stack**:
- Runtime: Node.js 20 LTS
- Real-time: Native SSE (EventSource API)
- Database: PostgreSQL 16
- ORM: Prisma
- API: Express.js REST

**Architecture**:
```
┌─────────────────┐    SSE Stream      ┌──────────────────┐
│  React Client   │◄───────────────────│   Express Server │
│                 │                    │   /events        │
│                 │    REST API        │                  │
│                 ├───────────────────►│   POST/PUT/DEL   │
└─────────────────┘                    └────────┬─────────┘
                                               │
                                    ┌──────────▼─────────┐
                                    │   PostgreSQL       │
                                    └────────────────────┘
```

**Pros**:
✅ Simpler than WebSockets (one-way communication)  
✅ Automatic reconnection built into EventSource API  
✅ Perfect for broadcast scenarios (public monitor)  
✅ HTTP-based (easier firewall traversal)  

**Cons**:
❌ Client can only receive, must use REST API for commands  
❌ More HTTP requests (REST + SSE stream)  
❌ Less efficient for bidirectional operations  

**When to Choose**: If admin operations are infrequent and you primarily need to push updates to monitors.

---

### Option 3: GraphQL + Apollo Subscriptions + PostgreSQL

**Stack**:
- Runtime: Node.js 20 LTS
- API: Apollo Server 4
- Real-time: GraphQL Subscriptions (WebSockets)
- Database: PostgreSQL 16
- ORM: Prisma

**Architecture**:
```
┌─────────────────┐   Subscription    ┌──────────────────┐
│  React Client   │◄─────────────────►│  Apollo Server   │
│  + Apollo       │   (WebSocket)     │  + Subscriptions │
│    Client       │                   │                  │
│                 │   Queries/Muts    │                  │
│                 ├──────────────────►│                  │
└─────────────────┘   (HTTP POST)     └────────┬─────────┘
                                              │
                                   ┌──────────▼─────────┐
                                   │   PostgreSQL       │
                                   └────────────────────┘
```

**Example Schema**:
```graphql
type Caddie {
  id: ID!
  name: String!
  number: Int!
  status: CaddieStatus!
  category: Category!
  weekendPriority: Int!
}

type Query {
  caddies: [Caddie!]!
  caddie(id: ID!): Caddie
}

type Mutation {
  updateCaddieStatus(id: ID!, status: CaddieStatus!): Caddie!
  bulkDispatch(ids: [ID!]!): [Caddie!]!
}

type Subscription {
  caddieUpdated: Caddie!
  bulkDispatchOccurred: BulkDispatchEvent!
}
```

**Pros**:
✅ Type-safe end-to-end (GraphQL schema + TypeScript)  
✅ Single endpoint for all operations  
✅ Built-in real-time via subscriptions  
✅ Strong developer tooling (GraphQL Playground, Apollo DevTools)  

**Cons**:
❌ Steeper learning curve  
❌ More complex setup  
❌ Overkill for simple CRUD operations  

**When to Choose**: If you want maximum type safety and plan to scale to mobile apps (GraphQL excellent for mobile).

---

## Comparison Matrix

| Feature | Socket.io | SSE | GraphQL |
|---------|-----------|-----|---------|
| **Real-time** | ⭐⭐⭐ Bidirectional | ⭐⭐ Server→Client | ⭐⭐⭐ Bidirectional |
| **Setup Complexity** | ⭐⭐ Medium | ⭐⭐⭐ Simple | ⭐ Complex |
| **Learning Curve** | ⭐⭐⭐ Easy | ⭐⭐⭐ Easy | ⭐ Steep |
| **Type Safety** | ⭐⭐ Manual | ⭐⭐ Manual | ⭐⭐⭐ Automatic |
| **Performance** | ⭐⭐⭐ Excellent | ⭐⭐ Good | ⭐⭐ Good |
| **Browser Support** | ⭐⭐⭐ Universal | ⭐⭐ IE not supported | ⭐⭐⭐ Universal |
| **Mobile Ready** | ⭐⭐⭐ Yes | ⭐⭐ Limited | ⭐⭐⭐ Excellent |
| **Best for** | Event-driven apps | Notifications | Complex data graphs |

---

## Recommendation: Socket.io Architecture

**Primary Recommendation**: **Option 1 (Node.js + Socket.io + PostgreSQL)**

**Reasoning**:
1. **Perfect Fit**: CaddiePro is inherently event-driven (dispatch, status changes, reorders)
2. **Proven Technology**: Socket.io is mature and widely adopted
3. **Easy Migration**: Minimal frontend refactoring needed
4. **Bidirectional**: Supports both admin commands and public monitor broadcasts
5. **Developer Experience**: Simple to debug and maintain
6. **Cost-Effective**: Can start on free tiers (Railway, Render)

**Alternative**: If team has strong GraphQL experience, Option 3 could work, but adds unnecessary complexity for current requirements.

---

## Migration Plan from Current Frontend-Only State

### Phase 1: Backend Setup (Week 1-2)
- [ ] Create Node.js + Express + Socket.io server
- [ ] Setup PostgreSQL database with Prisma
- [ ] Define database schema matching current TypeScript types
- [ ] Implement authentication (JWT-based admin login)
- [ ] Create seed script to migrate initial 120 caddies

### Phase 2: Core Real-Time Features (Week 2-3)
- [ ] Implement Socket.io event handlers:
  - `caddie:update` - Update single caddie
  - `caddie:bulkUpdate` - Update multiple caddies
  - `queue:reorder` - Change weekendPriority
  - `queue:randomize` - Shuffle list
  - `dispatch:bulk` - Send caddies to field
- [ ] Create REST API endpoints for non-real-time operations:
  - `GET /api/caddies` - Fetch all caddies
  - `POST /api/caddies` - Create new caddie
  - `PUT /api/caddies/:id` - Update caddie (fallback)
  - `DELETE /api/caddies/:id` - Deactivate caddie

### Phase 3: Frontend Integration (Week 3-4)
- [ ] Install socket.io-client: `npm install socket.io-client`
- [ ] Create `useSocketConnection` hook
- [ ] Refactor `useCaddieSystem` to use Socket.io instead of useState
- [ ] Update components to emit events instead of local state updates
- [ ] Add loading states and error handling
- [ ] Test admin panel + public monitor sync

### Phase 4: Weekly Draw System (Week 4-5)
- [ ] Implement WeeklyShift CRUD operations
- [ ] Create auto-assignment algorithm (backend service)
- [ ] Add `weekly:generate` socket event
- [ ] Update WeeklyDraw component to use real-time updates

### Phase 5: Testing & Deployment (Week 5-6)
- [ ] Load testing with multiple simultaneous clients
- [ ] Test network interruption scenarios
- [ ] Setup CI/CD pipeline
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables

---

## Security Considerations

1. **Authentication**:
   - JWT tokens for admin sessions
   - Socket.io middleware to validate tokens
   - Separate "read-only" connection for public monitors

2. **Authorization**:
   - Role-based access: Admin, Supervisor, Monitor
   - Location-based filtering (Llanogrande vs Medellín)

3. **Rate Limiting**:
   - Limit socket events per client (prevent spam)
   - REST API rate limiting with express-rate-limit

4. **Data Validation**:
   - Validate all incoming socket events
   - Use Zod or Joi for schema validation
   - Sanitize inputs to prevent injection

---

## Cost Estimation (Monthly)

**Recommended Stack (Socket.io)**:
- Railway Starter: $5 (backend hosting)
- Railway PostgreSQL: $10 (1GB RAM)
- Vercel Hobby: Free (frontend)
- **Total**: ~$15/month

**Scaling to Production**:
- Railway Pro: $20 (more resources)
- Railway PostgreSQL: $25 (8GB RAM)
- Vercel Pro: $20 (custom domain, analytics)
- **Total**: ~$65/month

---

## Open Questions for Discussion

1. **Multi-Location**: Should Llanogrande and Medellín have separate databases or shared?
2. **Offline Mode**: Should admin panel cache operations if backend is down?
3. **Audit Log**: Do we need to track all historical changes (who changed what, when)?
4. **Mobile App**: Plans for native iOS/Android apps? (Would favor GraphQL)
5. **Reporting**: Should reports be generated real-time or pre-computed daily?
6. **Backup Strategy**: How often should we backup the database?
7. **Load Balancing**: Expected number of simultaneous users?

---

## Next Steps

1. **Review & Discuss**: Team reviews this proposal
2. **Proof of Concept**: Build minimal Socket.io prototype (1 week)
3. **Decision**: Approve architecture direction
4. **Implementation**: Begin Phase 1

---

**Document Version**: 1.0  
**Author**: Backend Architecture Team  
**Date**: 2026-01-08  
**Status**: Draft for Review
