# CaddiePro - Management System

Aplication for managing caddie operations at Club Campestre Medellín.
This project is maintained by the Becario Partner Team.

A modern, multi-sport venue management system for Club Campestre Medellín. CaddiePro handles caddie queues, dispatch operations, and weekly scheduling across multiple locations and disciplines.

## Features

- **Multi-Location Support**: Manage caddies across Llanogrande and Medellín locations
- **Multi-Discipline**: Support for Golf, Tennis, and Hybrid roles
- **Queue Management**: Real-time caddie queue tracking and dispatch
- **Weekly Scheduling**: Automated shift assignment with availability-based algorithms
- **Priority System**: Weekend priority with Fisher-Yates shuffle for fair assignments
- **Real-time Alerts**: 8-second popup notifications for dispatch events
- **Statistics & Reports**: Track caddie performance, absences, and service history
- **Drag & Drop**: Manual reordering of caddie queuesx
- **Bulk Operations**: Dispatch multiple caddies simultaneously

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Testing**: Vitest, React Testing Library, Playwright
- **Code Quality**: ESLint, Prettier, Husky

## Prerequisites

- Node.js 18+ and npm
- Modern web browser

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Becariopatner1.0

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development Commands

```bash
# Development
npm run dev                # Start development server
npm run build              # Build for production
npm run preview           # Preview production build

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format            # Format code with Prettier
npm run type-check        # TypeScript type checking

# Testing
npm run test              # Run unit tests
npm run test:ui           # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Modal)
│   ├── layout/           # Layout components (Header, Sidebar, Layout)
│   └── features/        # Feature components (CaddieManager, ListManager)
├── hooks/               # Custom React hooks (business logic)
├── services/            # API and data operations
├── stores/             # Global state management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Constants and configuration
├── routes/             # Route definitions
└── styles/             # Global styles and theme
```

## Key Features

### Caddie Management
- Create, edit, and deactivate caddie profiles
- Track caddie categories (Primera, Segunda, Tercera)
- Set availability by day and time range
- View service history and statistics

### Queue Management
- Real-time queue display by category
- Automatic dispatch with status tracking
- Manual reordering with drag & drop
- Bulk dispatch operations
- Handle absences, permissions, and tardiness

### Weekly Scheduling
- Define shift requirements by category
- Automated assignment based on availability
- Priority system for fair distribution
- Track skipped caddies for next week priority

### Public Monitor
- High-visibility display for caddie waiting area
- Real-time dispatch notifications
- Auto-dismissing popup alerts
- Show top 5 caddies per category

## Code Style Guidelines

### Core Principles

- **English-only**: All code, comments, and UI text in English
- **No emojis**: Professional code without emojis
- **Logic separation**: No business logic in components
- **CSS separation**: Every component has dedicated .css file
- **Size limit**: Maximum 200 lines per component
- **Test coverage**: Minimum 80% for all code

### Component Rules

- Components render JSX only (<200 lines)
- Dedicated CSS file for each component
- No business logic (extract to hooks/services)
- English-only code and comments
- TypeScript with strict types
- Accessibility attributes (WCAG 2.1 AA)

### Hook Rules

- Pure function logic
- Consistent return types
- Loading/error state handling
- useCallback/useMemo optimizations

## Testing

### Unit Tests

```bash
npm run test              # Run all unit tests
npm run test:ui           # Run with interactive UI
npm run test:coverage    # Generate coverage report
```

### E2E Tests

```bash
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Run with Playwright UI
```

## Code Quality

### Linting and Formatting

```bash
npm run lint              # Check for code issues
npm run lint:fix         # Auto-fix linting issues
npm run format            # Format code
npm run format:check      # Check formatting
```

### Pre-commit Hooks

Husky is configured to run:
- Lint staged files
- Format code with Prettier
- Run type checking

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
GEMINI_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_ANALYTICS=false
```

## Deployment

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

### Quick Contribution Checklist

- [ ] All tests pass (`npm run test`)
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Coverage >80%
- [ ] Components under 200 lines
- [ ] Dedicated CSS files
- [ ] English-only code
- [ ] No emojis
- [ ] Accessibility compliant

## Documentation

- [AGENTS.md](AGENTS.md) - Agent development guide and standards
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [REFACTORING_PLAN.md](REFACTORING_PLAN.md) - Professional architecture plan

## License

This project is proprietary software for Club Campestre Medellín.

## Support

For support, please contact the development team.

---

Built with React, TypeScript, and Tailwind CSS
