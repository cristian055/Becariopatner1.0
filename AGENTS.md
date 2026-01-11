# AGENTS.md - CaddiePro Frontend Development Guide

Multi-sport venue management system. **Tech Stack:** React 19, TypeScript, Tailwind CSS, Vite, Zustand.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 5173, host 0.0.0.0)
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build (port 4173)
npm run type-check       # TypeScript check without emit

# Linting & Formatting
npm run lint             # ESLint check (max 0 warnings)
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format (includes tailwind-merge)
npm run format:check     # Prettier check (verify code is formatted)

# Testing (Vitest + React Testing Library + Playwright)
npm run test             # Run all unit tests
npm run test -- path/to/file.test.tsx           # Run single test file
npm run test -- -t "test name"                  # Run tests matching name pattern
npm run test:coverage    # Run tests with coverage (80% threshold)
npm run test:ui          # Vitest UI mode (watch + debug)
npm run test:e2e         # Playwright E2E tests (3 browsers)
npm run test:e2e:ui      # Playwright UI mode (watch tests)
```

## Critical Standards

1. **English only** - All code, comments, UI text, documentation, commit messages.
2. **No emojis** - Professional code only (no emojis in code comments or logs).
3. **No business logic in components** - Extract to hooks/services. Components should be UI-only.
4. **Every component needs a .css file** with the same name (BEM naming convention).
5. **Max 200 lines per component** - Split if exceeded (subcomponents, extract logic).
6. **No `any` types** - TypeScript strict mode enabled. Use proper types or generics.
7. **Clean commits** - Only commit functional, type-safe code. Always build before commit.
8. **No path aliases for file tools** - Never use `@/` to access files with tools (Read, Write, Edit, Glob). Use relative paths `./` or absolute paths.
9. **Singleton services** - Export class instances (e.g., `export const caddieService = new CaddieService()`)
10. **Sync backend updates** - Always call backend API first, then update local state. WebSocket events handle backend pushes.

## File Structure

```
src/
  components/
    ui/           # Reusable: Button, Input, Modal, Badge, Tabs, Select, Table, Card
    layout/       # Header, Sidebar, Layout, MonitorNavBar
    features/     # Feature components (CaddieManager, WeeklyDraw, ListManager, PublicQueue)
  hooks/          # Custom hooks (business logic state, no UI) - useCaddies, useLists, useFilters
  services/       # API clients, business logic, validation - caddieApiService, listApiService, socketService
  stores/         # Zustand global state - CaddieStore, ListStore, ScheduleStore, PublicStore, UIStore
  types/          # TypeScript definitions - index.ts (shared), store.types.ts
  utils/          # Pure utilities - logger, filters, sorters, validation, time
  tests/          # Test setup (setup.ts) and utilities
```

## Code Style

### Formatting (Prettier)
- No semicolons, single quotes, 2-space indentation.
- Trailing commas (ES5), 100 char line width, LF line endings.
- Arrow parens always, bracket spacing enabled.
- CSS uses double quotes, 2-space indentation.
- Prettier runs on pre-commit via husky.

### ESLint Rules
- No `console.log` (use logger instead), `console.warn` and `console.error` allowed.
- No `debugger` statements.
- Avoid `alert()` - prefer UI notifications/toasts.
- Use `const`/`let`, no `var`.
- Prefer arrow functions for callbacks.
- Import order enforced: React → third-party → internal with `@/` alias → local styles.
- Type-only imports must use `import type { ... }` syntax.

### Import Order (Enforced by ESLint)
1. React imports (`import * as React from 'react'`)
2. Third-party libraries (Radix UI, lucide-react, recharts, etc.)
3. Types (`import type { ... }` - ESLint error if missing for type-only imports)
4. Local imports with `@/` alias (`import { something } from '@/services'`)
5. Styles (last, use relative paths for CSS): `import './Component.css'`

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase + .tsx | `CaddieManager.tsx` |
| Hooks | camelCase + use prefix + .ts | `useCaddies.ts`, `useLists.ts` |
| Services | camelCase + Service suffix + .ts | `caddieService.ts`, `listApiService.ts` |
| Service classes | PascalCase + Service | `class CaddieService` |
| Store files | camelCase + Store suffix + .ts | `caddieStore.ts`, `listStore.ts` |
| Stores | use + PascalCase + Store | `useCaddieStore`, `useListStore` |
| Types/Interfaces | PascalCase | `interface Caddie`, `type Status` |
| Constants | UPPER_SNAKE_CASE | `INITIAL_CADDIES`, `LIST_ORDER_TYPES` |
| CSS classes | kebab-case (BEM) | `.caddie-manager__header` |
| Error codes | UPPER_SNAKE_CASE | `ERROR_CODES.VALIDATION_ERROR` |

### Component & Hook Patterns
- Use `React.FC<Props>` for components with type inference.
- Define props in separate `.types.ts` file if they exceed 5 lines.
- Wrap complex handlers in `useCallback` to prevent re-renders.
- Use `useMemo` for derived data (filtered lists, computed statistics).
- Hooks return `{ data, loading, error, ...actions }` object for consistency.
- Hooks must expose `error: string | null` and `loading: boolean` states.
- Component files should be UI-only, call hooks for business logic.

### BEM CSS Naming
```css
.component {}
.component__element {}
.component__element--modifier {}
.component--modifier {}
```

## Error Handling & Logging

- Use central `logger` utility (`src/utils/logger.ts`) for all logging.
- Logger methods: `debug()`, `info()`, `warn()`, `error()`, `serviceError()`, `apiCall()`, `apiResponse()`, `apiError()`, `action()`, `stateChange()`, `performance()`.
- Services throw `ServiceError(message, code, details)` from `src/types/store.types.ts`.
- Validation utils return `{ valid: boolean, errors: string[] }`.
- Always handle errors in try/catch with proper error messages.
- Set `error` state in stores on API failures.

```typescript
try {
  await apiService.createCaddie(input);
  logger.info('Caddie created successfully');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  setError(errorMessage);
  logger.error('Failed to create caddie', error);
}
```

## TypeScript Rules (Strict Mode)

- `interface` for object shapes, `type` for unions/aliases/primitives.
- Unused vars prefixed with `_` are allowed.
- No non-null assertions (`!`) without justification.
- Explicit function return types recommended (ESLint warn).
- `noUncheckedIndexedAccess` enabled - handle undefined from array/object access.
- Consistent type imports enforced: `import type { ... }` for types only.
- Generic types must have proper constraints.

## Testing

### Unit Tests (Vitest + React Testing Library)
- Test files: `ComponentName.test.tsx` alongside component.
- Setup file: `src/tests/setup.ts` (runs before all tests).
- Use `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- Structure: `describe('Component Name', () => { it('should...', () => {}) })`
- Mock external dependencies with `vi.fn()`, `vi.mock()`.
- Clean DOM in `beforeEach` if needed.
- Focus on behavior, not implementation details.

