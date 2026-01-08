# CaddiePro - Backend Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Browser    │  │   Browser    │  │   Browser    │              │
│  │  (Admin)     │  │  (Operator)  │  │  (Public)    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         │   React 19 + TypeScript + Zustand  │                       │
│         └──────────────────┼──────────────────┘                       │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ HTTP/REST + WebSocket (Socket.IO)
                              │
┌─────────────────────────────┼──────────────────────────────────────┐
│                          API GATEWAY                                 │
│                              │                                       │
│         ┌────────────────────┴────────────────────┐                 │
│         │                                          │                 │
│    ┌────▼─────┐                            ┌──────▼──────┐          │
│    │   REST   │                            │  WebSocket  │          │
│    │   API    │                            │   Server    │          │
│    └────┬─────┘                            └──────┬──────┘          │
│         │                                          │                 │
│         │          Express.js + TypeScript        │                 │
│         │                                          │                 │
└─────────┼──────────────────────────────────────────┼───────────────┘
          │                                          │
          │                                          │
┌─────────┼──────────────────────────────────────────┼───────────────┐
│         │       APPLICATION LAYER                  │                │
│         │                                          │                │
│    ┌────▼─────────────────────────────────────────▼─────┐          │
│    │              Middleware Layer                       │          │
│    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │          │
│    │  │ Auth │ │Valid.│ │Error │ │ CORS │ │ Log  │    │          │
│    │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │          │
│    └────────────────────┬────────────────────────────────┘          │
│                         │                                            │
│    ┌────────────────────▼────────────────────────────┐              │
│    │              Controller Layer                    │              │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │              │
│    │  │ Caddie   │ │  List    │ │ Schedule │        │              │
│    │  │Controller│ │Controller│ │Controller│        │              │
│    │  └────┬─────┘ └────┬─────┘ └────┬─────┘        │              │
│    └───────┼────────────┼────────────┼───────────────┘              │
│            │            │            │                               │
│    ┌───────▼────────────▼────────────▼───────────────┐              │
│    │              Service Layer                       │              │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │              │
│    │  │ Caddie   │ │  List    │ │ Schedule │        │              │
│    │  │ Service  │ │ Service  │ │ Service  │        │              │
│    │  └────┬─────┘ └────┬─────┘ └────┬─────┘        │              │
│    └───────┼────────────┼────────────┼───────────────┘              │
│            │            │            │                               │
└────────────┼────────────┼────────────┼──────────────────────────────┘
             │            │            │
             │            │            │
┌────────────┼────────────┼────────────┼──────────────────────────────┐
│            │      DATA ACCESS LAYER  │                               │
│            │                         │                               │
│    ┌───────▼─────────────────────────▼───────────────┐              │
│    │              Prisma ORM                          │              │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │              │
│    │  │ Caddie   │ │  List    │ │ Schedule │        │              │
│    │  │  Model   │ │  Model   │ │  Model   │        │              │
│    │  └────┬─────┘ └────┬─────┘ └────┬─────┘        │              │
│    └───────┼────────────┼────────────┼───────────────┘              │
│            │            │            │                               │
└────────────┼────────────┼────────────┼──────────────────────────────┘
             │            │            │
             └────────────┴────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────────┐
│                    DATABASE LAYER                                  │
│                                                                     │
│              ┌────────────────────────────┐                        │
│              │   PostgreSQL 15            │                        │
│              │                            │                        │
│              │  ┌──────┐  ┌──────┐       │                        │
│              │  │Tables│  │Indexes│       │                        │
│              │  └──────┘  └──────┘       │                        │
│              │                            │                        │
│              │  Running in Docker         │                        │
│              └────────────────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Communication Flow

### REST API Flow (CRUD Operations)

```
┌────────┐      HTTP Request      ┌────────┐     ┌─────────┐     ┌──────────┐
│ Client │ ───────────────────────>│  API   │────>│Controller────>│ Service  │
│        │                         │ Router │     └─────────┘     └────┬─────┘
│        │                         └────────┘                          │
│        │                                                             │
│        │                                                         ┌───▼──────┐
│        │                                                         │  Prisma  │
│        │                                                         └───┬──────┘
│        │                                                             │
│        │                                                         ┌───▼──────┐
│        │      HTTP Response                                      │PostgreSQL│
│        │ <───────────────────────────────────────────────────────┴──────────┘
└────────┘
```

### WebSocket Flow (Real-time Updates)

```
┌─────────┐    WS Event     ┌──────────┐   ┌─────────┐   ┌──────────┐
│Client A │ ───────────────>│  Socket  │──>│ Handler │──>│ Service  │
│         │                 │  Server  │   └─────────┘   └────┬─────┘
└─────────┘                 └────┬─────┘                      │
                                 │                            │
                                 │                        ┌───▼──────┐
┌─────────┐                      │                        │  Prisma  │
│Client B │ <────────────────────┤                        └───┬──────┘
│         │    Broadcast         │                            │
└─────────┘                      │                        ┌───▼──────┐
                                 │                        │PostgreSQL│
┌─────────┐                      │                        └──────────┘
│Client C │ <────────────────────┘
│         │    Broadcast
└─────────┘
```

