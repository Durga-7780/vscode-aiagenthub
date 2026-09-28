# React Project Template

This template defines the preferred architecture and structure for React applications built by the React Agent.

## Technology Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **Routing**: React Router (if routing is required)
- **Styling**: Standard CSS with CSS Modules, or generic CSS variables. (Tailwind is ok if specified in requirement).
- **Icons**: Lucide React (if icons are needed, `lucide-react`)

## Project Structure

Use a feature-driven or standard component-driven folder structure:

```text
src/
├── components/     # Reusable UI components
├── pages/          # Full page views
├── layouts/        # Shared layouts (e.g. Header, Sidebar)
├── hooks/          # Custom React hooks
├── services/       # API integration and external services
├── types/          # Global TypeScript interfaces
├── utils/          # Helper functions
├── assets/         # Images, global styles, fonts
└── App.tsx         # Root component and routing
```

## Component Architecture

1. **Functional Components**: Use only functional components with React Hooks.
2. **Typing**: Type all props explicitly. No `any` types.
3. **Exports**: Use default exports for Pages and named exports for UI components.

## Responsive & Mobile-First Development

- Use a mobile-first approach.
- Ensure the application works properly down to 320px width.
- Implement standard breakpoints (e.g. `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- Test responsiveness (mentally evaluate constraints) across mobile, tablet, and desktop views.
- Ensure tap targets are large enough and avoid horizontal scrolling on small screens.

## API Integration Conventions

- Use `fetch` or `axios` in a dedicated `services/` folder.
- Handle loading and error states at the caller level.
- Separate business logic from UI components.

## Naming Conventions

- **Components**: PascalCase (e.g. `UserProfile.tsx`)
- **Hooks**: camelCase starting with `use` (e.g. `useFetch.ts`)
- **Utils/Services**: camelCase (e.g. `apiClient.ts`)
- **Types**: PascalCase (e.g. `User.ts`)

Keep these guidelines in mind but remember that the requirement document has priority if it specifies conflicting patterns.
