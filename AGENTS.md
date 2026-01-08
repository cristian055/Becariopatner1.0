# CaddiePro - Agent Development Guide

## Project Overview
CaddiePro is a multi-sport venue management system for Club Campestre Medellín, handling caddie queues, dispatch operations, and weekly scheduling across multiple locations (Llanogrande, Medellín) and disciplines (Golf, Tennis, Hybrid).

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vite

---

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Note:** No test or lint commands are currently configured. Add ESLint/Prettier for code quality enforcement.

---

## Code Style Guidelines

### Language Requirements

**ALL** code, comments, documentation, and variable names must be in **English**:
- UI labels: "Turn Management", "New Caddie", "Save"
- Variable names: `updateCaddie`, `getCategoryTop`
- Comments: `// Update caddie status`
- Interface descriptions: `interface Caddie { name: string; }`
- File names: `ComponentName.tsx`, `ComponentName.css`

**NO EMOJIS** in any code, comments, or documentation.

### File Structure

```
/home/quiroz/Documentos/projects/Becariopatner1.0/
├── App.tsx                 # Main app component with routing
├── index.tsx               # React entry point
├── vite.config.ts          # Vite configuration
├── src/
│   ├── components/          # React components
│   │   ├── ui/          # Reusable UI components (Button, Card, Modal)
│   │   ├── features/     # Feature-specific components (CaddieManager, ListManager)
│   │   └── layout/      # Layout components (Header, Sidebar, Footer)
│   ├── hooks/            # Custom React hooks (useCaddieSystem, useDispatchMonitor)
│   ├── services/         # Business logic and data operations
│   ├── store/            # State management (Zustand/Context)
│   ├── types/            # Organized TypeScript types by domain
│   │   ├── caddie.ts
│   │   ├── queue.ts
│   │   └── index.ts
│   ├── utils/            # Utility functions and helpers
│   └── constants/        # Application constants
└── *.css                # Component-specific styles
```

### Component Architecture

**Each component MUST have:**
1. Separate `.css` file with same name as component
2. Logic extracted to custom hooks or services
3. TypeScript interfaces defined in `types/` directory
4. Pure component - business logic outside

**Example Structure:**
```
components/
  ├── ListManager.tsx         # UI only, receives data and handlers as props
  ├── ListManager.css          # All component styles
  └── hooks/
      └── useListManager.ts    # All logic extracted to custom hook
```

### Component Declaration

```typescript
import React, { FunctionComponent } from 'react';
import { ComponentProps } from '../types';
import './ComponentName.css';

const ComponentName: FunctionComponent<ComponentProps> = ({ prop1, prop2 }) => {
  // Only UI logic here - no business logic
  return <div className="component-container">...</div>;
};

export default ComponentName;
```

### Custom Hooks for Logic

**Extract ALL business logic to custom hooks:**

```typescript
// hooks/useListLogic.ts
import { useState, useMemo, useCallback } from 'react';
import { Caddie, ListConfig } from '../types';

export const useListLogic = (caddies: Caddie[], lists: ListConfig[]) => {
  const [activeTabId, setActiveTabId] = useState<string>(lists[0]?.id);

  const getQueue = useMemo(() => (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return [];
    return caddies
      .filter(c => c.isActive && c.number >= list.rangeStart && c.number <= list.rangeEnd)
      .sort((a, b) => a.weekendPriority - b.weekendPriority);
  }, [caddies, lists]);

  return { activeTabId, setActiveTabId, getQueue };
};
```

### Styling Rules

**REQUIRED:** Each component MUST have its own `.css` file.

```css
/* components/ListManager.css */
.component-container {
  @apply flex flex-col h-full space-y-6;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Tailwind Usage:**
- Use Tailwind for layout, spacing, colors
- Use custom CSS for complex animations and component-specific styles
- Avoid inline styles at all costs

### State Management

**Use Context API or Zustand for shared state:**

```typescript
// store/caddieStore.ts (Zustand example)
import create from 'zustand';
import { Caddie } from '../types';

interface CaddieStore {
  caddies: Caddie[];
  updateCaddie: (id: string, updates: Partial<Caddie>) => void;
}