### Combined Flow (Admin Action with Real-time Update)

```
1. Admin dispatches caddie (HTTP POST)
   ↓
2. API processes request
   ↓
3. Database updated
   ↓
4. WebSocket broadcasts "caddie:updated" event
   ↓
5. All connected clients receive update immediately
```

---

## Data Flow

### Caddie Dispatch Flow

```
┌──────────────┐
│ Admin UI     │
│ (Browser)    │
└──────┬───────┘
       │
       │ 1. POST /api/caddies/bulk-update
       │    {ids: [...], status: "IN_FIELD"}
       │
       ▼
┌─────────────────────────┐
│ API Controller          │
│ - Validate input        │
│ - Check permissions     │
└──────┬──────────────────┘
       │
       │ 2. Call service
       │
       ▼
┌─────────────────────────┐
│ Caddie Service          │
│ - Business logic        │
│ - Update caddies        │
└──────┬──────────────────┘
       │
       │ 3. Database update
       │
       ▼
┌─────────────────────────┐
│ Prisma Client           │
│ - Execute query         │
└──────┬──────────────────┘
       │
       │ 4. Transaction
       │
       ▼
┌─────────────────────────┐
│ PostgreSQL              │
│ - Update rows           │
│ - Return results        │
└──────┬──────────────────┘
       │
       │ 5. Broadcast event
       │
       ▼
┌─────────────────────────┐
│ Socket.IO Server        │
│ - Emit "caddie:updated" │
└──────┬──────────────────┘
       │
       ├─────────────────┬─────────────────┬─────────────────┐
       │                 │                 │                 │
       ▼                 ▼                 ▼                 ▼
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Admin UI │      │Operator UI│      │Public UI │      │Public UI │
│(Updates) │      │(Updates)  │      │(Updates) │      │(Updates) │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
```

---

## Database Schema Relationships

```
┌────────────────────┐
│      Caddie        │
│────────────────────│
│ id (PK)            │
│ name               │
│ number (unique)    │
│ status             │
│ listId (FK)        │────────┐
│ category           │        │
│ location           │        │
│ role               │        │
│ ...                │        │
└────┬───────────────┘        │
     │                        │
     │ 1:N                    │ N:1
     │                        │
     ▼                        ▼
┌────────────────────┐   ┌────────────────────┐
│ DayAvailability    │   │    ListConfig      │
│────────────────────│   │────────────────────│
│ id (PK)            │   │ id (PK)            │
│ caddieId (FK)      │   │ name               │
│ day                │   │ category           │
│ isAvailable        │   │ rangeStart         │
│ rangeType          │   │ rangeEnd           │
│ ...                │   │ ...                │
└────────────────────┘   └────────────────────┘
     │
     │ 1:N
     │
     ▼
┌────────────────────┐
│ WeeklyAssignment   │
│────────────────────│
│ id (PK)            │
│ caddieId (FK)      │────────┐
│ shiftId (FK)       │        │
└────────────────────┘        │
                              │
                              │ N:1
                              │
                              ▼
                         ┌────────────────────┐
                         │   WeeklyShift      │
                         │────────────────────│
                         │ id (PK)            │
                         │ day                │
                         │ time               │
                         └────┬───────────────┘
                              │
                              │ 1:N
                              │
                              ▼
                         ┌────────────────────┐
                         │ ShiftRequirement   │
                         │────────────────────│
                         │ id (PK)            │
                         │ shiftId (FK)       │
                         │ category           │
                         │ count              │
                         └────────────────────┘
```

---

## Technology Stack Details

### Backend Stack

