# Project Context

## Current State

### Project Overview

A web application for creating and managing "barillets" (theme collections) for improvisation theater shows. Each barillet contains 18 themes with specific rules for duration, participation, categories, and type (Mixte/Comparée).

### Technology Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Routing**: Vue Router 4.x
- **Backend**: Firebase (Firestore + Authentication)
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 3.4+ with PostCSS & Autoprefixer
- **UI Components**: shadcn-vue (Radix Vue primitives + Tailwind)
- **Icons**: Lucide Vue Next

### What's Been Implemented

#### ✅ Core Infrastructure

- [x] Vite + Vue 3 SPA setup
- [x] Full TypeScript migration with strict mode
- [x] Firebase SDK integration (Firestore + Auth)
- [x] Development and build scripts
- [x] Tailwind CSS 3.4+ configuration with custom theme
- [x] shadcn-vue component library setup
- [x] CSS variables for theming (light/dark mode ready)

#### ✅ Authentication

- [x] Email/password authentication
- [x] Login/Signup flow with French UI
- [x] Session persistence
- [x] Protected routes with authentication guards
- [x] Sign out functionality

#### ✅ Routing

- [x] Vue Router 4 integration
- [x] Route definitions for Home, Login, and Editor (placeholder)
- [x] Authentication guards (`beforeEach` navigation guard)
- [x] Automatic redirects based on auth state
- [x] Named routes for programmatic navigation
- [x] Views vs Components architecture

#### ✅ Type System

Strongly typed data structures in [`src/types/barillet.ts`](src/types/barillet.ts):

- `Barillet` - Main document with 18 themes (uses JavaScript `Date` for all date fields)
- `Theme` - Individual theme configuration
- `ThemeDuration` - Duration with type and maximum flag
- `ThemeType` - "Mixte" | "Comparée"
- `ThemeParticipation` - 5 participation options
- `Folder` - Optional organization (not yet implemented)
- `Category` - Theme categories (not yet implemented)
- Helper functions for stats calculation and validation

#### ✅ Data Layer

- [x] `useAuth` composable - Authentication state management
- [x] `useBarillets` composable - Real-time Firestore sync
- [x] CRUD operations (Create, Read, Update, Delete, Duplicate)
- [x] Automatic data validation
- [x] Real-time updates via `onSnapshot`
- [x] **Bidirectional Date Conversion** - Converts between Firestore Timestamps and JavaScript Dates at data boundary:
  - `convertTimestampToDate()` - Converts Firestore Timestamps to JavaScript Dates when reading
  - `convertDateToTimestamp()` - Converts JavaScript Dates to Firestore Timestamps when writing
  - Used in `onSnapshot` listener and `updateBarillet()` function
- [x] Type-safe data handling with consistent date representation throughout the app

#### ✅ UI Views & Components

**Views** (route-level components in `src/views/`):

- [x] **LoginView.vue** - Authentication interface
- [x] **HomeView.vue** - Dashboard with barillet list
- [x] **BarilletEditorView.vue** - Full editor implementation with:
  - Barillet metadata editing (title, location)
  - All 18 themes editable
  - Save functionality with validation
  - Unsaved changes warnings
  - Loading and error states
  - Navigation guards

**Components** (reusable UI in `src/components/`):

- [x] **BarilletCard.vue** - Summary card with:
  - Title, date, location
  - Computed stats (duration, type counts, libre percentage)
  - Actions menu (edit, duplicate, delete)
  - Edit button navigates to editor route
  - Simplified date formatting (harmonized data types)
- [x] **ThemeCard.vue** - Individual theme editor with:
  - Type selector (Mixte/Comparée)
  - Title input with "No title" checkbox
  - Participation dropdown (5 options)
  - Category input
  - Duration input (value, special/fixed type, maximum flag)
  - Real-time updates on blur
- [x] **ThemeList.vue** - Container for 18 theme cards
- [x] Empty state handling
- [x] Loading states
- [x] Error handling

#### ✅ Features Working

- Create new barillets with default 18 empty themes
- **Edit barillet themes (all 18 themes fully editable)**
- **Edit barillet metadata (title, date, location)**
- View all user's barillets in a grid
- Duplicate existing barillets
- Delete barillets with confirmation
- Real-time synchronization across tabs/devices
- Client-side statistics calculation and validation
- **Data validation with user-facing error messages**
- **Unsaved changes warnings**
- Responsive design (desktop + mobile)

### File Structure

