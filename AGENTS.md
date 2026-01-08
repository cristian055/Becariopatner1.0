# CaddiePro - Agent Development Guide

Multi-sport venue management system. **Tech Stack:** React 19, TypeScript, Tailwind CSS, Vite, Zustand.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # TypeScript compile + Vite build
npm run type-check       # TypeScript check without emit

# Linting & Formatting
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format
npm run format:check     # Prettier check

# Testing (Vitest + Playwright)
npm run test             # Run all unit tests
npm run test -- path/to/file.test.tsx           # Run single test file
npm run test -- -t "test name"                  # Run tests matching name
npm run test:coverage    # Run tests with coverage (80% threshold)
npm run test:ui          # Vitest UI
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode
```

## Critical Standards

1. **English only** - All code, comments, UI text, documentation
2. **No emojis** - Professional code only
3. **No business logic in components** - Extract to hooks/services
4. **Every component needs a .css file** with same name
5. **Max 200 lines per component** - Split if exceeded
6. **No `any` types** - TypeScript strict mode enabled

## File Structure

```
src/
  components/
    ui/           # Reusable: Button, Input, Modal
    layout/       # Header, Sidebar, Layout
    features/     # Feature components
  hooks/          # Custom hooks (business logic)
  services/       # API and data operations
  stores/         # Zustand global state
  types/          # TypeScript definitions
  utils/          # Pure utility functions
  tests/          # Test setup and utilities
```

## Code Style

### Formatting (Prettier)
- No semicolons
- Single quotes
- 2-space indentation
- Trailing commas (ES5)
- 100 char line width

### Import Order (enforced)
1. React imports
2. Third-party libraries
3. Types (`import type { ... }` - required by ESLint)
4. Local services/hooks/components
5. Styles (last)

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CaddieManager.tsx` |
| Hooks | camelCase + use prefix | `useCaddies.ts` |
| Services | camelCase | `caddieService.ts` |
| Types/Interfaces | PascalCase | `interface Caddie` |
| Constants | UPPER_SNAKE_CASE | `INITIAL_CADDIES` |
| CSS classes | kebab-case (BEM) | `.caddie-manager__header` |

### Component Pattern
```typescript
import React, { useState } from 'react'
import type { CaddieManagerProps } from './CaddieManager.types'
import { useCaddies } from '@/hooks/useCaddies'
import './CaddieManager.css'

const CaddieManager: React.FC<CaddieManagerProps> = ({ location }) => {
  // Only simple UI state in components
  const [isOpen, setIsOpen] = useState(false)
  
  // Business logic in hooks
  const { caddies, updateCaddie } = useCaddies()

  return <div className="caddie-manager">{/* JSX only */}</div>
}

export default CaddieManager
```

### Custom Hook Pattern
```typescript
import { useState, useCallback } from 'react'
import type { Caddie } from '@/types'

export const useCaddies = () => {
  const [caddies, setCaddies] = useState<Caddie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCaddies = useCallback(async () => {
    setLoading(true)
    try {
      // API call
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  return { caddies, loading, error, fetchCaddies }
}
```

## Error Handling

- Services: try/catch with user-friendly error messages
- Hooks: expose `error` and `loading` states
- Components: render `<ErrorAlert>` or `<LoadingSpinner>`

## TypeScript Rules

- Strict mode enabled
- No `any` types (ESLint error)
- Explicit return types (ESLint warning)
- Use `interface` for objects, `type` for unions/primitives
- Unused vars must be prefixed with `_`
- Path alias: `@/*` maps to `./src/*`

## Testing

- Test files: `ComponentName.test.tsx` alongside component
- Setup file: `src/tests/setup.ts`
- Coverage threshold: 80% (lines, functions, branches, statements)
- Use `@testing-library/react` for component tests

```typescript
import { render, screen } from '@testing-library/react'
import CaddieManager from './CaddieManager'

describe('CaddieManager', () => {
  it('renders caddie table', () => {
    render(<CaddieManager caddies={[]} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
```

## CSS Organization

- BEM naming: `.component__element--modifier`
- Tailwind for layout/spacing
- Custom CSS for component-specific styles
- Custom colors: `bg-campestre-*`, `bg-arena`

## State Management

- `useState`: Simple UI state (modals, toggles)
- Custom hooks: Business logic state
- Zustand stores: Cross-component global state
- `useMemo`: Expensive computations
- `useCallback`: Functions passed as props
