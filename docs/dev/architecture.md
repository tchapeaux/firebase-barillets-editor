# Architecture & Current State

## Technology Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Routing**: Vue Router 4.x
- **Backend**: Firebase (Firestore + Authentication)
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 3.4+ with PostCSS & Autoprefixer
- **UI Components**: shadcn-vue (Radix Vue primitives + Tailwind)
- **Icons**: Lucide Vue Next

## What's Been Implemented

### ✅ Core Infrastructure

- [x] Vite + Vue 3 SPA setup
- [x] Full TypeScript migration with strict mode
- [x] Firebase SDK integration (Firestore + Auth)
- [x] Development and build scripts
- [x] Tailwind CSS 3.4+ configuration with custom theme
- [x] shadcn-vue component library setup
- [x] CSS variables for theming (light/dark mode ready)

### ✅ Authentication

- [x] Email/password authentication
- [x] Google Sign-in (OAuth popup flow)
- [x] Password reset/recovery via email
- [x] Login/Signup flow with French UI
- [x] Session persistence
- [x] Protected routes with authentication guards
- [x] Sign out functionality

### ✅ Routing & Layout

- [x] Vue Router 4 integration
- [x] Route definitions for Home, Login, and Editor (placeholder)
- [x] Authentication guards (`beforeEach` navigation guard)
- [x] Automatic redirects based on auth state
- [x] Named routes for programmatic navigation
- [x] Views vs Components architecture
- [x] **App Layout System** - Consistent layout across authenticated pages:
  - Header with app title, user info, and sign-out/sign-in buttons
  - Footer with branding
  - Route metadata (`requiresLayout`) controls layout application
  - Login page maintains standalone centered design

### ✅ Type System

Strongly typed data structures in [src/types/barillet.ts](../../src/types/barillet.ts):

- `Barillet` - Main document with 18 themes (uses JavaScript `Date` for all date fields)
- `Theme` - Individual theme configuration
- `ThemeDuration` - Duration with value and type (fixed/special)
- `ThemeType` - "Mixte" | "Comparée"
- `ThemeParticipation` - String (e.g., "illimitée", "équivalente", etc.)
- `Folder` - Optional organization (not yet implemented)
- `Category` - Theme categories (not yet implemented)
- Helper functions for stats calculation and validation

### ✅ Data Layer

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

### ✅ UI Views & Components

**Views** (route-level components in `src/views/`):

- [x] **LoginView.vue** - Authentication interface with email/password and Google Sign-in
- [x] **ForgotPasswordView.vue** - Password reset request interface
- [x] **HomeView.vue** - Dashboard with barillet list
- [x] **BarilletEditorView.vue** - Full editor implementation with:
  - Barillet metadata editing (title, location, date)
  - All 18 themes editable
  - **Auto-save with 1.5s debounce** (saves on every change)
  - **Real-time sync status indicator** (Enregistré/Enregistrement.../Erreur)
  - Loading and error states
- [x] **BarilletViewerView.vue** - Read-only view for sharing barillets with:
  - Public viewing without authentication
  - Edit button for owners
  - Share link functionality
  - Theme display in read-only format

**Components** (reusable UI in `src/components/`):

- [x] **AppLayout.vue** - Main layout wrapper with:
  - Sticky header with app title (clickable, links to home)
  - User section (authenticated: email + sign-out; non-authenticated: sign-in link)
  - Main content slot for page content
  - Footer with "Vibe-coded with care" and GitHub link
  - Controlled by route metadata `requiresLayout`
- [x] **BarilletCard.vue** - Summary card with:
  - Title, date, location
  - Computed stats (duration, type counts, libre percentage)
  - Actions menu (edit, view, duplicate, delete)
  - Edit and view buttons navigate to respective routes
  - Simplified date formatting
- [x] **ThemeCard.vue** - Individual theme editor (grid layout only) with:
  - Type selector (Mixte/Comparée)
  - Title input with "No title" checkbox
  - Participation input
  - Category input
  - Duration input (value, special/fixed type)
  - Internal notes field
  - **Auto-emit changes on input** (triggers parent auto-save)
- [x] **ThemeCardReadOnly.vue** - Read-only theme display for viewer mode
- [x] **ThemeTableRow.vue** - Table row theme editor (compact layout) with auto-save
- [x] **DurationTypeBadge.vue** - Badge component for duration type display
- [x] **GoogleIcon.vue** - Custom Google sign-in icon
- [x] **ThemeList.vue** - Container for 18 theme cards
- [x] Empty state handling
- [x] Loading states
- [x] Error handling

### ✅ Features Working

- Create new barillets with default 18 empty themes
- **Edit barillet themes (all 18 themes fully editable)**
- **Edit barillet metadata (title, date, location)**
- **Auto-save with real-time sync** (1.5s debounce, onChange behavior)
- **Sync status indicator** (shows Enregistré/Enregistrement.../Erreur)
- **View barillets in read-only mode** (shareable public links)
- View all user's barillets in a grid
- Duplicate existing barillets
- Delete barillets with confirmation
- Real-time synchronization across tabs/devices
- Client-side statistics calculation and validation
- **Data validation with user-facing error messages**
- **Share functionality** (copy link to clipboard)
- Responsive design (desktop + mobile)
- Grid and table layout views for theme editing

## File Structure