### Coverage (80% Threshold)
- All metrics (lines, functions, branches, statements) require 80%+ coverage.
- Excludes: `node_modules/`, `src/tests/`, `*.config.ts/js`, `*.test.tsx`, `*.types.ts`.
- Run: `npm run test:coverage` (generates text, json, html reports).
- CI/CD enforces coverage threshold (blocks PR if < 80%).

### E2E Tests (Playwright)
- Directory: `tests/e2e/` (note: not `src/`).
- Browsers: Chromium, Firefox, WebKit.
- Base URL: `http://localhost:5173`
- Run: `npm run test:e2e` (starts dev server automatically).
- Use `page.` methods for user interactions, not raw selectors.

## State Management (Zustand)

### Store Architecture
- **CaddieStore**: Master data, dispatch batches, CRUD operations, reordering.
- **ListStore**: List configuration and sorting logic, range management.
- **ScheduleStore**: Weekly shifts and assignments management.
- **PublicStore**: Public monitor data, queue updates, dispatch popups.
- **UIStore**: Modals, notifications, global UI state.

### Store Patterns
- All stores export typed interfaces for type safety.
- Use selector pattern sparingly (use `useStore.getState().method` for actions).
- Separate concerns: each store has a specific domain.
- Update local state immediately for UI feedback, then sync with backend.
- WebSocket events update stores directly for real-time sync.

### Zustand Usage
```typescript
// Direct store access (for event handlers, outside React)
const { setCaddies } = useCaddieStore.getState();

// React hook access (components)
const { caddies, loading, error } = useCaddieStore();

// Actions (async - call backend API)
updateCaddie: async (input) => {
  await caddieApiService.updateCaddie(input);
  set(state => ({ caddies: state.caddies.map(...) }));
}
```

## API Integration

- All API calls go through services (`src/services/*ApiService.ts`).
- Services are singleton instances (`export const apiService = new ApiService()`).
- Central `apiClient` handles request/response formatting.
- Services return typed data or throw errors.
- WebSocket events handled by `socketService` singleton.
- Always sync state with backend before updating UI.

```typescript
// Correct pattern
const handleUpdate = async (id: string, updates: Partial<Caddie>) => {
  try {
    await caddieApiService.updateCaddie({ id, updates });
    updateCaddie({ id, updates }); // Update local state
  } catch (error) {
    logger.error('Failed to update caddie', error);
    setError('Failed to update caddie');
  }
}
```

## Daily Attendance Tracking

### Data Model
```typescript
export enum DailyAttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE'
}

export interface DailyAttendance {
  id: string
  caddieId: string
  caddie?: {
    id: string
    name: string
    number: number
    category: 'Primera' | 'Segunda' | 'Tercera'
    location: string
  }
  date: string
  status: DailyAttendanceStatus
  arrivalTime?: string
  servicesCount: number
  createdAt?: string
  updatedAt?: string
}
```