```
┌─────────────────────────────────────────────────┐
│           Application Layer                     │
│                                                  │
│  Node.js 18+ ───> TypeScript 5.x                │
│       │                                          │
│       └───> Express.js 4.x                      │
│               │                                  │
│               ├──> Socket.IO 4.x (WebSocket)    │
│               ├──> CORS                          │
│               ├──> express-rate-limit            │
│               └──> helmet (security)             │
│                                                  │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Data Access Layer                     │
│                                                  │
│  Prisma ORM 5.x                                 │
│       │                                          │
│       └──> PostgreSQL Client                    │
│       └──> Type Generation                      │
│       └──> Migration Tools                      │
│                                                  │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Database Layer                        │
│                                                  │
│  PostgreSQL 15 (in Docker)                      │
│       │                                          │
│       ├──> JSONB support                        │
│       ├──> Full-text search                     │
│       ├──> Indexes for performance              │
│       └──> ACID transactions                    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Frontend Stack (Existing)

```
┌─────────────────────────────────────────────────┐
│           UI Layer                              │
│                                                  │
│  React 19 ───> TypeScript                       │
│       │                                          │
│       └──> Vite (build tool)                    │
│       └──> Tailwind CSS (styling)               │
│                                                  │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           State Management                      │
│                                                  │
│  Zustand (global state)                         │
│       │                                          │
│       └──> CaddieStore                          │
│       └──> ListStore                            │
│       └──> ScheduleStore                        │
│       └──> UIStore                              │
│                                                  │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           API Integration                       │
│                                                  │
│  Axios (HTTP client)                            │
│  Socket.IO Client (WebSocket)                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│           Client                                │
│                                                  │
│  Stores JWT in memory (not localStorage)       │
│  Sends token in Authorization header            │
│                                                  │
└────────────────────┬────────────────────────────┘
                     │
                     │ HTTPS (Production)
                     │
┌────────────────────▼────────────────────────────┐
│           API Gateway                           │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │   Security Middleware                    │   │
│  │                                          │   │
│  │  1. Helmet (HTTP headers)               │   │
│  │  2. CORS (origin validation)            │   │
│  │  3. Rate Limiting                       │   │
│  │  4. JWT Validation                      │   │
│  │  5. Role-based Authorization            │   │
│  │  6. Input Validation (Zod)              │   │
│  │                                          │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Application                           │
│                                                  │
│  Secure password hashing (bcrypt)              │
│  SQL injection prevention (Prisma)             │
│  XSS prevention (input sanitization)           │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development

```
┌──────────────────┐
│   Developer      │
│   Machine        │
│                  │
│  ┌────────────┐  │
│  │  Frontend  │  │ :3000
│  └────────────┘  │
│                  │
│  ┌────────────┐  │
│  │  Backend   │  │ :3001
│  └────────────┘  │
│                  │
│  ┌────────────┐  │
│  │ PostgreSQL │  │ :5432 (Docker)
│  │  (Docker)  │  │
│  └────────────┘  │
│                  │
└──────────────────┘
```

### Production (Proposed)

```
┌─────────────────────────────────────────────────┐
│              Load Balancer                      │
│              (HTTPS/WSS)                        │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  Frontend    │   │  Frontend    │
│  Container   │   │  Container   │
│  (Nginx)     │   │  (Nginx)     │
└──────────────┘   └──────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Backend Load Balancer                  │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  Backend     │   │  Backend     │
│  Container   │   │  Container   │
│  (Node.js)   │   │  (Node.js)   │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│        Managed PostgreSQL                       │
│        (AWS RDS / Azure Database)               │
└─────────────────────────────────────────────────┘
```

---

## File Structure Visual

```
Becariopatner1.0/
│
├── src/                         # Frontend
│   ├── components/
│   ├── hooks/
│   ├── services/
│   │   ├── apiClient.ts        # Axios instance
│   │   ├── socketClient.ts     # Socket.IO client
│   │   ├── caddieService.ts    # API calls
│   │   └── ...
│   ├── stores/
│   │   ├── caddieStore.ts      # Zustand + Socket listeners
│   │   └── ...
│   └── types/
│
├── server/                      # Backend (NEW)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts     # Prisma client
│   │   │   └── env.ts          # Environment validation
│   │   │
│   │   ├── controllers/
│   │   │   ├── caddieController.ts
│   │   │   ├── listController.ts
│   │   │   └── scheduleController.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT validation
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts     # Zod validation
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── caddieRoutes.ts
│   │   │   ├── listRoutes.ts
│   │   │   └── scheduleRoutes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── caddieService.ts
│   │   │   ├── listService.ts
│   │   │   └── scheduleService.ts
│   │   │
│   │   ├── socket/
│   │   │   ├── socketManager.ts
│   │   │   └── handlers/
│   │   │       ├── caddieHandler.ts
│   │   │       ├── listHandler.ts
│   │   │       └── scheduleHandler.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── server.ts           # Entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.ts             # Seed data
│   │   └── migrations/         # Migration history
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml           # PostgreSQL setup
├── .env                         # Environment variables
└── .gitignore
```

---

## Summary

This architecture provides:

✅ **Separation of Concerns**: Clear layers (API, Service, Data Access)  
✅ **Type Safety**: TypeScript end-to-end  
✅ **Real-time**: WebSocket for instant updates  
✅ **Scalability**: Stateless backend, horizontal scaling ready  
✅ **Security**: JWT auth, validation, rate limiting  
✅ **Maintainability**: Clean structure, testable code  
✅ **Performance**: Database indexes, connection pooling  
✅ **Developer Experience**: Hot reload, type generation, migrations  

Ready to implement! Start with [BACKEND_QUICKSTART.md](./BACKEND_QUICKSTART.md).
