# PostgreSQL Database Setup with Prisma

## Database Connection

### Development/Staging Database (Railway)
```
postgresql://postgres:jcykfafpKQaPwjsApczQfJyMhgjxlUCq@turntable.proxy.rlwy.net:57167/railway
```

**Note**: This database URL will be changed in production.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env` file should already contain the DATABASE_URL. Verify it's set correctly:
```bash
cat .env | grep DATABASE_URL
```

### 3. Run Migrations (When Database is Accessible)
```bash
# Create and apply migrations
npm run prisma:migrate

# Or push schema directly without migrations (for development)
npm run db:push
```

### 4. Seed the Database
```bash
npm run db:seed
```

This will create:
- 3 default users (admin, operator, viewer) - password: `test`
- 3 list configurations (Primera, Segunda, Tercera)
- 100 caddies with availability data

### 5. Generate Prisma Client
```bash
npm run prisma:generate
```

## Database Schema

### Models

1. **User** - Authentication and authorization
   - id, email, password, name, role, isActive
   - Roles: ADMIN, OPERATOR, VIEWER

2. **Caddie** - Main entity for caddie management
   - id, name, number, status, category, location, role
   - Counters: historyCount, absencesCount, lateCount, leaveCount
   - Relations: availability, assignments

3. **DayAvailability** - Caddie availability per day
   - day (Friday-Sunday), isAvailable, rangeType, rangeTime
   - Belongs to: Caddie

4. **ListConfig** - Queue/list configuration
   - name, category, order (ASC/DESC/RANDOM/MANUAL), rangeStart, rangeEnd

5. **WeeklyShift** - Shift definitions for weekly schedules
   - day, startTime, endTime, location, role
   - Relations: requirements, assignments

6. **ShiftRequirement** - Requirements per shift
   - category, count
   - Belongs to: WeeklyShift

7. **WeeklyAssignment** - Caddie assignments to shifts
   - shiftId, caddieId, priority
   - Belongs to: WeeklyShift, Caddie

## Prisma Commands

### Development
```bash
# Open Prisma Studio (DB GUI)
npm run prisma:studio

# Generate Prisma Client after schema changes
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Push schema changes without migration
npm run db:push

# Seed database
npm run db:seed
```

### Production
```bash
# Deploy migrations
npm run prisma:migrate:prod

# Seed production database
npm run db:seed
```

## Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:generate` to update TypeScript types
3. Run `npm run prisma:migrate` to create and apply migration
4. Commit the migration files in `prisma/migrations/`

## Troubleshooting

### Cannot reach database server
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Test database connection
npx prisma db pull
```

### Reset database (Development only!)
```bash
# WARNING: This deletes all data
npx prisma migrate reset
```

### View database content
```bash
# Open Prisma Studio
npm run prisma:studio
```

## Migration to Production

When moving to production database:

1. Update `DATABASE_URL` in `.env` (or set as environment variable)
2. Run migrations:
   ```bash
   npm run prisma:migrate:prod
   ```
3. Seed if needed:
   ```bash
   npm run db:seed
   ```

## Default Users (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@caddiepro.com | test | ADMIN |
| operator@caddiepro.com | test | OPERATOR |
| viewer@caddiepro.com | test | VIEWER |

**Important**: Change these passwords in production!

## Database Backup

### Export data
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Import data
```bash
psql $DATABASE_URL < backup.sql
```

## Performance

- Indexes are defined on frequently queried fields (status, category, isActive)
- Cascading deletes for related records
- Connection pooling via Prisma (automatic)

## Security

- Never commit `.env` file with real credentials
- Use environment variables in production
- Rotate database passwords regularly
- Use read-only users for reporting/analytics
