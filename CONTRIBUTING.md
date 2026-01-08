# Contributing to CaddiePro

Thank you for your interest in contributing to CaddiePro! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Becariopatner1.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development Commands

```bash
# Development
npm run dev                # Start development server on port 3000

# Building
npm run build              # Build for production
npm run preview           # Preview production build

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
npm run type-check        # Run TypeScript type checking

# Testing
npm run test              # Run unit tests
npm run test:ui           # Run tests with UI
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Run E2E tests with Playwright UI
```

## Code Style Guidelines

### Language Requirements

- **ALL** code, comments, documentation, and UI text must be in **English only**
- Code comments: `// Update caddie status` (not Spanish)
- UI labels: "Turn Management" (not "Gestión Turnos")
- Variable names: `updateCaddie` (not Spanish)
- No emojis in code or comments

### Component Structure

Every component MUST follow this structure:
```
ComponentName.tsx          # Component JSX only (<200 lines)
ComponentName.css           # All styles for this component
ComponentName.types.ts      # Component-specific types (if complex)
ComponentName.test.tsx     # Unit tests (required)
```

### Code Organization

- **Components (Presentation Layer):** Render JSX only, no business logic
- **Custom Hooks (Business Logic Layer):** Complex state management, data fetching, filtering/sorting
- **Services (Data Layer):** API calls, data transformation, external integrations
- **Utilities (Helper Layer):** Pure functions, no side effects

### File Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Modal)
│   ├── layout/           # Layout components (Header, Sidebar, Layout)
│   └── features/        # Feature components (CaddieManager, ListManager)
├── hooks/               # Custom React hooks (business logic only)
├── services/            # API and data operations
├── stores/             # Global state management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Constants and configuration
├── routes/             # Route definitions
└── styles/             # Global styles and theme
```

### TypeScript Guidelines

- Use `interface` for objects with methods
- Use `type` for unions, primitives, utility types
- Explicit return types for all functions
- No `any` types allowed
- Strict mode enabled
- Maximum 200 lines per component file

### Testing Requirements

- Every component MUST have tests
- Minimum 80% code coverage
- Use Vitest for unit tests
- Use React Testing Library for component tests
- Use Playwright for E2E tests

### Naming Conventions

- **Components:** PascalCase (`ListManager`, `PublicQueue`)
- **Custom Hooks:** camelCase with `use` prefix (`useCaddies`)
- **Functions/Variables:** camelCase (`updateCaddie`, `getCategoryTop`)
- **Interfaces/Types:** PascalCase (`Caddie`, `ListConfig`)
- **Constants:** UPPER_SNAKE_CASE (`INITIAL_CADDIES`, `DEFAULT_AVAILABILITY`)
- **CSS Classes:** kebab-case (`.caddie-manager`, `.sidebar-menu`)

### Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
- `feat(caddies): add caddie filtering by location`
- `fix(lists): resolve duplicate caddie assignment bug`
- `docs(readme): update installation instructions`
- `test(caddies): add unit tests for updateCaddie hook`

## Pull Request Process

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the guidelines above

3. Test your changes:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. Commit your changes with clear messages:
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

5. Push to your fork and create a pull request

### PR Checklist

Before submitting a PR, ensure:

- [ ] All tests pass (`npm run test`)
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Tests have >80% coverage
- [ ] Component files are under 200 lines
- [ ] Each component has a dedicated .css file
- [ ] All code is in English
- [ ] No emojis in code or comments
- [ ] No business logic inside components
- [ ] PR description clearly describes changes

## Code Review

All pull requests must be reviewed by at least one maintainer before merging. Reviewers will check for:

- Code quality and adherence to guidelines
- Test coverage and test quality
- TypeScript correctness
- Accessibility compliance (WCAG 2.1 AA)
- Performance considerations

## Questions or Issues?

- Open an issue on GitHub for bugs or feature requests
- Use the `bug` label for bugs
- Use the `enhancement` label for feature requests
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the project's license.
