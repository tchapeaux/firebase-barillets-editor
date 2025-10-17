# Feature Roadmap

This document outlines planned features, improvements, and technical debt to address.

## High Priority - Enhanced Features

### 1. Export/Import Functionality

**What**: Export barillets to various formats for printing or sharing.

**Why**: Users need to print barillets for live shows and share with team members.

**Tasks**:

- [ ] Export to PDF (printable barillet sheet with 18 theme cards)
- [ ] Export to JSON (data backup/transfer)
- [ ] Export to CSV/Excel (spreadsheet format for analysis)
- [ ] Import from JSON (restore backups)
- [ ] Print-friendly view with CSS print styles
- [ ] Batch export (multiple barillets to ZIP)

**Acceptance Criteria**:

- PDF export generates printable cards (ready for physical barillet)
- JSON export/import preserves all data without loss
- CSV export is readable in Excel/Google Sheets
- Print view works in all major browsers

---

### 2. Theme Duration Input Component

**What**: Create a specialized input for duration values with proper validation.

**Why**: Duration format is complex: "3:00", "2 fois 3:00", "jusqu'à la fin", etc. Current implementation uses free text input which can lead to parsing errors.

**Tasks**:

- [ ] Create `DurationInput.vue` component
- [ ] Support MM:SS format input with validation
- [ ] Support "X fois MM:SS" format for "Comparée" themes
- [ ] Toggle between fixed/special type
- [ ] Validation and error messages for invalid formats
- [ ] Autocomplete suggestions for common special values
- [ ] Real-time duration calculation display
- [ ] Integration with `parseDurationToMinutes()` helper

**Acceptance Criteria**:

- User can enter duration in multiple formats
- Invalid formats show clear error messages in French
- Component emits properly formatted `ThemeDuration` object
- Parsing logic handles all edge cases correctly

---

## Medium Priority - Enhanced Features

### 3. Category Management

**What**: Allow users to create and manage custom theme categories beyond "Libre".

**Why**: Different improv communities use different game categories. Users should be able to customize their category list.

**Tasks**:

- [ ] Create `categories` Firestore collection
- [ ] Create category management UI (settings page)
- [ ] Add category selector/autocomplete in theme editor
- [ ] Seed default categories ("Libre", common improv categories)
- [ ] Allow creating categories on-the-fly during theme editing
- [ ] Update Firestore security rules for categories collection

**Related Types**: Already defined in [src/types/barillet.ts](../../src/types/barillet.ts) (`Category` interface)

**Acceptance Criteria**:

- Users can create, edit, delete custom categories
- Global categories visible to all users
- User-specific categories only visible to owner
- Category autocomplete shows relevant suggestions

---

### 4. Folder Organization

**What**: Organize barillets into folders for better management.

**Why**: Users may create dozens of barillets over time. Folders help organize by season, venue, or team.

**Tasks**:

- [ ] Create `folders` Firestore collection
- [ ] Add folder selector in home page
- [ ] Create/rename/delete folders UI
- [ ] Move barillets between folders (drag-drop or menu action)
- [ ] Filter/group barillets by folder in home view
- [ ] Breadcrumb navigation for folder hierarchy
- [ ] Update Firestore security rules for folders

**Related Types**: Already defined in [src/types/barillet.ts](../../src/types/barillet.ts) (`Folder` interface)

**Acceptance Criteria**:

- Users can organize barillets into folders
- Folders can be nested (optional)
- Moving barillets preserves all data
- Empty folders can be deleted

---

### 5. Barillet Templates

**What**: Save barillets as templates for reuse.

**Why**: Users often create similar barillets for recurring events. Templates speed up creation.

**Tasks**:

- [ ] Add "Save as template" button in editor
- [ ] Create `templates` Firestore collection (user-specific)
- [ ] "Create from template" option in home page
- [ ] Template browser/gallery UI
- [ ] Template metadata (name, description, preview)
- [ ] Community templates (optional, requires moderation)

**Acceptance Criteria**:

- Users can save any barillet as a template
- Templates preserve all theme configurations
- Creating from template duplicates all themes
- Template metadata is editable

---

### 6. Statistics Dashboard

**What**: Aggregate view of all user's barillets with insights.

**Why**: Users want to see patterns in their barillet creation over time.

**Tasks**:

- [ ] Create dashboard view/page
- [ ] Total barillets count
- [ ] Average duration per barillet
- [ ] Most used categories (chart/graph)
- [ ] Mixte vs Comparée distribution (pie chart)
- [ ] Libre percentage trends over time (line graph)
- [ ] Date range filtering
- [ ] Export stats to CSV

**Acceptance Criteria**:

- Dashboard loads quickly even with 100+ barillets
- Charts are responsive and interactive
- Data updates in real-time as barillets change
- Filters work correctly

---

