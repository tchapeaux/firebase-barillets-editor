<script setup lang="ts">
import { ref, watch } from 'vue';
import ThemeCard from './ThemeCard.vue';
import type { Theme } from '../types/barillet';

interface Props {
  themes: Theme[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [themes: Theme[]];
}>();

// Local state for themes
const localThemes = ref<Theme[]>([...props.themes]);

// Watch for external changes
watch(() => props.themes, (newThemes) => {
  localThemes.value = [...newThemes];
}, { deep: true });

// Update a specific theme
const updateTheme = (index: number, updatedTheme: Theme) => {
  localThemes.value[index] = updatedTheme;
  emit('update', [...localThemes.value]);
};
</script>

<template>
  <div class="theme-list">
    <div class="theme-list-header">
      <h2>Les 18 thèmes</h2>
      <p class="theme-count">{{ themes.length }} thèmes</p>
    </div>

    <div class="themes-container">
      <ThemeCard
        v-for="(theme, index) in localThemes"
        :key="index"
        :theme="theme"
        :theme-number="index + 1"
        @update="(updatedTheme) => updateTheme(index, updatedTheme)"
      />
    </div>
  </div>
</template>

<style scoped>
.theme-list {
  width: 100%;
}

.theme-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.theme-list-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.theme-count {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  background: #f5f5f5;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.themes-container {
  display: flex;
  flex-direction: column;
}

/* Responsive design */
@media (max-width: 768px) {
  .theme-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
