# Code Conventions & Patterns

## Code Style

### Vue Component Structure

- **Always use** `<script setup lang="ts">` syntax
- **Component order**: `<script setup>` → `<template>` → `<style>`
- **Props**: Use `defineProps<T>()` with TypeScript interface
- **Emits**: Use `defineEmits<T>()` with TypeScript interface
- **Reactive state**: Prefer `ref()` for primitives, `reactive()` for objects

**Example:**

```vue
<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  count?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [value: string];
  delete: [];
}>();

const localValue = ref('');
</script>

<template>
  <div>{{ title }}</div>
</template>

<style scoped>
/* Component styles */
</style>
```

### Naming Conventions

| Item                    | Convention                  | Example                                     |
| ----------------------- | --------------------------- | ------------------------------------------- |
| **Components**          | PascalCase                  | `ThemeCard.vue`, `BarilletEditor.vue`       |
| **Composables**         | camelCase with `use` prefix | `useAuth.ts`, `useBarillets.ts`             |
| **Types/Interfaces**    | PascalCase                  | `Barillet`, `Theme`, `ThemeDuration`        |
| **Variables/Functions** | camelCase                   | `barillet`, `calculateStats()`              |
| **Constants**           | UPPER_SNAKE_CASE            | `MAX_THEMES`, `DEFAULT_DURATION`            |
| **Event handlers**      | `on` + event name           | `onSave()`, `onDelete()`, `onThemeUpdate()` |

### Import Order

Organize imports in this order:

1. Vue imports
2. Third-party libraries (Firebase, Router, etc.)
3. Type imports
4. Local composables
5. Local components

**Example:**

```typescript
// 1. Vue imports
import { ref, computed, onMounted } from 'vue';

// 2. Third-party libraries
import { useRouter } from 'vue-router';

// 3. Type imports
import type { Barillet, Theme } from '@/types/barillet';

// 4. Local composables
import { useAuth } from '@/composables/useAuth';
import { useBarillets } from '@/composables/useBarillets';

// 5. Local components
import ThemeCard from '@/components/ThemeCard.vue';
```

### File Organization

```
src/
├── views/           # Route-level components (pages)
├── components/      # Reusable UI components
├── composables/     # Shared logic (Vue composables)
├── types/           # TypeScript type definitions
├── router/          # Vue Router configuration
├── services/        # Business logic services
└── lib/             # Pure utility functions
```

## Common Patterns

### Error Handling

Always wrap Firestore operations in try-catch blocks with user-facing error messages:

```typescript
try {
  await updateBarillet(barillet.id!, updatedData);
  console.log('Barillet saved successfully');
} catch (error) {
  console.error('Failed to save barillet:', error);
  // Show user-facing error message (toast/alert)
  alert('Erreur lors de la sauvegarde du barillet');
}
```

### Firestore Date Handling

**Critical Pattern**: Always convert between Firestore Timestamps and JavaScript Dates at the data boundary.

**Reading from Firestore:**

```typescript
// In useBarillets.ts
const convertTimestampToDate = (data: any): Barillet => {
  return {
    ...data,
    date: data.date?.toDate() || null,
    createdAt: data.createdAt?.toDate() || null,
    updatedAt: data.updatedAt?.toDate() || null,
  };
};

// Used in onSnapshot listener
onSnapshot(q, (snapshot) => {
  barillets.value = snapshot.docs.map((doc) => {
    const data = convertTimestampToDate(doc.data());
    return { ...data, id: doc.id };
  });
});
```

**Writing to Firestore:**

```typescript
// Convert Date objects to Timestamps before writing
const convertDateToTimestamp = (barillet: Partial<Barillet>) => {
  return {
    ...barillet,
    date: barillet.date ? Timestamp.fromDate(barillet.date) : null,
    updatedAt: Timestamp.now(),
  };
};

// Used in update operations
await updateDoc(doc(db, 'barillets', id), convertDateToTimestamp(data));
```

**In Components**: Always use JavaScript `Date` objects. Never use Firestore Timestamps directly in Vue components.

### Form Validation

