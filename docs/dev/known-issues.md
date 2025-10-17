# Known Issues & Limitations

This document tracks current limitations, workarounds, and open questions about the project.

## Current Limitations

### 1. No Undo/Redo

**Issue**: Destructive actions (delete) are permanent after confirmation. No version history or undo functionality.

**Current Behavior**:

- Delete shows confirmation dialog
- Once confirmed, barillet is permanently deleted
- No way to recover deleted barillets

**Workaround**:

- Use the duplicate feature before making major changes
- Export important barillets to JSON as backup

**Future Solution**:

- Implement soft delete (mark as deleted, keep in database)
- Add barillet versioning/history
- Consider undo/redo stack for editor

**Priority**: Low (confirmation dialogs prevent most accidental deletions)

---

### 2. Basic Duration Input

**Issue**: Duration field accepts free text without specialized validation. Complex formats ("2 fois 3:00", special values) are hard to input correctly.

**Current Behavior**:

- Users type duration as plain text
- Parsing happens via `parseDurationToMinutes()` helper
- Invalid formats may not be caught until save

**Workaround**:

- Follow format examples in placeholder text
- Check stats preview to verify parsing

**Future Solution**:

- Create specialized `DurationInput.vue` component (see [roadmap.md](roadmap.md))
- Support autocomplete for common values
- Real-time validation feedback