```
firebase-barillets-editor/
├── src/
│   ├── types/
│   │   └── barillet.ts          # TypeScript interfaces (harmonized Date types)
│   ├── composables/
│   │   ├── useAuth.ts            # Authentication logic
│   │   └── useBarillets.ts       # Firestore CRUD + Timestamp conversion
│   ├── router/
│   │   └── index.ts              # Vue Router configuration
│   ├── views/
│   │   ├── LoginView.vue         # Login page
│   │   ├── HomeView.vue          # Dashboard page
│   │   └── BarilletEditorView.vue # Full editor implementation
│   ├── components/
│   │   ├── BarilletCard.vue      # Barillet summary card
│   │   ├── ThemeCard.vue         # Individual theme editor
│   │   └── ThemeList.vue         # Container for 18 themes
│   ├── firebase-app.ts           # Firebase initialization
│   ├── styles.css                # Global styles
│   ├── App.vue                   # Root component (router-view)
│   └── main.ts                   # Entry point
├── .gitignore                    # Git ignore rules
├── FIREBASE_SETUP.md             # Firebase configuration guide
├── PROJECT.md                    # Original requirements
├── CLAUDE.md                     # This file
├── README.md                     # Quick start guide
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
└── package.json                  # Dependencies & scripts
```

### Routing Architecture

**Available Routes**:

| Route                | Name            | Component          | Auth Required | Description                     |
| -------------------- | --------------- | ------------------ | ------------- | ------------------------------- |
| `/`                  | `home`          | HomeView           | ✅ Yes        | Dashboard with barillet list    |
| `/login`             | `login`         | LoginView          | ❌ No         | Authentication page             |
| `/barillet/:id/edit` | `barillet-edit` | BarilletEditorView | ✅ Yes        | Full editor for barillet themes |

**Authentication Guards**:

The router implements an async `beforeEach` navigation guard that:

1. Waits for Firebase Auth to initialize using `onAuthStateChanged`
2. Checks if the target route requires authentication (`meta.requiresAuth`)
3. Gets the current authenticated user state
4. Redirects unauthenticated users from protected routes to `/login`
5. Redirects authenticated users away from `/login` to `/`
6. Allows navigation for all other cases

**Important**: The guard uses `onAuthStateChanged` wrapped in a Promise to ensure Firebase Auth state is resolved before making routing decisions. This prevents race conditions during login/logout.

**Navigation Flow**:

