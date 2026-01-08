# CaddiePro Backend Server

Backend server for CaddiePro application with REST API and WebSocket support.

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration (optional for testing)
```

### Development

```bash
# Start development server (with hot reload)
npm run dev

# Server will run on http://localhost:3001
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Generate JWT tokens for testing
npm run generate-token
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Features

- ✅ Express.js REST API
- ✅ Socket.IO WebSocket support
- ✅ JWT authentication
- ✅ File-based data storage (temporary, until PostgreSQL)
- ✅ TypeScript with strict mode
- ✅ Role-based access control
- ✅ Error handling and logging
- ✅ CORS configuration
- ✅ Comprehensive tests (unit + integration)

## API Endpoints

### Authentication

```
POST   /api/auth/login      - Login with email/password
POST   /api/auth/verify     - Verify JWT token
GET    /api/auth/me         - Get current user (requires auth)
```

### Caddies

All caddie endpoints require authentication.

```
GET    /api/caddies         - Get all caddies
GET    /api/caddies/:id     - Get caddie by ID
POST   /api/caddies         - Create caddie (admin/operator)
PUT    /api/caddies/:id     - Update caddie (admin/operator)
DELETE /api/caddies/:id     - Delete caddie (admin only)
POST   /api/caddies/bulk-update - Bulk update status (admin/operator)
```

### Health

```
GET    /api/health          - Health check
```

## Testing the API

### 1. Generate JWT Token

```bash
npm run generate-token
```

This will generate test tokens for admin, operator, and viewer roles.

### 2. Test Health Endpoint

```bash
curl http://localhost:3001/api/health
```

### 3. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@caddiepro.com","password":"test"}'
```

Response includes `token` and `refreshToken`.

### 4. Get Caddies (with authentication)

```bash
curl http://localhost:3001/api/caddies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Create Caddie

```bash
curl -X POST http://localhost:3001/api/caddies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Caddie",
    "number": 101,
    "status": "AVAILABLE",
    "isActive": true,
    "listId": null,
    "historyCount": 0,
    "absencesCount": 0,
    "lateCount": 0,
    "leaveCount": 0,
    "lastActionTime": "08:00 AM",
    "category": "Primera",
    "location": "Llanogrande",
    "role": "Golf",
    "weekendPriority": 101,
    "availability": []
  }'
```

## WebSocket Testing

Connect to WebSocket at `http://localhost:3001` using Socket.IO client.

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001')

socket.on('connect', () => {
  console.log('Connected:', socket.id)
})

socket.emit('ping')
socket.on('pong', (data) => {
  console.log('Pong:', data)
})
```

## Data Storage

Currently using file-based storage in `src/data/` directory:
- `caddies.json` - Caddie data

**Note**: This is temporary. PostgreSQL integration will be added later.

## Environment Variables

See `.env.example` for all available options.

Key variables:
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens
- `ALLOWED_ORIGINS` - CORS allowed origins
- `DATA_DIR` - Directory for data files

## Project Structure

```
server/
├── src/
│   ├── config/          - Configuration (env, data store)
│   ├── controllers/     - Request handlers
│   ├── middleware/      - Auth, error handling
│   ├── routes/          - API route definitions
│   ├── services/        - Business logic
│   ├── types/           - TypeScript types
│   ├── utils/           - Utilities (JWT, logger)
│   ├── data/            - Data storage (JSON files)
│   └── server.ts        - Entry point
├── tests/
│   ├── unit/            - Unit tests
│   └── integration/     - Integration tests
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Authentication

### Test Credentials

For testing, use:
- Email: `admin@caddiepro.com`
- Password: any password (temporary mock)

### Roles

- **admin**: Full access (create, read, update, delete)
- **operator**: Limited write access (create, update)
- **viewer**: Read-only access

## Testing

Tests use Vitest framework:

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/unit/jwt.test.ts
```

## Linting

```bash
# Check for lint errors
npm run lint

# Type checking
npm run type-check
```

## Next Steps

- [ ] Add PostgreSQL database integration
- [ ] Implement Prisma ORM
- [ ] Add more WebSocket events
- [ ] Add Lists and Schedule endpoints
- [ ] Add input validation with Zod
- [ ] Add rate limiting
- [ ] Add request logging middleware
- [ ] Improve error messages

## Troubleshooting

### Port already in use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Cannot find module

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
# Clean build
rm -rf dist
npm run build
```

## Support

For issues or questions, see main project documentation:
- [Backend Implementation Plan](../BACKEND_IMPLEMENTATION_PLAN.md)
- [Backend Quick Start](../BACKEND_QUICKSTART.md)
- [Backend Architecture](../BACKEND_ARCHITECTURE.md)
