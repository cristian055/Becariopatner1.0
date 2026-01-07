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

### File Structure
```
/home/quiroz/Documentos/projects/Becariopatner1.0/
├── App.tsx                 # Main app component with routing
├── index.tsx               # React entry point
├── types.ts                # All TypeScript type definitions
├── vite.config.ts          # Vite configuration
├── components/             # React components
├── hooks/                  # Custom React hooks
└── *.css                   # Component-specific styles
```

### TypeScript Conventions

**Types & Interfaces:**
- Define all interfaces/exports in `types.ts`
- Use `enum` for fixed value sets: `enum CaddieStatus { AVAILABLE = 'AVAILABLE', ... }`
- Union types for constrained strings: `type CaddieLocation = 'Llanogrande' | 'Medellín'`
- Optional fields with `?` suffix
- Explicit return types for functions

**Example:**
```typescript
export interface Caddie {
  id: string;
  name: string;
  number: number;
  status: CaddieStatus;
  isActive: boolean;
  category?: 'Primera' | 'Segunda' | 'Tercera';
  location: CaddieLocation;
  role: CaddieRole;
  weekendPriority: number;
}
```

### React Component Patterns

**Component Declaration:**
```typescript
import React from 'react';
import { ComponentProps } from '../types';

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return <div>...</div>;
};

export default ComponentName;
```

**State Management:**
- Use `useState` for local component state
- Use `useMemo` for expensive computations
- Use `useCallback` for function props passed to children
- Custom hooks in `hooks/` folder for shared logic

**Example:**
```typescript
const [state, setState] = useState<Type>(initialValue);
const [isOpen, setIsOpen] = useState(false);
const [editingItem, setEditingItem] = useState<Item | null>(null);
```

### Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect, useMemo } from 'react';

// 2. Third-party libraries
import { Icon1, Icon2 } from 'lucide-react';

// 3. Local type imports
import { Type1, Type2 } from '../types';

// 4. Local component imports
import Component1 from './Component1';
import { useCustomHook } from '../hooks/useCustomHook';
```

### Naming Conventions

- **Components:** PascalCase (`ListManager`, `PublicQueue`)
- **Functions/Variables:** camelCase (`updateCaddie`, `getCategoryTop`)
- **Interfaces/Types:** PascalCase (`Caddie`, `ListConfig`)
- **Constants:** UPPER_SNAKE_CASE (`INITIAL_CADDIES`, `DEFAULT_AVAILABILITY`)
- **Enums:** PascalCase (`CaddieStatus`, `CaddieRole`)
- **State setters:** `set` prefix (`setIsAdmin`, `setCurrentPath`)

### Styling with Tailwind CSS

**Principles:**
- Use utility classes only
- Avoid inline styles
- Responsive design: `md:` for tablets, `lg:` for desktop
- Custom color scheme: `bg-campestre-*`, `bg-arena`
- Animation classes: `animate-in fade-in duration-300`

**Common patterns:**
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-2xl">
  <h2 className="text-xl font-black text-campestre-800">Title</h2>
  <button className="px-4 py-2 bg-campestre-500 text-white rounded-xl">
    Action
  </button>
</div>
```

**Custom CSS:** Create `ComponentName.css` for specific animations not covered by Tailwind.

### Language Requirements

**ALL** text visible to users, variable names, comments, and interface descriptions must be in **Spanish**:
- UI labels: "Gestión Turnos", "Nuevo Caddie", "Guardar"
- Status values: `CaddieStatus.ABSENT = 'ABSENT'` (exception: enum keys)
- Comments: `// Actualizar estado del caddie`
- Type descriptions: `interface Caddie { name: string; }`

### Error Handling

**State-based error handling:**
```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = () => {
  setError(null);
  if (!input.value) {
    setError("El campo es obligatorio");
    return;
  }
  // Process...
};
```

**Display errors:**
```tsx
{error && (
  <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
    {error}
  </div>
)}
```

### Navigation

Hash-based routing (see `App.tsx:46-61`):
```typescript
const navigate = (path: string) => {
  window.location.hash = path;
};

// Usage
navigate('#/admin');
navigate('#/monitor');
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

**Filtering & sorting:**
```typescript
const filtered = data.filter(item => 
  item.isActive && item.category === category
).sort((a, b) => a.priority - b.priority);
```

### Key Features & Architecture

**Multi-location support:**
- Each `Caddie` has `location` ('Llanogrande' | 'Medellín')
- Filter by location in components

**Role-based system:**
- `CaddieRole`: 'Golf' | 'Tennis' | 'Híbrido'
- Display role badges in UI

**Weekly priority system:**
- `weekendPriority` for randomization
- Fisher-Yates shuffle in `useCaddieSystem.ts:94-105`

**Dispatch monitoring:**
- Real-time popup alerts (see `useDispatchMonitor.ts`)
- 8-second auto-dismiss timeout

### Component Communication

**Parent-to-child:** Pass data as props
**Child-to-parent:** Callback functions: `onUpdateCaddie(id, updates)`
**State lifting:** Common state in parent components
**Custom hooks:** Shared logic in `hooks/` folder

### Performance Guidelines

- Use `useMemo` for filtered/sorted lists
- Use `useCallback` for handlers passed to children
- Lazy load components with `React.lazy()` if needed
- Avoid unnecessary re-renders with proper memoization

---

## Testing (Not Configured)

Currently no test framework is set up. Recommended additions:
- Vitest for unit tests
- React Testing Library for component tests
- Add test scripts to package.json

---

## ESLint/Prettier (Not Configured)

Currently no linting/formatting tools are configured. Recommended:
- Add ESLint with `@typescript-eslint`
- Add Prettier for consistent formatting
- Configure pre-commit hooks for code quality

---

## Important Notes

1. **Language:** All user-facing text, variable names, and comments must be in Spanish
2. **Types:** All types are centralized in `types.ts` - add new types there
3. **State:** Use the centralized `useCaddieSystem` hook for caddie data management
4. **Routing:** Hash-based routing via `window.location.hash`
5. **Dev server:** Runs on port 3000 by default
6. **No build-time checks:** No TypeScript compilation errors in build (check manually with `npx tsc --noEmit`)
7. **No emojis:** Do not use emojis in code or comments for professionalism and clarity
