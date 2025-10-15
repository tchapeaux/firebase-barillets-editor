<script setup lang="ts">
import { ref, watch } from "vue";
import type { Theme } from "../types/barillet";

interface Props {
  theme: Theme;
  themeNumber: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [theme: Theme];
}>();

// Local state for the theme
const localTheme = ref<Theme>({ ...props.theme });

// Watch for external changes (if parent updates the theme)
watch(
  () => props.theme,
  (newTheme) => {
    localTheme.value = { ...newTheme };
    noTitle.value = newTheme.title === null;
  },
  { deep: true }
);

// Emit changes to parent
const updateTheme = () => {
  emit("update", { ...localTheme.value });
};

// Handle "No title" checkbox
// noTitle = true means checkbox is checked (no title)
const noTitle = ref(props.theme.title === null);

const toggleTitle = () => {
  if (noTitle.value) {
    // Checkbox is checked → no title
    localTheme.value.title = null;
    updateTheme();
  } else {
    // Checkbox is unchecked → has title (empty string by default)
    localTheme.value.title = "";
    updateTheme();
  }
};

watch(noTitle, toggleTitle);
</script>

<template>
  <div class="theme-card">
    <div class="theme-header">
      <h3 class="theme-number">Thème {{ themeNumber }}</h3>
      <div class="theme-type">
        <label>
          <input
            type="radio"
            :value="'Mixte'"
            v-model="localTheme.type"
            @change="updateTheme"
          />
          Mixte
        </label>
        <label>
          <input
            type="radio"
            :value="'Comparée'"
            v-model="localTheme.type"
            @change="updateTheme"
          />
          Comparée
        </label>
      </div>
    </div>

    <div class="theme-field">
      <label class="field-label">
        <input type="checkbox" v-model="noTitle" />
        Pas de titre
      </label>
      <input
        v-if="!noTitle"
        type="text"
        class="theme-input"
        v-model="localTheme.title"
        @blur="updateTheme"
        placeholder="Titre du thème"
      />
    </div>

    <div class="theme-field">
      <label class="field-label">Participation</label>
      <input
        type="text"
        class="theme-input"
        v-model="localTheme.participation"
        @blur="updateTheme"
        placeholder="Participation"
      />
    </div>

    <div class="theme-field">
      <label class="field-label">Catégorie</label>
      <input
        type="text"
        class="theme-input"
        v-model="localTheme.category"
        @blur="updateTheme"
        placeholder="Libre"
      />
    </div>

    <div class="theme-field">
      <label class="field-label">Durée</label>
      <div class="duration-group">
        <input
          type="text"
          class="theme-input duration-input"
          v-model="localTheme.duration.value"
          @blur="updateTheme"
          placeholder="3:00 ou 2 fois 3:00"
        />
        <div class="duration-options">
          <label class="checkbox-label">
            <input
              type="checkbox"
              :checked="localTheme.duration.type === 'special'"
              @change="(e) => { localTheme.duration.type = (e.target as HTMLInputElement).checked ? 'special' : 'fixed'; updateTheme(); }"
            />
            Spéciale
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="localTheme.duration.maximum"
              @change="updateTheme"
            />
            Maximum
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s ease;
}

.theme-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.theme-number {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.theme-type {
  display: flex;
  gap: 1rem;
}

.theme-type label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.theme-type input[type="radio"] {
  cursor: pointer;
}

.theme-field {
  margin-bottom: 0.875rem;
}

.theme-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.375rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 400;
  color: #555;
  cursor: pointer;
}

.theme-input,
.theme-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.theme-input:focus,
.theme-select:focus {
  outline: none;
  border-color: #4caf50;
}

.theme-select {
  cursor: pointer;
  background-color: white;
}

.duration-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.duration-input {
  width: 100%;
}

.duration-options {
  display: flex;
  gap: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .theme-card {
    padding: 1rem;
  }

  .theme-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .theme-type {
    width: 100%;
  }
}
</style>
