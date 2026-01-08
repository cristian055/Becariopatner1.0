# Backend Quick Start Guide

## Overview

This is a streamlined guide to start implementing the CaddiePro backend. For the complete detailed plan, see [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md).

---

## Tech Stack Summary

- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Auth**: JWT
- **Container**: Docker

---

## Recommended Implementation Order

### Phase 1: Foundation (Start Here)

#### Step 1: Create Server Directory Structure

```bash
# Create backend directories
mkdir -p server/src/{config,controllers,middleware,routes,services,socket,types,utils}
mkdir -p server/prisma
mkdir -p server/tests
```

#### Step 2: Initialize Backend Package

```bash
cd server
npm init -y

# Install core dependencies
npm install express cors dotenv
npm install socket.io
npm install @prisma/client
npm install jsonwebtoken bcrypt
npm install zod

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/jsonwebtoken @types/bcrypt
npm install -D ts-node nodemon
npm install -D prisma
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
```

#### Step 3: Configure TypeScript

Create `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### Step 4: Add Scripts to package.json

Add to `server/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "db:seed": "ts-node prisma/seed.ts",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

#### Step 5: Set Up Docker for PostgreSQL

Create `docker-compose.yml` in root:

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

Start database:
```bash
docker-compose up -d
```

#### Step 6: Create Prisma Schema

Create `server/prisma/schema.prisma` with the database schema (see detailed plan for complete schema).

Key models:
- Caddie
- DayAvailability  
- ListConfig
- WeeklyShift
- ShiftRequirement
- WeeklyAssignment
- User

#### Step 7: Initialize Prisma

```bash
cd server
npx prisma init
npx prisma generate
npx prisma migrate dev --name init
```

#### Step 8: Create Basic Express Server

Create `server/src/server.ts`:

```typescript
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

#### Step 9: Update .env Files

Root `.env.example`:
```env
# Database
DATABASE_URL="postgresql://caddiepro:caddiepro_password@localhost:5432/caddiepro_db?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Frontend (existing)
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

Create `.env` from `.env.example` and update values.

---

### Phase 2: Core API Implementation

#### Step 1: Create Caddie Service

`server/src/services/caddieService.ts`:
- CRUD operations using Prisma
- Filter and search logic
- Status updates
- Bulk operations

#### Step 2: Create Caddie Controller

`server/src/controllers/caddieController.ts`:
- Request validation
- Call service methods
- Error handling
- Response formatting

#### Step 3: Create Caddie Routes

`server/src/routes/caddieRoutes.ts`:
- Define endpoints
- Apply middleware
- Connect to controllers

#### Step 4: Repeat for Lists and Schedule

Follow same pattern:
- Service layer (business logic + database)
- Controller layer (request handling)
- Route layer (endpoint definitions)

---

### Phase 3: WebSocket Integration

#### Step 1: Create Socket Manager

`server/src/socket/socketManager.ts`:
- Handle connections
- Authentication
- Room management
- Event routing

#### Step 2: Create Event Handlers

`server/src/socket/handlers/`:
- `caddieHandler.ts` - Caddie events
- `listHandler.ts` - List events
- `scheduleHandler.ts` - Schedule events

#### Step 3: Broadcast Updates

When data changes via API or WebSocket:
```typescript
// After successful update
io.emit('caddie:updated', updatedCaddie)
```

---

### Phase 4: Frontend Integration

#### Step 1: Create API Client

`src/services/apiClient.ts`:
```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient
```

#### Step 2: Create Socket Client

`src/services/socketClient.ts`:
```typescript
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_WS_URL, {
  autoConnect: true,
  reconnection: true
})

export default socket
```

#### Step 3: Update Services

Update `src/services/caddieService.ts` to call backend API:
```typescript
import apiClient from './apiClient'

export const caddieService = {
  async getCaddies() {
    const response = await apiClient.get('/caddies')
    return response.data
  },
  // ... other methods
}
```

#### Step 4: Update Stores

Update `src/stores/caddieStore.ts` to listen to WebSocket:
```typescript
import socket from '../services/socketClient'

// In store initialization
socket.on('caddie:updated', (caddie) => {
  // Update store with new caddie data
  useCaddieStore.getState().updateCaddieFromSocket(caddie)
})
```

---

## Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Get caddies
curl http://localhost:3001/api/caddies

# Create caddie
curl -X POST http://localhost:3001/api/caddies \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Caddie","number":999,"category":"Primera","location":"Llanogrande","role":"Golf"}'
```

### Test WebSocket

Use Socket.IO client or browser console:
```javascript
const socket = io('http://localhost:3001')
socket.on('connect', () => console.log('Connected'))
socket.on('caddie:updated', (data) => console.log('Caddie updated:', data))
```

---

## Common Issues & Solutions

### Issue: Prisma Client not found
**Solution**: Run `npx prisma generate`

### Issue: Database connection failed
**Solution**: 
1. Check Docker is running: `docker ps`
2. Verify DATABASE_URL in .env
3. Check PostgreSQL logs: `docker logs caddiepro_db`

### Issue: Port already in use
**Solution**: 
```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

### Issue: CORS errors
**Solution**: Add frontend URL to ALLOWED_ORIGINS in .env

---

## Development Workflow

1. **Start services**:
   ```bash
   # Terminal 1: Database
   docker-compose up
   
   # Terminal 2: Backend
   cd server && npm run dev
   
   # Terminal 3: Frontend
   npm run dev
   ```

2. **Make changes**:
   - Edit code
   - Auto-reload with nodemon
   - Test changes

3. **Database changes**:
   ```bash
   # Modify schema.prisma
   npx prisma migrate dev --name description_of_changes
   npx prisma generate
   ```

4. **View database**:
   ```bash
   npx prisma studio
   # Opens at http://localhost:5555
   ```

---

## Next Steps

After completing foundation:

1. ✅ Verify backend server runs on port 3001
2. ✅ Verify database connection works
3. ✅ Verify health check endpoint responds
4. ➡️ Implement Caddie CRUD API
5. ➡️ Implement WebSocket events
6. ➡️ Connect frontend to backend
7. ➡️ Test real-time updates
8. ➡️ Add authentication
9. ➡️ Write tests
10. ➡️ Document APIs

---

## Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Socket.IO Docs**: https://socket.io/docs/v4/
- **Express.js Docs**: https://expressjs.com/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

---

## Support

For detailed information, see:
- [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md) - Complete implementation plan
- [AGENTS.md](./AGENTS.md) - Development standards
- [README.md](./README.md) - Project overview

---

**Ready to start?** Begin with Phase 1, Step 1 above!
