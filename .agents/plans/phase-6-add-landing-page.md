# Feature: Landing Page

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Add a public landing page at `/` that showcases the app's value proposition for unauthenticated users. Authenticated users should be redirected to `/dashboard`. The landing page should follow the design from https://github.com/leoMirandaa/shadcn-landing-page with sections: Navbar, Hero, Features, CTA, and Footer.

**Design Requirements:**
- App name: "Yatra" (keep existing branding)
- Hero headline: "Money Tracking for Lazy People"
- CTA buttons: "Get Started" → `/register`, "Sign In" → `/login`
- Features to highlight: Multiple Wallets, Categories (Idle/Hot/Emergency), Balance Records, Charts, Export

## User Story

As a potential user visiting the app for the first time
I want to see a landing page explaining the app's features
So that I understand what Yatra does and can sign up or log in

## Problem Statement

Currently, the root URL `/` serves the dashboard which requires authentication. Unauthenticated users are immediately redirected to `/login`, missing any opportunity to learn about the app's features before signing up.

## Solution Statement

Create a public landing page at `/` that displays:
- Navbar with logo and navigation links
- Hero section with headline, description, and CTA buttons
- Features section highlighting key capabilities
- CTA section encouraging sign-up
- Footer with branding and links

Move the authenticated dashboard from `/` to `/dashboard`.

## Feature Metadata

**Feature Type**: Enhancement (restructuring + new page)
**Estimated Complexity**: Medium
**Primary Systems Affected**: 
- Route configuration (middleware)
- Navigation (app-sidebar)
- Page structure

**Dependencies**: None (uses existing shadcn/ui components)

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `src/middleware.ts` (lines 30-42) - Route protection logic that redirects unauthenticated users
- `src/components/app-sidebar.tsx` (lines 26-31) - Navigation items with current `/` href
- `src/app/(dashboard)/page.tsx` - Current dashboard page at `/`
- `src/app/(auth)/login/page.tsx` (lines 1-5) - Simple page structure to follow for landing page
- `src/features/auth/components/login-form.tsx` (lines 44-104) - Card component pattern for forms

### New Files to Create

- `src/app/page.tsx` - New landing page at root `/`

### Files to Update

- `src/middleware.ts` - Allow `/` for unauthenticated users, redirect authenticated users from `/` to `/dashboard`
- `src/components/app-sidebar.tsx` - Change navItems to point `/dashboard` instead of `/`
- `src/app/(dashboard)/layout.tsx` - Change redirect from `/` to `/dashboard`

### Patterns to Follow

**Page Structure**: Simple page.tsx that imports a component
```tsx
// src/app/(auth)/login/page.tsx:1-5
import { LoginForm } from '@/features/auth'

export default function LoginPage() {
  return <LoginForm />
}
```

**Card Pattern**: Using shadcn Card for content containers
```tsx
// src/features/auth/components/login-form.tsx:44-47
<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
```

**Button Styles**: Primary and secondary button styling from existing components

---

## IMPLEMENTATION PLAN

### Phase 1: Create Landing Page Components

**Tasks:**

- Create landing page components following shadcn-landing-page template patterns
- Components: Navbar, Hero, Features, CTA, Footer
- Use existing shadcn/ui components (Button, Card, Badge)
- Add dark mode support

### Phase 2: Assemble Landing Page

**Tasks:**

- Create `src/app/page.tsx` that imports and assembles all sections
- Ensure responsive design works

### Phase 3: Update Dashboard Routes

**Tasks:**

- Move `src/app/(dashboard)/page.tsx` content to new dashboard page at `/dashboard`
- This requires restructuring: create `src/app/(dashboard)/dashboard/page.tsx` OR rename route group

### Phase 4: Update Middleware

**Tasks:**

- Modify middleware to allow unauthenticated access to `/`
- Add redirect for authenticated users from `/` to `/dashboard`

### Phase 5: Update Navigation

**Tasks:**

- Update sidebar navItems to point to `/dashboard`
- Update any hardcoded redirects

---

## STEP-BY-STEP TASKS

### Task 1: CREATE src/components/landing/navbar.tsx

- **IMPLEMENT**: Create Navbar component following template patterns:
  - Sticky header with `sticky border-b top-0 z-40 w-full bg-background`
  - Logo with "Yatra" text using existing font (Architects_Daughter)
  - Navigation links: Features, About (scroll anchors)
  - CTA buttons on right: "Get Started" (primary), "Sign In" (outline)
  - Mobile: use Sheet component for hamburger menu
- **PATTERN**: Follow `src/components/Navbar.tsx` from shadcn-landing-page template
- **IMPORTS**: Button, Sheet, SheetContent, SheetTrigger from shadcn/ui; Menu from lucide-react
- **GOTCHA**: Don't require authentication - this is a public component
- **VALIDATE**: `npm run typecheck`