export const useCaddieStore = create<CaddieStore>((set) => ({
  caddies: [],
  updateCaddie: (id, updates) =>
    set((state) => ({
      caddies: state.caddies.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}));
```

**No prop drilling:** Use stores for shared state, props only for component-specific data.

### Service Layer

**Business logic in services:**

```typescript
// services/caddieService.ts
import { Caddie, CaddieStatus } from '../types';

export const caddieService = {
  filterByStatus: (caddies: Caddie[], status: CaddieStatus) => {
    return caddies.filter((c) => c.status === status);
  },

  sortByPriority: (caddies: Caddie[]) => {
    return [...caddies].sort((a, b) => a.weekendPriority - b.weekendPriority);
  },

  generateId: () => `c-${Math.random().toString(36).substr(2, 9)}`,
};
```

### TypeScript Conventions

**Organize types by domain:**

```typescript
// types/caddie.ts
export interface Caddie {
  id: string;
  name: string;
  number: number;
  status: CaddieStatus;
  isActive: boolean;
  category?: 'First' | 'Second' | 'Third';
  location: CaddieLocation;
  role: CaddieRole;
  weekendPriority: number;
}

export enum CaddieStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PREP = 'IN_PREP',
  IN_FIELD = 'IN_FIELD',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE',
}

export type CaddieLocation = 'Llanogrande' | 'Medellín';
export type CaddieRole = 'Golf' | 'Tennis' | 'Hybrid';
```

```typescript
// types/index.ts
export * from './caddie';
export * from './queue';
export * from './shift';
```

### Naming Conventions

- **Components:** PascalCase (`ListManager`, `PublicQueue`)
- **Files:** PascalCase (`ListManager.tsx`, `ListManager.css`)
- **Functions/Variables:** camelCase (`updateCaddie`, `getCategoryTop`)
- **Interfaces/Types:** PascalCase (`Caddie`, `ListConfig`)
- **Constants:** UPPER_SNAKE_CASE (`INITIAL_CADDIES`, `DEFAULT_AVAILABILITY`)
- **Enums:** PascalCase (`CaddieStatus`, `CaddieRole`)
- **State setters:** `set` prefix (`setIsAdmin`, `setCurrentPath`)
- **Custom hooks:** `use` prefix (`useListLogic`, `useCaddieOperations`)
- **Services:** lowercase camelCase (`caddieService`, `queueService`)

### Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect, useMemo } from 'react';

// 2. Third-party libraries
import { Icon1, Icon2 } from 'lucide-react';

// 3. Local type imports
import { Caddie, ListConfig } from '../types';

// 4. Services
import { caddieService } from '../services/caddieService';

// 5. Custom hooks
import { useListLogic } from '../hooks/useListLogic';

// 6. Local component imports
import Component1 from './Component1';
import './ComponentName.css';
```

### Error Handling

**Centralized error handling:**

```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public severity?: 'low' | 'medium' | 'high'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    console.error(`[${error.code}] ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
};
```

**Error Boundaries:**

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo } from 'react';
import './ErrorBoundary.css';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-boundary">Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### Navigation

**React Router for proper routing:**

```typescript
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Usage in components
const navigate = useNavigate();
navigate('/admin');
navigate('/monitor');

// Wrap app in App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/monitor" element={<PublicQueue />} />
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/" element={<Navigate to="/monitor" replace />} />
  </Routes>
</BrowserRouter>
```

### Data Patterns

**Immutable updates:**

```typescript
// Update array
setCaddies(prev => [...prev, newItem]);

// Update object
setCaddies(prev => prev.map(c =>
  c.id === id ? { ...c, ...updates } : c
));

// Bulk updates
setCaddies(prev => prev.map(c => {
  const update = updates.find(u => u.id === c.id);
  return update ? { ...c, ...update } : c;
}));
```

**Filtering & sorting in services:**

```typescript
// services/caddieService.ts
export const filterAndSortCaddies = (
  caddies: Caddie[],
  filters: { category?: string; isActive?: boolean }
): Caddie[] => {
  return caddies
    .filter(c => {
      if (filters.category && c.category !== filters.category) return false;
      if (filters.isActive !== undefined && c.isActive !== filters.isActive) return false;
      return true;
    })
    .sort((a, b) => a.weekendPriority - b.weekendPriority);
};
```

### Performance Guidelines

- Use `useMemo` for filtered/sorted lists
- Use `useCallback` for handlers passed to children
- Lazy load components with `React.lazy()` and `Suspense`
- Code splitting by route
- Virtualize long lists (react-window or react-virtualized)
- Avoid unnecessary re-renders with proper memoization

### Testing Requirements

**Test structure:**

```typescript
// __tests__/components/ListManager.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ListManager from '../components/ListManager';

describe('ListManager', () => {
  it('should render caddie list', () => {
    render(<ListManager caddies={mockCaddies} lists={mockLists} />);
    expect(screen.getByText('Turn Management')).toBeInTheDocument();
  });

  it('should call updateCaddie when button clicked', () => {
    const onUpdateCaddie = jest.fn();
    render(<ListManager onUpdateCaddie={onUpdateCaddie} {...props} />);
    fireEvent.click(screen.getByText('Authorize'));
    expect(onUpdateCaddie).toHaveBeenCalled();
  });
});
```

### Documentation

**JSDoc comments for complex functions:**

```typescript
/**
 * Filters and sorts caddies based on provided criteria
 * @param caddies - Array of caddie objects
 * @param filters - Filter criteria including category and active status
 * @returns Filtered and sorted array of caddies
 */
export const filterCaddies = (
  caddies: Caddie[],
  filters: FilterCriteria
): Caddie[] => {
  // Implementation
};
```

### Code Quality Checks

**Before committing:**
1. All code in English (no Spanish, no emojis)
2. Each component has matching .css file
3. No logic in components (extracted to hooks/services)
4. Proper TypeScript types defined
5. Props properly typed
6. Error handling in place
7. No console.log statements
8. No inline styles
9. No prop drilling for shared state
10. Tests written for new features

---

## Testing Configuration

**Add to package.json:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Important Notes

1. **Language:** All code, comments, documentation, and UI text must be in English
2. **No emojis:** Do not use emojis in code, comments, or documentation
3. **Separation:** Component files contain only UI logic. Business logic in services/hooks
4. **Styles:** Each component MUST have its own `.css` file
5. **Types:** All types organized in `src/types/` by domain
6. **State:** Use stores (Zustand/Context) for shared state, no prop drilling
7. **Routing:** Use React Router instead of hash-based routing
8. **Dev server:** Runs on port 3000 by default
9. **Tests:** Write tests for all new features and changes
10. **TypeScript:** Check manually with `npx tsc --noEmit` before committing