- **Login**: After successful authentication, [LoginView.vue:83](src/views/LoginView.vue#L83) navigates to home using `router.push({ name: 'home' })`
- **Logout**: After signing out, [HomeView.vue:74](src/views/HomeView.vue#L74) navigates to login using `router.push({ name: 'login' })`
- **Protected Routes**: The router guard automatically redirects unauthenticated users attempting to access protected routes

**Views vs Components**:

- **Views**: Route-level components in `src/views/` that represent full pages
- **Components**: Reusable UI pieces in `src/components/` used within views

---

## Next Steps

### High Priority - Enhanced Features

#### 1. Theme Duration Input Component

**What**: Create a specialized input for duration values with proper validation.

**Why**: Duration format is complex: "3:00", "2 fois 3:00", "jusqu'à la fin", etc.

**Tasks**:

- [ ] Create `DurationInput.vue` component
- [ ] Support MM:SS format input
- [ ] Support "X fois MM:SS" format
- [ ] Toggle between fixed/special type
- [ ] Toggle "maximum" flag
- [ ] Validation and error messages
- [ ] Autocomplete for common special values
- [ ] Real-time duration calculation display

**Acceptance Criteria**:

- User can enter duration in multiple formats
- Invalid formats show clear error messages
- Component emits properly formatted `ThemeDuration` object

---

### Medium Priority - Enhanced Features

#### 2. Category Management

**What**: Allow users to create and manage custom theme categories beyond "Libre".

**Tasks**:

- [ ] Create `categories` Firestore collection
- [ ] Create category management UI (settings page)
- [ ] Add category selector in theme editor
- [ ] Default categories (Libre + others from improv community)
- [ ] Update security rules for categories

**Related Types**: Already defined in [`src/types/barillet.ts`](src/types/barillet.ts#L48-L54)

#### 3. Folder Organization

**What**: Organize barillets into folders for better management.

**Tasks**:

- [ ] Create `folders` Firestore collection
- [ ] Add folder selector in home page
- [ ] Create/rename/delete folders
- [ ] Move barillets between folders
- [ ] Filter by folder view
- [ ] Breadcrumb navigation

**Related Types**: Already defined in [`src/types/barillet.ts`](src/types/barillet.ts#L40-L46)

#### 4. Barillet Templates

**What**: Save barillets as templates for reuse.

**Tasks**:

- [ ] Add "Save as template" button
- [ ] Template collection in Firestore (global or per-user)
- [ ] "Create from template" option
- [ ] Template browser/gallery
- [ ] Community templates (optional)

#### 5. Export/Import Functionality

**What**: Export barillets to various formats for printing or sharing.

**Tasks**:

- [ ] Export to PDF (printable barillet sheet)
- [ ] Export to JSON (data backup)
- [ ] Export to CSV/Excel (spreadsheet format)
- [ ] Import from JSON
- [ ] Print-friendly view (CSS print styles)

#### 6. Statistics Dashboard

**What**: Aggregate view of all user's barillets with insights.

**Tasks**:

- [ ] Total barillets count
- [ ] Average duration per barillet
- [ ] Most used categories
- [ ] Mixte vs Comparée distribution chart
- [ ] Libre percentage trends
- [ ] Date range filtering

---

### Low Priority - Polish & UX

#### 7. Search and Filtering

**What**: Find barillets quickly.

**Tasks**:

- [ ] Search by title
- [ ] Filter by date range
- [ ] Filter by location
- [ ] Filter by tags (future feature)
- [ ] Sort options (date, title, duration)

#### 8. Dark Mode

**What**: Support dark theme for better accessibility.

**Tasks**:

- [ ] Add dark mode CSS variables
- [ ] Toggle in user settings
- [ ] Persist preference in localStorage
- [ ] System theme detection
- [ ] Smooth transition animations

#### 9. Keyboard Shortcuts

**What**: Power user features for faster editing.

**Tasks**:

- [ ] Global shortcuts (new barillet, search, etc.)
- [ ] Editor shortcuts (save, next theme, etc.)
- [ ] Shortcut help overlay (? key)
- [ ] Customizable shortcuts (advanced)

#### 10. Offline Support

**What**: Work without internet connection.

**Tasks**:

- [ ] Service Worker setup
- [ ] Firestore offline persistence
- [ ] Offline indicator
- [ ] Sync status indicator
- [ ] Conflict resolution UI

#### 11. Collaborative Features

**What**: Share barillets with other users.

**Tasks**:

- [ ] Share barillet by email/link
- [ ] Read-only shared view
- [ ] Copy shared barillet to own collection
- [ ] Team/organization accounts
- [ ] Real-time collaborative editing (advanced)

---

## Technical Debt & Improvements

### Code Quality

- [ ] Add unit tests (Vitest)
- [ ] Add component tests (Vue Test Utils)
- [ ] Add E2E tests (Playwright)
- [x] Set up ESLint + Prettier ✅
- [x] Add pre-commit hooks (husky + lint-staged) ✅
- [ ] Add CI/CD pipeline (GitHub Actions)

**Instructions for AI Coding Agents**:

At the end of each coding session, you MUST:

1. Run `npm run format` to format all files
2. Run `npm run lint:fix` to fix linting issues
3. Run `npm run type-check` to verify TypeScript types

### Performance

- [ ] Lazy load components (Vue Router)
- [ ] Virtual scrolling for large barillet lists
- [ ] Optimize Firestore queries (pagination)
- [ ] Bundle size analysis and optimization

### Documentation

- [ ] Component documentation (Storybook)
- [ ] API documentation (TypeDoc)
- [ ] User manual / help center
- [ ] Contributing guide
- [ ] Code of conduct

### Accessibility

- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation audit
- [ ] Screen reader testing
- [ ] Color contrast verification (WCAG AA)
- [ ] Focus management in modals/dialogs

---

## Known Issues / Limitations

1. **No Date Picker UI**: Creating/editing barillets uses `new Date()` by default; custom date selection not yet implemented.
2. **No Undo/Redo**: Destructive actions (delete) are permanent after confirmation.
3. **Basic Duration Input**: Duration field accepts free text; specialized validation component not yet built.
4. **No Auto-save**: Editor requires manual save; auto-save on blur not implemented.
5. **Firestore Indexes**: May require manual index creation in Firebase Console for complex queries.

---

## Development Commands

```bash
# Type check without building
npm run type-check

# Build for production (with type check)
npm run build
```

---

## Questions to Consider

1. **Do we need server-side validation** in addition to client-side?
2. **Should we implement optimistic UI updates** for better perceived performance?
3. **Do we need barillet versioning/history** for undo functionality?
4. **Should categories be global or user-specific** or both?
5. **Do we need role-based access** (admin, editor, viewer)?
6. **Should we support multiple languages** beyond French?
7. **Do we need analytics** to understand usage patterns?
8. **Should we implement rate limiting** to prevent abuse?

---

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Vite Documentation](https://vitejs.dev/)

---

This file should always be updated to reflect the latest changes in the project.

**Last Updated**: 2025-10-16