### Task 2: CREATE src/components/landing/hero.tsx

- **IMPLEMENT**: Create Hero section:
  - Two-column grid on desktop (`grid lg:grid-cols-2`)
  - Headline: "Money Tracking for Lazy People"
  - Subheadline: Explain periodic balance tracking concept (no transaction logging)
  - Two CTA buttons: "Get Started" (primary) → `/register`, "Sign In" (outline) → `/login`
  - Right side: decorative cards/illustration area (can be simple placeholder)
- **PATTERN**: Follow `src/components/Hero.tsx` from template with gradient text
- **IMPORTS**: Button from shadcn/ui
- **GOTCHA**: None
- **VALIDATE**: `npm run typecheck`

### Task 3: CREATE src/components/landing/features.tsx

- **IMPLEMENT**: Create Features section with grid of cards:
  - Section id="features" for navigation
  - Badge tags at top: "Multiple Wallets", "Categories", "Balance Records", "Charts", "Export", "Dark Mode"
  - 3-column grid of feature cards using shadcn Card
  - Features to include:
    1. **Multiple Wallets** - Track cash, bank accounts, digital wallets
    2. **Smart Categories** - Idle Cash, Hot Cash, Emergency Fund
    3. **Balance Records** - Simply add your current balance periodically
    4. **Visual Insights** - Pie charts and line charts
    5. **Data Export** - Export to CSV or JSON
    6. **Dark Mode** - Easy on the eyes
- **PATTERN**: Follow `src/components/Features.tsx` from template
- **IMPORTS**: Card, CardContent, CardHeader, CardTitle from shadcn/ui; Badge
- **GOTCHA**: None
- **VALIDATE**: `npm run typecheck`

### Task 4: CREATE src/components/landing/cta.tsx

- **IMPLEMENT**: Create CTA section:
  - Background: `bg-muted/50`
  - Headline: "Start Tracking Your Finances Today"
  - Subtext: "Join thousands who track their money the lazy way"
  - Buttons: "Get Started Free" (primary), "Learn More" (ghost)
- **PATTERN**: Follow `src/components/Cta.tsx` from template
- **IMPORTS**: Button from shadcn/ui
- **GOTCHA**: None
- **VALIDATE**: `npm run typecheck`

### Task 5: CREATE src/components/landing/footer.tsx

- **IMPLEMENT**: Create Footer:
  - Logo and app name "Yatra"
  - Links: Features, Login, Register
  - Copyright: "© 2026 Yatra. Personal finance tracking."
- **PATTERN**: Follow `src/components/Footer.tsx` from template
- **IMPORTS**: None (simple HTML/Tailwind)
- **GOTCHA**: None
- **VALIDATE**: `npm run typecheck`

### Task 6: CREATE src/components/landing/index.ts

- **IMPLEMENT**: Create barrel export for all landing components
- **PATTERN**: Follow existing `src/features/*/components/index.ts` pattern
- **VALIDATE**: `npm run typecheck`

### Task 7: CREATE src/app/page.tsx (Landing Page)

- **IMPLEMENT**: Create landing page assembling all sections:
  ```tsx
  import { Navbar, Hero, Features, Cta, Footer } from "@/components/landing"
  
  export default function LandingPage() {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Cta />
        </main>
        <Footer />
      </div>
    )
  }
  ```
- **PATTERN**: Simple page structure like `src/app/(auth)/login/page.tsx`
- **IMPORTS**: All landing components
- **GOTCHA**: Don't wrap in any auth-required layout
- **VALIDATE**: `npm run typecheck`

### Task 8: UPDATE src/middleware.ts

- **IMPLEMENT**: Modify route protection:
  - Allow unauthenticated access to `/` (landing page)
  - Keep `/login` and `/register` allowed
  - Change line 40 from `url.pathname = '/'` to `url.pathname = '/dashboard'`
  - Redirect authenticated users from `/` to `/dashboard`
- **PATTERN**: Similar to existing login/register redirect logic at lines 38-42
- **IMPORTS**: No new imports needed
- **GOTCHA**: Make sure `/dashboard` is protected, not public
- **VALIDATE**: `npm run typecheck`

### Task 9: UPDATE src/components/app-sidebar.tsx

- **IMPLEMENT**: Change navItems:
  - `{ href: "/", icon: LayoutDashboard, label: "Dashboard" }` → `{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }`
  - Update all other routes to use `/dashboard` prefix
- **PATTERN**: Simple string change in navItems array
- **IMPORTS**: No new imports
- **GOTCHA**: Need to also update the dashboard route structure (next task)
- **VALIDATE**: `npm run typecheck`

### Task 10: UPDATE src/app/(dashboard)/layout.tsx

- **IMPLEMENT**: Change redirect from `/` to `/dashboard` at line 16
- **PATTERN**: Direct string change
- **IMPORTS**: None
- **GOTCHA**: None
- **VALIDATE**: `npm run typecheck`