```
firebase-barillets-editor/
├── src/
│   ├── types/
│   │   └── barillet.ts          # TypeScript interfaces with Date types
│   ├── composables/
│   │   ├── useAuth.ts            # Authentication logic
│   │   ├── useBarillets.ts       # Firestore CRUD + Timestamp conversion
│   │   └── useBarilletById.ts    # Single barillet fetching logic
│   ├── router/
│   │   └── index.ts              # Vue Router configuration + layout metadata
│   ├── views/
│   │   ├── LoginView.vue         # Login page (standalone, no layout)
│   │   ├── ForgotPasswordView.vue # Password reset page
│   │   ├── HomeView.vue          # Dashboard page (wrapped in AppLayout)
│   │   ├── BarilletEditorView.vue # Full editor (wrapped in AppLayout)
│   │   └── BarilletViewerView.vue # Read-only viewer (wrapped in AppLayout)
│   ├── components/
│   │   ├── AppLayout.vue         # App-wide layout with header & footer
│   │   ├── BarilletCard.vue      # Barillet summary card
│   │   ├── ThemeCard.vue         # Individual theme editor
│   │   ├── ThemeCardReadOnly.vue # Read-only theme display
│   │   ├── ThemeTableRow.vue     # Theme table row
│   │   ├── ThemeList.vue         # Container for 18 themes
│   │   ├── DurationTypeBadge.vue # Duration type badge
│   │   ├── GoogleIcon.vue        # Google sign-in icon
│   │   └── ui/                   # shadcn-vue UI components
│   ├── services/                 # Business logic services
│   ├── lib/                      # Utility functions
│   ├── firebase-app.ts           # Firebase initialization
│   ├── styles.css                # Global Tailwind styles
│   ├── App.vue                   # Root component (conditional layout wrapper)
│   └── main.ts                   # Entry point
├── docs/dev/                     # Developer documentation (AI agents)
├── .github/                      # GitHub configuration & Copilot instructions
├── .gitignore                    # Git ignore rules
├── PROJECT.md                    # Original requirements
├── CLAUDE.md                     # Legacy context (deprecated)
├── README.md                     # Quick start guide
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
├── tailwind.config.js            # Tailwind CSS config
└── package.json                  # Dependencies & scripts
```

## Routing Architecture

### Available Routes

| Route                | Name              | Component          | Auth Required | Layout | Description                         |
| -------------------- | ----------------- | ------------------ | ------------- | ------ | ----------------------------------- |
| `/`                  | `home`            | HomeView           | ✅ Yes        | ✅ Yes | Dashboard with barillet list        |
| `/login`             | `login`           | LoginView          | ❌ No         | ❌ No  | Authentication page                 |
| `/forgot-password`   | `forgot-password` | ForgotPasswordView | ❌ No         | ❌ No  | Password reset request page         |
| `/barillet/:id/edit` | `barillet-edit`   | BarilletEditorView | ✅ Yes        | ✅ Yes | Full editor for barillet themes     |
| `/barillet/:id/view` | `barillet-view`   | BarilletViewerView | ❌ No         | ✅ Yes | Read-only public view of a barillet |

### Authentication Guards

The router implements an async `beforeEach` navigation guard that:

1. Waits for Firebase Auth to initialize using `onAuthStateChanged`
2. Checks if the target route requires authentication (`meta.requiresAuth`)
3. Gets the current authenticated user state
4. Redirects unauthenticated users from protected routes to `/login`
5. Redirects authenticated users away from `/login` to `/`
6. Allows navigation for all other cases

**Important**: The guard uses `onAuthStateChanged` wrapped in a Promise to ensure Firebase Auth state is resolved before making routing decisions. This prevents race conditions during login/logout.

### Layout System

Routes control layout application via `meta.requiresLayout`:

- `true`: Wrapped in AppLayout (header + footer)
- `false`: Rendered standalone (e.g., login page)

### Navigation Flow

- **Login**: After successful authentication, [LoginView.vue:111](../../src/views/LoginView.vue#L111) navigates to home
- **Logout**: After signing out, [AppLayout.vue:60](../../src/components/AppLayout.vue#L60) navigates to login
- **Protected Routes**: Router guard automatically redirects unauthenticated users

### Views vs Components

- **Views**: Route-level components in `src/views/` that represent full pages
- **Components**: Reusable UI pieces in `src/components/` used within views

## Security & Data Model

### Firestore Collections

- **barillets**: User-specific documents (filtered by `userId` field)
  - Each barillet contains 18 themes
  - Metadata: title, date, location
  - Timestamps: `createdAt`, `updatedAt` (Firestore Timestamps)
  - Themes: array of 18 `Theme` objects

### Authentication

- **Method**: Email/password and Google OAuth
- **Session**: Persists via Firebase Auth SDK
- **Password Reset**: Email-based password recovery flow
- **Security**: Users can only read/write their own barillets

### Firestore Indexes

- **None required** for current queries
- May need indexes for future features (search, filtering, pagination)

## Date Handling Strategy

**Critical**: The app uses a bidirectional conversion pattern:

- **In Firestore**: Dates stored as Firestore `Timestamp` objects
- **In Application**: Dates represented as JavaScript `Date` objects
- **Conversion Boundary**: `useBarillets` composable
  - Reading: `convertTimestampToDate()` in `onSnapshot` listener
  - Writing: `convertDateToTimestamp()` in `updateBarillet()`

This ensures type consistency throughout the Vue components while maintaining Firestore compatibility.

---

**Last Updated**: 2025-10-17
