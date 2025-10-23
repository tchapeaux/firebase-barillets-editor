# Architecture & Current State

## Technology Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Routing**: Vue Router 4.x
- **Backend**: Firebase (Firestore + Authentication)
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 3.4+ with PostCSS, Autoprefixer, and Container Queries plugin
- **UI Components**: shadcn-vue (Radix Vue primitives + Tailwind)
- **Icons**: Lucide Vue Next

## What's Been Implemented

### ✅ Core Infrastructure

- [x] Vite + Vue 3 SPA setup
- [x] Full TypeScript migration with strict mode
- [x] Firebase SDK integration (Firestore + Auth)
- [x] Development and build scripts
- [x] Tailwind CSS 3.4+ configuration with custom theme
- [x] Container queries plugin for responsive components
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
- `Category` - Theme categories with autocomplete from preset list (see Category Management below)
- Helper functions for stats calculation and validation

### ✅ Data Layer

- [x] `useAuth` composable - Authentication state management
- [x] `useBarillets` composable - Real-time Firestore sync
- [x] `useCategories` composable - Category management with preset list
- [x] CRUD operations (Create, Read, Update, Delete, Duplicate)
- [x] Automatic data validation
- [x] Real-time updates via `onSnapshot`
- [x] **Bidirectional Date Conversion** - Converts between Firestore Timestamps and JavaScript Dates at data boundary:
  - `convertTimestampToDate()` - Converts Firestore Timestamps to JavaScript Dates when reading
  - `convertDateToTimestamp()` - Converts JavaScript Dates to Firestore Timestamps when writing
  - Used in `onSnapshot` listener and `updateBarillet()` function
- [x] Type-safe data handling with consistent date representation throughout the app

### ✅ Category Management

The application provides **autocomplete functionality** for theme categories based on a preset list:

- **Implementation**: Categories are hardcoded in a static JSON file
- **Data Source**: [src/data/categories.json](../../src/data/categories.json) - Contains 87 preset improvisation categories
- **Composable**: [src/composables/useCategories.ts](../../src/composables/useCategories.ts) - Provides category lookup and validation functions
- **UI Component**: [src/components/ui/CategoryCombobox.vue](../../src/components/ui/CategoryCombobox.vue) - Autocomplete input with filtering

**Category Data Structure**:
Each category in `categories.json` contains:

- `name`: Category name (e.g., "À la manière de ...", "Abécédaire")
- `description`: Detailed rules and constraints for the category

### ✅ UI Views & Components

**Views** (route-level components in `src/views/`):

- [x] **LoginView.vue** - Authentication interface with email/password and Google Sign-in
- [x] **ForgotPasswordView.vue** - Password reset request interface
- [x] **HomeView.vue** - Dashboard with barillet list
  - Create new barillet button
  - Import from JSON button
  - Grid view of all user barillets
- [x] **BarilletEditorView.vue** - Full editor implementation with:
  - Barillet metadata editing (title, location, date)
  - All 18 themes editable
  - **Auto-save with 1.5s debounce** (saves on every change)
  - **Real-time sync status indicator** (Enregistré/Enregistrement.../Erreur)
  - Loading and error states
- [x] **BarilletViewerView.vue** - Read-only view for sharing barillets with:
  - Public viewing without authentication
  - Edit button for owners
  - "Mode Live" button for interactive theme review
  - Share link functionality
  - Export dropdown menu (PDF, JSON, Excel, CSV)
  - Theme display in read-only format
- [x] **BarilletLiveView.vue** - Interactive theme review mode with:
  - Random theme draw from the barillet
  - Reset functionality to restart session
  - Client-only (no Firestore persistence)
  - Mobile-first responsive design

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
  - Actions menu (edit, view, duplicate, delete, export to PDF/JSON/Excel/CSV)
  - Edit, view, and live action buttons
  - Simplified date formatting
  - Export options with dropdown menu
- [x] **ThemeCard.vue** - Individual theme editor (grid layout only) with:
  - Type selector (Mixte/Comparée)
  - Title input with "No title" checkbox
  - Participation input
  - Category input with autocomplete (CategoryCombobox)
  - Duration input (value, special/fixed type)
  - Internal notes field
  - Auto-emit changes on input (triggers parent auto-save)
- [x] **ThemeCardReadOnly.vue** - Read-only theme display for viewer mode and live mode
  - Container-aware 2-column layout matching editable card behavior
- [x] **ThemeTableRow.vue** - Table row theme editor (compact layout) with:
  - Auto-save functionality
  - Category input with autocomplete (CategoryCombobox)
- [x] **CategoryCombobox.vue** - Autocomplete combobox for category selection with:
  - Real-time filtering based on user input
  - Dropdown with preset categories from FBIA 2025 list
  - Support for custom category values
  - Uses Radix Vue primitives (ComboboxRoot, ComboboxInput, etc.)
- [x] **DurationTypeBadge.vue** - Badge component for duration type display
- [x] **GoogleIcon.vue** - Custom Google sign-in icon
- [x] **ThemeList.vue** - Container for 18 theme cards

### ✅ Live Mode Feature

Live Mode provides an interactive way to review and filter themes from a barillet during a live performance or rehearsal session.

**Purpose**: Allow performers to randomly draw themes and decide whether to use them ("Retirer") or skip them ("Passer"), helping curate the theme selection in real-time.

**Key Features**:

- **Random Theme Selection**: Themes are presented in random order from the barillet
- **Smart Randomization**: "Passer" action ensures the next theme is different from the current one
- **Two Actions**:
  - **Retirer**: Remove theme from the remaining pool (moves to discarded)
  - **Passer**: Skip theme but keep it in the pool for later