### Task 11: CREATE src/app/(dashboard)/dashboard/page.tsx

- **IMPLEMENT**: Copy content from current `src/app/(dashboard)/page.tsx` to new location
- **PATTERN**: Same as existing dashboard page
- **IMPORTS**: Same imports as source file
- **GOTCHA**: This creates duplicate - handle in next task

### Task 12: UPDATE src/app/(dashboard)/page.tsx (Redirect)

- **IMPLEMENT**: Change from showing dashboard to redirecting to `/dashboard`
- **PATTERN**: Use `redirect()` from next/navigation like in layout.tsx
- **IMPORTS**: `import { redirect } from "next/navigation"`
- **GOTCHA**: This page becomes a redirector for authenticated users coming to `/`

### Task 13: MOVE accounts to /dashboard/accounts

- Move `src/app/(dashboard)/accounts/page.tsx` to `src/app/(dashboard)/dashboard/accounts/page.tsx`
- Move `src/app/(dashboard)/accounts/[id]/page.tsx` to `src/app/(dashboard)/dashboard/accounts/[id]/page.tsx`

### Task 14: MOVE categories to /dashboard/categories

- Move `src/app/(dashboard)/categories/page.tsx` to `src/app/(dashboard)/dashboard/categories/page.tsx`

### Task 15: UPDATE src/components/dashboard-topbar.tsx

- **IMPLEMENT**: Update routeTitles to use `/dashboard` prefix:
  ```
  "/dashboard": { title: "Dashboard", description: "Welcome back!" },
  "/dashboard/accounts": { title: "Wallets", description: "Manage your wallets" },
  "/dashboard/categories": { title: "Categories", description: "Organize your categories" },
  ```
- **PATTERN**: Simple dictionary key update
- **VALIDATE**: `npm run typecheck`

---

## TESTING STRATEGY

### Manual Testing

1. **Landing Page (Unauthenticated)**:
   - Visit `/` - should see landing page with Navbar, Hero, Features, CTA, Footer
   - Click "Get Started" → should go to `/register`
   - Click "Sign In" → should go to `/login`
   - Verify responsive design (mobile hamburger menu works)
   - Test dark mode toggle
   
2. **Authenticated user flow**:
   - Log in → should redirect to `/dashboard` (not `/`)
   - Sidebar navigation should work correctly with `/dashboard` prefix
   - All routes (`/dashboard/accounts`, `/dashboard/categories`) should work

3. **Post-logout**:
   - Sign out from dashboard → should redirect to landing page `/`

4. **Visual Checkpoints**:
   - Hero headline shows "Money Tracking for Lazy People"
   - Features section shows 6 feature cards
   - All buttons navigate correctly

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
npm run lint
npm run typecheck
```

### Level 2: Build
```bash
npm run build
```

---

## ACCEPTANCE CRITERIA

- [ ] Landing page renders at `/` without authentication
- [ ] Landing page shows Navbar with Yatra logo, navigation, and CTA buttons
- [ ] Hero section displays "Money Tracking for Lazy People" headline
- [ ] Hero has "Get Started" and "Sign In" buttons linking to /register and /login
- [ ] Features section shows 6 feature cards with icons/descriptions
- [ ] CTA section encourages sign-up
- [ ] Footer shows Yatra branding and links
- [ ] Landing page is responsive (mobile hamburger menu works)
- [ ] Dark mode works on landing page
- [ ] Authenticated users are redirected from `/` to `/dashboard`
- [ ] Dashboard accessible at `/dashboard`
- [ ] All protected routes work under `/dashboard` prefix
- [ ] Sidebar navigation updated to point to `/dashboard` routes
- [ ] Dashboard topbar shows correct titles for `/dashboard` routes
- [ ] Logout returns user to landing page
- [ ] No lint or type errors
- [ ] Build succeeds

### Task 10: UPDATE src/components/dashboard-topbar.tsx

- **IMPLEMENT**: Update routeTitles to use `/dashboard` prefix:
  ```
  "/dashboard": { title: "Dashboard", description: "Welcome back!" },
  "/dashboard/accounts": { title: "Wallets", description: "Manage your wallets" },
  "/dashboard/categories": { title: "Categories", description: "Organize your categories" },
  ```
- **PATTERN**: Simple dictionary key update
- **VALIDATE**: `npm run typecheck`

---

## NOTES

- Design inspired by https://github.com/leoMirandaa/shadcn-landing-page
- Landing page uses existing shadcn/ui components already in the project
- Fonts: Uses existing Architects_Daughter from layout.tsx for branding
- The landing page should be simple and focused on conversion (sign ups)
- Feature descriptions should emphasize "lazy" periodic tracking - not transaction-based
- Consider adding gradient text effects similar to the template
- Mobile navigation uses Sheet component (already available)