**Priority**: High (see roadmap item #2)

---

### 3. No Auto-save

**Issue**: Editor requires manual save. Changes are lost if user navigates away without saving.

**Current Behavior**:

- "Unsaved changes" warning prevents accidental navigation
- Users must click "Sauvegarder" button to persist changes

**Workaround**:

- Remember to save frequently
- Navigation guard warns before losing changes

**Future Solution**:

- Implement auto-save on blur (debounced)
- Show "All changes saved" indicator
- Consider draft/published state

**Priority**: Medium (navigation guards mitigate risk)

---

### 4. Firestore Indexes

**Issue**: Complex queries may require manual index creation in Firebase Console.

**Current Behavior**:

- Simple queries work without indexes
- Firestore shows error messages if index is needed
- Error message includes link to create index

**Workaround**:

- Follow the link in Firestore error message
- Create index via Firebase Console
- Wait for index to build (usually <1 minute)

**Future Solution**:

- Pre-define indexes in `firestore.indexes.json`
- Deploy indexes with `firebase deploy --only firestore:indexes`
- Document required indexes

**Priority**: Low (only affects advanced features not yet implemented)

---

### 5. Limited Barillet Validation

**Issue**: Some edge cases in barillet data are not validated client-side.

**Current Behavior**:

- Basic validation (title required, 18 themes, valid types)
- Some edge cases may pass validation but cause issues

**Examples**:

- Duration with invalid format (e.g., "abc:def")
- Extremely long titles or notes
- Special characters in category names

**Workaround**:

- Follow input guidelines
- Check data before saving

**Future Solution**:

- Comprehensive validation with clear error messages
- Server-side validation (Firestore security rules or Cloud Functions)
- Input sanitization

**Priority**: Low (rare edge cases)

---

### 6. Single User Session Only

**Issue**: User can only be logged in on one device at a time (effectively).

**Current Behavior**:

- Firebase Auth supports multiple sessions
- But logging in on new device doesn't notify other devices
- No session management UI

**Workaround**:

- Users typically only work from one device

**Future Solution**:

- Multi-device session management
- "Active sessions" view in settings
- Remote logout capability

**Priority**: Low (not a common use case)

---

## Browser Compatibility

### Supported Browsers

- ✅ Chrome/Edge 90+ (Chromium-based)
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ Mobile Safari (iOS 14+) - some input quirks
- ❌ Internet Explorer (not supported)

### Known Browser Issues

**Safari Date Input**:

- Native date picker may behave differently
- Consider custom date picker for consistency

**Mobile Keyboard**:

- Virtual keyboard may cover input fields on small screens
- Consider scrollIntoView() on focus

---

## Performance Considerations

### Large Barillet Collections

**Issue**: Performance degrades with 100+ barillets in home view.

**Current Behavior**:

- All barillets load at once
- No pagination or virtual scrolling
- Real-time updates for all documents

**Workaround**:

- Use folders to organize (when implemented)
- Delete old/unused barillets

**Future Solution**:

- Implement pagination (10-20 barillets per page)
- Virtual scrolling for large lists
- Lazy loading with infinite scroll

**Priority**: Low (most users have <50 barillets)

---

### Real-time Sync Overhead

**Issue**: Firestore `onSnapshot` listener syncs all barillets in real-time, even when not viewing them.

**Current Behavior**:

- Listener active as long as user is logged in
- Updates trigger Vue reactivity updates
- Bandwidth usage proportional to barillet count

**Workaround**:

- No action needed for <100 barillets

**Future Solution**:

- Unsubscribe from listener when not on home page
- Implement on-demand loading
- Use Firestore offline persistence

**Priority**: Low (acceptable for current scale)

---

## Open Questions

These are strategic questions that should be answered before implementing certain features:

### Data & Architecture

1. **Server-side validation**: Do we need server-side validation in addition to client-side?
   - **Options**: Firestore security rules, Cloud Functions
   - **Trade-offs**: Security vs complexity

2. **Optimistic UI updates**: Should we implement optimistic updates for better perceived performance?
   - **Options**: Update UI immediately, rollback on error
   - **Trade-offs**: Faster UX vs potential inconsistency

3. **Barillet versioning**: Do we need version history for undo functionality?
   - **Options**: Store snapshots, event sourcing, simple undo stack
   - **Trade-offs**: Storage cost vs feature richness

4. **Soft delete vs hard delete**: Should deleted barillets be recoverable?
   - **Options**: Soft delete (mark as deleted), hard delete (remove from DB)
   - **Trade-offs**: Data retention vs clean database

### Features & Scope

5. **Category scope**: Should categories be global, user-specific, or both?
   - **Options**: Global only, user-specific only, hybrid
   - **Trade-offs**: Simplicity vs flexibility

6. **Role-based access**: Do we need different roles (admin, editor, viewer) for collaborative features?
   - **Options**: Owner only, role-based permissions
   - **Trade-offs**: Complexity vs collaboration features

7. **Internationalization**: Should we support multiple languages beyond French?
   - **Options**: French only, i18n framework (vue-i18n)
   - **Trade-offs**: Dev effort vs broader audience

### Analytics & Monitoring

8. **Usage analytics**: Do we need to track usage patterns?
   - **Options**: None, privacy-respecting (Plausible), full analytics (GA)
   - **Trade-offs**: User insights vs privacy

9. **Error reporting**: Should we implement automated error reporting?
   - **Options**: Sentry, LogRocket, custom solution
   - **Trade-offs**: Debugging ease vs cost/privacy

### Security & Performance

10. **Rate limiting**: Should we implement rate limiting to prevent abuse?
    - **Options**: Client-side throttling, Cloud Functions rate limiting
    - **Trade-offs**: Protection vs UX friction

11. **Data retention policy**: How long should user data be kept after account deletion?
    - **Options**: Immediate deletion, 30-day grace period, indefinite
    - **Trade-offs**: Privacy compliance vs user protection

12. **Mobile app**: Should we build a native mobile app or stick with PWA?
    - **Options**: PWA only, React Native, Flutter
    - **Trade-offs**: Development cost vs app store presence

---

## Reporting Issues

If you encounter a bug or limitation not listed here:

1. Check existing issues in GitHub (if project is public)
2. Document steps to reproduce
3. Include browser/OS version
4. Provide screenshots if relevant
5. Create a new issue or update this document

---

**Last Updated**: 2025-10-17
