<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import ThemeCard from './ThemeCard.vue';
import ThemeTableRow from './ThemeTableRow.vue';
import Badge from '@/components/ui/badge.vue';
import Button from '@/components/ui/button.vue';
import { LayoutGrid, Table } from 'lucide-vue-next';
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

// View mode state
const viewMode = ref<'grid' | 'table'>('grid');

// Load view mode preference from localStorage
onMounted(() => {
  const savedViewMode = localStorage.getItem('barilletViewMode');
  if (savedViewMode === 'grid' || savedViewMode === 'table') {
    viewMode.value = savedViewMode;
  }
});

// Save view mode preference to localStorage
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'table' : 'grid';
  localStorage.setItem('barilletViewMode', viewMode.value);
};

// Watch for external changes
watch(
  () => props.themes,
  (newThemes) => {
    localThemes.value = [...newThemes];
  },
  { deep: true }
);

// Update a specific theme
const updateTheme = (index: number, updatedTheme: Theme) => {
  localThemes.value[index] = updatedTheme;
  emit('update', [...localThemes.value]);
};
</script>

<template>
  <div class="w-full">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b-2"
    >
      <h2 class="text-2xl font-semibold">Les thèmes</h2>
      <div class="flex items-center gap-3">
        <Badge variant="secondary" class="text-sm">
          {{ themes.length }} thèmes
        </Badge>
        <Button
          variant="outline"
          size="sm"
          class="gap-2"
          @click="toggleViewMode"
        >
          <LayoutGrid v-if="viewMode === 'table'" class="h-4 w-4" />
          <Table v-else class="h-4 w-4" />
          {{ viewMode === 'grid' ? 'Tableau' : 'Cartes' }}
        </Button>
      </div>
    </div>

    <!-- Grid View (Cards) -->
    <div
      v-if="viewMode === 'grid'"
      class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4"
    >
      <ThemeCard
        v-for="(theme, index) in localThemes"
        :key="index"
        :theme="theme"
        :theme-number="index + 1"
        @update="(updatedTheme) => updateTheme(index, updatedTheme)"
      />
    </div>

    <!-- Table View -->
    <div v-else class="overflow-x-auto rounded-lg border border-border">
      <table class="w-full border-collapse bg-card">
        <thead>
          <tr class="bg-muted border-b border-border">
            <th
              class="px-3 py-3 text-left text-xs font-semibold text-muted-foreground"
            >
              #
            </th>
            <th
              class="px-2 py-3 text-left text-xs font-semibold text-muted-foreground"
            >
              Nature
            </th>
            <th
              class="px-2 py-3 text-left text-xs font-semibold text-muted-foreground"
            >
              Titre
            </th>
            <th
              class="px-2 py-3 text-left text-xs font-semibold text-muted-foreground"
            >
              Participation
            </th>
            <th
              class="px-2 py-3 text-left text-xs font-semibold text-muted-foreground"
            >
              Catégorie
            </th>
            <th
              class="px-2 py-3 text-left text-xs font-semibold text-muted-foreground"
            >
              Durée
            </th>
            <th
              class="px-2 py-3 text-left text-xs font-semibold text-muted-foreground"
            >
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          <ThemeTableRow
            v-for="(theme, index) in localThemes"
            :key="index"
            :theme="theme"
            :theme-number="index + 1"
            @update="(updatedTheme) => updateTheme(index, updatedTheme)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