## Low Priority - Polish & UX

### 7. Search and Filtering

**What**: Find barillets quickly.

**Tasks**:

- [ ] Search by title (full-text search)
- [ ] Filter by date range
- [ ] Filter by location
- [ ] Filter by tags (future feature)
- [ ] Sort options (date, title, duration, recently edited)
- [ ] Save search filters/preferences

**Acceptance Criteria**:

- Search returns results instantly (<500ms)
- Multiple filters can be combined
- Search works with partial matches

---

### 8. Dark Mode

**What**: Support dark theme for better accessibility.

**Tasks**:

- [ ] Add dark mode CSS variables
- [ ] Toggle button in user settings/header
- [ ] Persist preference in localStorage
- [ ] System theme detection (prefers-color-scheme)
- [ ] Smooth transition animations between themes

**Note**: CSS variables for theming are already set up.

**Acceptance Criteria**:

- Dark mode works across all pages
- Preference persists across sessions
- System theme is respected on first load
- No flash of wrong theme on page load

---

### 9. Keyboard Shortcuts

**What**: Power user features for faster editing.

**Tasks**:

- [ ] Global shortcuts (Ctrl+N for new barillet, Ctrl+K for search, etc.)
- [ ] Editor shortcuts (Ctrl+S for save, Tab/Shift+Tab for next/prev theme)
- [ ] Shortcut help overlay (? key)
- [ ] Customizable shortcuts (advanced feature)

**Acceptance Criteria**:

- Shortcuts work consistently across browsers
- Help overlay shows all available shortcuts
- Shortcuts don't conflict with browser defaults

---

### 10. Offline Support

**What**: Work without internet connection.

**Tasks**:

- [ ] Service Worker setup
- [ ] Firestore offline persistence enabled
- [ ] Offline indicator in UI
- [ ] Sync status indicator (syncing/synced/offline)
- [ ] Conflict resolution UI for offline edits

**Acceptance Criteria**:

- App loads when offline
- Users can edit barillets offline
- Changes sync automatically when back online
- Conflicts are resolved gracefully

---

### 11. Collaborative Features

**What**: Share barillets with other users.

**Tasks**:

- [ ] Share barillet by email/link
- [ ] Read-only shared view (public URL)
- [ ] Copy shared barillet to own collection
- [ ] Team/organization accounts
- [ ] Real-time collaborative editing (advanced)

**Acceptance Criteria**:

- Shared links work for non-authenticated users
- Read-only view prevents accidental edits
- Copying preserves all data
- Permissions are enforced server-side

---

## Technical Debt & Improvements

### Code Quality

- [ ] Add unit tests (Vitest)
- [ ] Add component tests (Vue Test Utils)
- [ ] Add E2E tests (Playwright)
- [x] Set up ESLint + Prettier ✅
- [x] Add pre-commit hooks (husky + lint-staged) ✅
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Improve error handling with custom error classes
- [ ] Add telemetry/analytics (privacy-respecting)

---

### Performance

- [ ] Lazy load components (Vue Router code splitting)
- [ ] Virtual scrolling for large barillet lists (100+ items)
- [ ] Optimize Firestore queries (pagination, indexes)
- [ ] Bundle size analysis and optimization
- [ ] Image optimization (if images are added)
- [ ] Debounce expensive operations (search, stats calculation)

---

### Documentation

- [ ] Component documentation (Storybook)
- [ ] API documentation (TypeDoc)
- [ ] User manual / help center
- [ ] Video tutorials
- [ ] Contributing guide
- [ ] Code of conduct

---

### Accessibility

- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation audit
- [ ] Screen reader testing (NVDA, JAWS)
- [ ] Color contrast verification (WCAG AA compliance)
- [ ] Focus management in modals/dialogs
- [ ] Skip navigation links
- [ ] Reduced motion support (prefers-reduced-motion)

---

## Questions to Consider

These are strategic questions that should be discussed before implementing certain features:

1. **Server-side validation**: Do we need server-side validation in addition to client-side? (Firestore security rules vs Cloud Functions)
2. **Optimistic UI updates**: Should we implement optimistic updates for better perceived performance?
3. **Barillet versioning**: Do we need version history for undo functionality?
4. **Category scope**: Should categories be global, user-specific, or both?
5. **Role-based access**: Do we need different roles (admin, editor, viewer) for collaborative features?
6. **Internationalization**: Should we support multiple languages beyond French?
7. **Analytics**: Do we need usage analytics to understand user behavior? (Privacy considerations)
8. **Rate limiting**: Should we implement rate limiting to prevent abuse?
9. **Data retention**: How long should deleted barillets be retained (soft delete vs hard delete)?
10. **Mobile app**: Should we build a native mobile app (React Native, Flutter) or stick with PWA?

---

**Last Updated**: 2025-10-17
