<script setup lang="ts">
import { ref, watch } from "vue";
import ThemeCard from "./ThemeCard.vue";
import Badge from "@/components/ui/badge.vue";
import type { Theme } from "../types/barillet";

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
  emit("update", [...localThemes.value]);
};
</script>

<template>
  <div class="w-full">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b-2"
    >
      <h2 class="text-2xl font-semibold">Les thèmes</h2>
      <Badge variant="secondary" class="text-sm">
        {{ themes.length }} thèmes
      </Badge>
    </div>

    <div class="flex flex-col gap-4">
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
