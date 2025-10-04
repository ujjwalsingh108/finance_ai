# Copilot Instructions for finance_ai

## Project Overview

- This is a Next.js 13+ app using the `/app` directory structure, TypeScript, and Tailwind CSS.
- The codebase is organized by feature: `src/app/(auth)`, `src/app/(with-sidebar)`, and `src/components` for UI and logic.
- Data and constants are in `src/lib/constants/`.
- Supabase is used for authentication and backend integration (`src/utils/supabase/`).

## Key Workflows

- **Development:**
  - Start with `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`).
  - Main entry: `src/app/layout.tsx` and feature layouts in subfolders.
- **Styling:**
  - Tailwind config: `tailwind.config.ts`, global styles: `src/app/globals.css`.
- **Authentication:**
  - Handled via Supabase client in `src/utils/supabase/client.ts` and UI in `src/components/authentication/`.
- **Sidebar Layout:**
  - Shared sidebar logic in `src/components/layout/SidebarLayout.tsx` and `Sidebar.tsx`.
- **Feature Sections:**
  - Home, Screener, Settings: `src/app/(with-sidebar)/` and corresponding components in `src/components/`.

## Patterns & Conventions

- **File Naming:**
  - Use kebab-case for folders, PascalCase for React components, camelCase for hooks and utility functions.
- **Component Structure:**
  - UI primitives in `src/components/ui/`, feature components in their respective folders.
- **API Routes:**
  - Next.js API routes in `src/app/api/`.
- **Constants/Data:**
  - Use JSON files in `src/lib/constants/` for static data.
- **Types:**
  - Shared types in `src/types/`.

## Integration Points

- **Supabase:**
  - All backend/auth logic via Supabase SDK in `src/utils/supabase/`.
- **External Assets:**
  - Images and SVGs in `public/images/` and `public/`.

## Examples

- To add a new sidebar page:
  1. Create a folder in `src/app/(with-sidebar)/`.
  2. Add a layout or page file.
  3. Add components in `src/components/` as needed.
- To add a new authentication flow:
  1. Update Supabase logic in `src/utils/supabase/`.
  2. Add/modify UI in `src/components/authentication/`.

## Tips for AI Agents

- Always use TypeScript and follow existing type definitions.
- Prefer feature-based organization for new code.
- Reference existing components for UI/UX consistency.
- Use Tailwind utility classes for styling.
- For backend/auth, use Supabase client and patterns from `src/utils/supabase/`.

---

_If any section is unclear or missing, please provide feedback for further refinement._