- Use `@blur` events for real-time validation
- Provide clear, French error messages
- Validate before Firestore writes

**Example:**

```vue
<script setup lang="ts">
const title = ref('');
const titleError = ref('');

const validateTitle = () => {
  if (!title.value.trim()) {
    titleError.value = 'Le titre est requis';
    return false;
  }
  titleError.value = '';
  return true;
};

const onSave = async () => {
  if (!validateTitle()) {
    return;
  }
  // Proceed with save
};
</script>

<template>
  <input v-model="title" @blur="validateTitle" :class="{ error: titleError }" />
  <span v-if="titleError" class="error-message">{{ titleError }}</span>
</template>
```

### Auto-Save Pattern

For editor components with auto-save (like BarilletEditorView):

```typescript
import { useDebounceFn, watchDeep } from '@vueuse/core';

const syncStatus = ref<'synced' | 'saving' | 'error'>('synced');
const lastSavedState = ref<string>('');

// Auto-save function
const performAutoSave = async () => {
  // Validate, then save to Firestore
  syncStatus.value = 'saving';
  // ... save logic ...
  syncStatus.value = 'synced';
  lastSavedState.value = JSON.stringify(localData.value);
};

// Debounced auto-save (1.5s)
const debouncedAutoSave = useDebounceFn(performAutoSave, 1500);

// Watch for changes
watchDeep(localData, (newValue) => {
  const currentState = JSON.stringify(newValue);
  if (currentState === lastSavedState.value) return; // No changes

  syncStatus.value = 'saving';
  debouncedAutoSave();
});
```

**Key Points:**

- Use `watchDeep` for nested object changes
- Compare JSON strings to detect actual changes
- Debounce saves to batch rapid edits (1.5s recommended)
- Show sync status to user (Enregistré/Enregistrement.../Erreur)

### Loading States

Always show loading indicators for async operations:

```vue
<script setup lang="ts">
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    // Fetch data
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="loading">Chargement...</div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

## TypeScript Guidelines

### Strict Mode

The project uses TypeScript strict mode. Always:

- Define explicit types for function parameters and return values
- Avoid `any` type (use `unknown` if truly unknown)
- Use type guards for runtime type checking
- Leverage type inference where obvious

### Type Definitions

Store all shared types in `src/types/barillet.ts`:

```typescript
// Good: Explicit types
export interface Theme {
  type: ThemeType;
  title: string | null;
  participation: ThemeParticipation;
  category: string;
  duration: ThemeDuration;
  notes?: string;
}

// Good: Union types for constrained values
export type ThemeType = 'Mixte' | 'Comparée';

// Avoid: Loose types
// type Theme = any ❌
```

## UI/UX Conventions

### French Language

- All user-facing text must be in French
- Error messages in French
- Placeholder text in French
- UI labels in French

**Example:**

```vue
<template>
  <button>Sauvegarder</button>
  <input placeholder="Titre du barillet" />
  <p v-if="error">{{ error }}</p>
  <!-- "Erreur lors de..." -->
</template>
```

### Responsive Design

- Mobile-first approach
- Use Tailwind CSS responsive utilities (`sm:`, `md:`, `lg:`)
- Use container queries (`@container`, `@sm:`, `@lg:`, etc.) for component-level responsive behavior
- Test on mobile viewport (375px minimum)

**Container Queries vs Media Queries:**

Container queries allow components to respond to their container's size rather than the viewport size, making them more reusable and context-aware.

**When to use container queries:**

- Card components that appear in different layouts (grids, sidebars, modals)
- Components with internal responsive layouts (button groups, field layouts)
- Reusable components that need to adapt to their container

**When to use media queries:**

- Page-level layouts and navigation
- Global breakpoints for major layout shifts
- Features that should respond to device/viewport size

**Example:**

```vue
<template>
  <!-- Container query - responds to card width -->
  <Card class="@container">
    <div class="flex flex-col @lg:flex-row gap-2">
      <Button>Action 1</Button>
      <Button>Action 2</Button>
    </div>
  </Card>

  <!-- Media query - responds to viewport width -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <!-- Cards in grid -->
  </div>