### Service: attendanceApiService
Singleton service for daily attendance operations:
- `createDailyAttendance(input)` - Create attendance record
- `getDailyAttendance(date)` - Get all records for a date
- `getDailyAttendanceStats(date)` - Get summary statistics
- `updateDailyAttendance(id, input)` - Update existing record
- `getDailyAttendanceReport(date)` - Get detailed report
- `closeDay(date)` - Close and archive day

### List Manager Integration
When clicking attendance buttons in QueueGrid:
- "Salir a Cargar" → Creates `PRESENT` attendance with arrival time
- "No vino" → Creates `ABSENT` attendance
- "Permiso" → Creates `ON_LEAVE` attendance
- "Tarde" → Creates `LATE` attendance with arrival time

### Reports Integration
Reports view displays daily statistics:
- **Salieron** (Caddies who worked): `PRESENT` + `LATE`
- **No Vinieron** (Caddies absent): `ABSENT`
- **Tienen Permiso** (Caddies on leave): `ON_LEAVE`
- **Llegaron Tarde** (Caddies late): `LATE`

Real-time updates via `socketService.onDailyAttendanceUpdated()`.

### WebSocket Event Handling
```typescript
// In Reports component
useEffect(() => {
  const unsubscribe = socketService.onDailyAttendanceUpdated((data) => {
    setDailyAttendance(prev => {
      const index = prev.findIndex(a => a.id === data.id)
      if (index !== -1) {
        const updated = [...prev]
        updated[index] = { ...prev[index], ...data }
        return updated
      }
      return [...prev, data as DailyAttendance]
    })
  })
  return unsubscribe
}, [])
```

## Environment Variables

```bash
# Local Development (.env)
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_APP_NAME=CaddiePro
VITE_APP_ENV=development

# Production (.env.production)
VITE_API_URL=https://backend-caddiepro-production.up.railway.app/api
VITE_WS_URL=https://backend-caddiepro-production.up.railway.app
```

- Use `import.meta.env.VITE_*` to access environment variables.
- Backend expects port 3000, frontend uses 5173 (not 3001).
- All VITE_ variables are available to client-side code.

## WebSocket Integration

**Critical**: Use `socketService` singleton. Backend sends `{ event, data: {...}, timestamp }`.

```typescript
// Extract nested data from backend
const eventData = (rawData as { data?: unknown }).data || rawData;

// Event handlers in App.tsx or components
const unsubscribeDispatched = socketService.onCaddieDispatched((data) => {
  handleCaddieDispatched(data as DispatchEvent);
});
```

**Events**:
- `caddie:dispatched` - Batch dispatch event (popup animation)
- `caddie:status_changed` - Single caddie status update
- `queue:updated` - Queue refreshed (category + queue data)
- `list:updated` - List configuration changed
- `schedule:updated` - Weekly schedule changes
- `daily_attendance:updated` - Daily attendance record updated (real-time Reports sync)

**Rooms**: `list-1` (Primera), `list-2` (Segunda), `list-3` (Tercera)

**Auth**: Public users connect without token. Use `?lists=1,2,3` query param or `subscribe` event.

## Git Commits

Format: `type(scope): description` - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`

**Examples**:
- `feat(list-manager): add reverse order button`
- `fix(api): resolve WebSocket connection timeout`
- `refactor(stores): simplify state update logic`
- `test(public-queue): add coverage for caddie dispatch`
- `chore(deps): upgrade socket.io-client to v4.8.3`
- `style(button): improve hover states`

## Common Issues & Troubleshooting

1. **Import errors** - Always include `.ts`/`.tsx` extensions in imports (ESLint enforces this).
2. **Build fails** - Run `npm run type-check` first to see TypeScript errors.
3. **Test coverage < 80%** - Check exclusions in vite.config.ts, add more tests if needed.
4. **WebSocket not connecting** - Verify `VITE_WS_URL` protocol (http/ws or https/wss), check CORS on backend.
5. **Tailwind not working** - Ensure PostCSS config includes tailwindcss, check import order in index.css.
6. **State not updating** - Use Zustand action functions, not direct set(). Check for stale closures.
7. **Husky pre-commit failing** - Run `npm run lint:fix` and `npm run format` before commit.
8. **Build bundle too large** - Consider code-splitting with dynamic import(), check dependencies.
9. **Type errors with props** - Define props in separate `.types.ts` file if complex.
10. **Zustand persist issues** - Not using persist middleware - state is in-memory only.

## Running Single Tests

```bash
# Run single test file
npm run test -- src/components/features/CaddieManager/CaddieTable.test.tsx

# Run tests matching pattern
npm run test -- -- -t "should filter caddies"

# Run in watch mode for a specific file
npm run test:ui -- src/components/features/PublicQueue/PublicQueue.test.tsx

# Run E2E test for specific file
npm run test:e2e tests/e2e/login.spec.ts
```