- **Real-time Statistics**:
  - Remaining theme count with large visual indicator
  - Discarded themes breakdown: Mixte vs Comparée counts
  - Discarded themes breakdown: Libre vs other categories
- **Session Management**:
  - Empty state when all themes removed
  - "Recommencer" button to reset and restart session
  - Progress bar showing completion (mobile)
- **Client-Side Only**: No Firestore persistence - session state lives only in browser
- **Responsive Design**: Mobile-first layout with large touch-friendly buttons

**Navigation**:

- From HomeView: BarilletCard dropdown menu → "Mode Live" option
- From BarilletViewerView: "Mode Live" button in header

**Technical Implementation**:

- [src/views/BarilletLiveView.vue:1-361](../../src/views/BarilletLiveView.vue) - Main component with state management
- Uses `useBarilletById` composable for data fetching
- Local reactive state: `remainingThemes`, `discardedThemes`, `currentTheme`
- Statistics computed in real-time based on discarded themes
- Route: `/barillet/:id/live` (no authentication required, custom header)

### ✅ Data Export & Import

- [x] **Export to PDF** - Printable A4 landscape format with 3x3 grid (9 themes per page)
  - Beautiful themed cards with type badges, titles, participation, category, duration, notes
  - Auto-filename based on barillet title
- [x] **Export to JSON** - Clean format (excludes userId, timestamps) for portability
  - Minimal structure: title, date, location, 18 themes
  - Compatible with import functionality
- [x] **Export to CSV** - Tabular format for spreadsheet applications
  - Header row with all theme fields
  - One theme per row for easy analysis
- [x] **Export to Excel** - Formatted `.xlsx` workbook with metadata and themed table
  - Metadata sheet: title, date, location, theme count
  - Themes sheet with bold headers and auto-width columns
- [x] **Import from JSON** - Create new barillets from exported JSON files
  - Schema validation ensuring data integrity
  - Date parsing from ISO format
  - Clear French error messages for validation failures
  - Auto-redirect to editor after successful import

**Implementation**:

- [Composable: useBarilletExport.ts](../../src/composables/useBarilletExport.ts) - All export functionality with dynamic imports for PDF and Excel
- [Composable: useBarilletImport.ts](../../src/composables/useBarilletImport.ts) - Import validation and creation logic
- [Type: ImportedBarilletData](../../src/types/barillet.ts) - Type definition for JSON import format
- Dynamic imports reduce initial bundle: jsPDF and xlsx loaded only when needed

### ✅ Features Working

- Create new barillets with default 18 empty themes
- **Edit barillet themes (all 18 themes fully editable)**
- **Edit barillet metadata (title, date, location)**
- **Auto-save with real-time sync** (1.5s debounce, onChange behavior)
- **Sync status indicator** (shows Enregistré/Enregistrement.../Erreur)
- **View barillets in read-only mode** (shareable public links)
- **Live Mode** - Interactive theme review with random presentation and filtering actions
- Export barillets to PDF, JSON, CSV, and Excel formats
- Import barillets from JSON files
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
│   │   ├── useBarilletById.ts    # Single barillet fetching logic
│   │   ├── useCategories.ts      # Category management and lookup
│   │   ├── useThemeDuration.ts   # Theme duration logic
│   │   ├── useBarilletExport.ts  # Export to PDF, JSON, CSV, Excel
│   │   └── useBarilletImport.ts  # Import from JSON files
│   ├── data/
│   │   └── categories.json       # FBIA 2025 preset categories (87 items)
│   ├── router/
│   │   └── index.ts              # Vue Router configuration + layout metadata
│   ├── views/
│   │   ├── LoginView.vue         # Login page (standalone, no layout)
│   │   ├── ForgotPasswordView.vue # Password reset page
│   │   ├── HomeView.vue          # Dashboard page (wrapped in AppLayout)
│   │   ├── BarilletEditorView.vue # Full editor (wrapped in AppLayout)
│   │   ├── BarilletViewerView.vue # Read-only viewer (wrapped in AppLayout)
│   │   └── BarilletLiveView.vue  # Interactive live mode (custom header)
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
│   │       ├── CategoryCombobox.vue # Category autocomplete combobox
│   │       └── ...               # Other UI primitives
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

| Route                | Name              | Component          | Auth Required | Layout | Description                           |
| -------------------- | ----------------- | ------------------ | ------------- | ------ | ------------------------------------- |
| `/`                  | `home`            | HomeView           | ✅ Yes        | ✅ Yes | Dashboard with barillet list          |
| `/login`             | `login`           | LoginView          | ❌ No         | ❌ No  | Authentication page                   |
| `/forgot-password`   | `forgot-password` | ForgotPasswordView | ❌ No         | ❌ No  | Password reset request page           |
| `/barillet/:id/edit` | `barillet-edit`   | BarilletEditorView | ✅ Yes        | ✅ Yes | Full editor for barillet themes       |
| `/barillet/:id/view` | `barillet-view`   | BarilletViewerView | ❌ No         | ✅ Yes | Read-only public view of a barillet   |
| `/barillet/:id/live` | `barillet-live`   | BarilletLiveView   | ❌ No         | ✅ Yes | Interactive live theme review session |

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

**Currently Active Collections**:

- **barillets**: User-specific documents (filtered by `userId` field)
  - Each barillet contains 18 themes
  - Metadata: title, date, location
  - Timestamps: `createdAt`, `updatedAt` (Firestore Timestamps)
  - Themes: array of 18 `Theme` objects (each theme has a `category` field stored as a string)

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

**Last Updated**: 2025-10-23