</template>
```

### Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Add ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Maintain focus management in modals

## Development Commands

### Essential Commands

```bash
# Development server
npm run dev

# Type checking (no build)
npm run type-check

# Production build (includes type check)
npm run build

# Code formatting
npm run format

# Linting with auto-fix
npm run lint:fix
```

### Pre-Commit Requirements

**For AI Coding Agents**: At the end of **each coding session**, you **MUST** run:

```bash
# 1. Format all files
npm run format

# 2. Fix linting issues
npm run lint:fix

# 3. Verify TypeScript types
npm run type-check
```

These commands ensure code quality and prevent TypeScript errors from being committed.

### Git Workflow

1. Make changes to code
2. Run format + lint:fix + type-check
3. Test manually in browser (`npm run dev`)
4. Stage changes: `git add .`
5. Commit: `git commit -m "feat: description"`
6. Push: `git push`

**Note**: Pre-commit hooks (husky + lint-staged) are configured to enforce formatting and linting automatically.

## Component Patterns

### Views vs Components

**Views** (`src/views/`):

- Route-level components
- Named with `View` suffix (e.g., `HomeView.vue`, `LoginView.vue`)
- Handle route params and query strings
- Coordinate multiple components

**Components** (`src/components/`):

- Reusable UI pieces
- Named descriptively (e.g., `ThemeCard.vue`, `BarilletCard.vue`)
- Receive data via props
- Emit events for parent communication
- Should be presentational when possible

### Composables Pattern

Use composables for:

- Shared state management (e.g., `useAuth`, `useBarillets`)
- Reusable logic across components
- Firebase/API interactions
- Complex computed state

**Example Structure:**

```typescript
// src/composables/useBarillets.ts
import { ref, onMounted } from 'vue';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useBarillets = () => {
  const barillets = ref<Barillet[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadBarillets = async (userId: string) => {
    // Implementation
  };

  const createBarillet = async (data: Partial<Barillet>) => {
    // Implementation
  };

  return {
    barillets,
    loading,
    error,
    loadBarillets,
    createBarillet,
  };
};
```

## Styling Conventions

### Tailwind CSS

- Use Tailwind utility classes for styling
- Prefer utilities over custom CSS
- Use `@apply` directive sparingly (only for repeated patterns)
- Follow mobile-first responsive design
- Use container queries (`@container`) for component-level responsive behavior
- Prefer design system tokens instead of hardcoded color names

**Container Query Usage:**

The project uses `@tailwindcss/container-queries` plugin. To make a component container-aware:

1. Add `@container` class to the container element
2. Use container query modifiers (`@sm:`, `@md:`, `@lg:`, etc.) on child elements
3. Use arbitrary values for custom breakpoints: `@[22rem]:flex-row`

**Example:**

```vue
<Card class="@container">
  <!-- Buttons stack vertically when card < 384px, horizontal when wider -->
  <div class="flex flex-col @sm:flex-row gap-2">
    <Button class="flex-1 @sm:h-9">Edit</Button>
    <Button class="flex-1 @sm:h-9">View</Button>
  </div>
</Card>
```

**Container Breakpoints:**

Default container query breakpoints (configurable in `tailwind.config.js`):

- `@xs`: 20rem (320px)
- `@sm`: 24rem (384px)
- `@md`: 28rem (448px)
- `@lg`: 32rem (512px)
- `@xl`: 36rem (576px)

For precise control, use arbitrary values: `@[22rem]:flex-row`

### Design System & Color Tokens

The application uses a design system based on **CSS custom properties (CSS variables)** that are exposed as Tailwind utility classes.

#### Core Color Tokens

**Base Colors** (available as `bg-*`, `text-*`, `border-*`):

| Token         | Purpose                      | Light Value          | Dark Value       |
| ------------- | ---------------------------- | -------------------- | ---------------- |
| `background`  | Page background              | Warm cream (#fffac9) | Dark blue-gray   |
| `foreground`  | Primary text                 | Dark gray            | Light gray       |
| `card`        | Card/surface backgrounds     | Warm off-white       | Dark gray        |
| `primary`     | Primary actions (buttons)    | Blue (#3B82F6)       | Light blue       |
| `secondary`   | Secondary UI elements        | Warm gray            | Cool gray        |
| `muted`       | Disabled/neutral backgrounds | Light warm gray      | Medium gray      |
| `accent`      | Subtle accents               | Light beige          | Medium warm gray |
| `destructive` | Error/delete states          | Red (#EF4444)        | Light red        |

#### Status & Semantic Tokens

**Status Indicators** (for user feedback):

```css
/* Success - for completed/synced operations */
--success: green --success-light: light green background --success-border: light
  green border /* Info - for informational/loading states */ --info: blue
  (matches primary) --info-light: light blue background --info-border: light
  blue border /* Highlight - for special/categorized items */ --highlight: soft
  green --highlight-bg: very light green;
```

**Type Indicators** (for theme classification):

```css
/* Mixte type badges */
--type-mixte: light blue background --type-mixte-foreground: dark blue text
  --type-mixte-hover: hover blue background /* Comparée type badges */
  --type-comparee: light purple background --type-comparee-foreground: dark
  purple text --type-comparee-hover: hover purple background;
```

#### Usage Examples

**✅ Correct - Using design system tokens:**

```vue
<!-- Status indicators -->
<Check v-if="synced" class="text-success" />
<Loader2 v-else-if="saving" class="text-info animate-spin" />
<AlertCircle v-else class="text-destructive" />

<!-- Theme type badges -->
<button
  :class="
    type === 'Mixte'
      ? 'bg-type-mixte text-type-mixte-foreground hover:bg-type-mixte-hover'
      : 'bg-type-comparee text-type-comparee-foreground hover:bg-type-comparee-hover'
  "
>
  {{ type }}
</button>

<!-- Category highlight -->
<div :class="category !== 'Libre' ? 'border-highlight bg-highlight-bg' : ''">
  {{ category }}
</div>

<!-- Labels and neutral text -->
<Label class="text-xs text-muted-foreground">Participation</Label>

<!-- Success message -->
<Alert variant="default" class="bg-success-light border-success-border">
  <p class="text-success">Operation completed successfully</p>
</Alert>
```

**❌ Avoid - Hardcoded colors:**

```vue
<!-- DON'T DO THIS -->
<div class="bg-blue-100 text-blue-700">...</div>
<div class="bg-green-50 border-green-200">...</div>
<div class="text-yellow-800">...</div>
```

#### Where to Find Color Definitions

- **CSS Variables**: [`src/styles.css`](../../src/styles.css) (both light and dark mode)
- **Tailwind Config**: [`tailwind.config.js`](../../tailwind.config.js) (exposes variables as utilities)
- **Safelist**: Classes for dynamic `:class` bindings to ensure they're generated

#### Adding New Color Tokens

If you need to add a new semantic color:

1. **Define the CSS variable** in `src/styles.css`:

   ```css
   :root {
     --my-custom-color: 210 100% 50%;
     --my-custom-color-light: 210 100% 95%;
   }

   .dark {
     --my-custom-color: 210 90% 40%;
     --my-custom-color-light: 210 90% 20%;
   }
   ```

2. **Export in Tailwind config** in `tailwind.config.js`:

   ```javascript
   'my-custom': {
     DEFAULT: 'hsl(var(--my-custom-color))',
     light: 'hsl(var(--my-custom-color-light))',
   }
   ```

3. **Add to safelist** if using in dynamic `:class` bindings:

   ```javascript
   safelist: [
     'bg-my-custom',
     'text-my-custom',
     // ...
   ];
   ```

4. **Document the token** in this file with its purpose and usage

### Custom CSS

When custom CSS is needed:

- Use scoped styles in `.vue` components
- Use CSS variables for theming (defined in `src/styles.css`)
- Follow BEM naming if class names are required

**Example:**

```vue
<style scoped>
.theme-card {
  /* Use Tailwind utilities when possible */
}

.theme-card__title {
  /* BEM naming for complex components */
}
</style>
```

## Resources

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Vue Router Documentation](https://router.vuejs.org/)

---

**Last Updated**: 2025-10-23
