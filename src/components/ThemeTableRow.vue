<script setup lang="ts">
import { ref, watch } from 'vue';
import { watchDeep } from '@vueuse/core';
import type { Theme } from '../types/barillet';
import Input from '@/components/ui/input.vue';
import CategoryCombobox from '@/components/ui/CategoryCombobox.vue';

interface Props {
  theme: Theme;
  themeNumber: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [theme: Theme];
}>();

// Local state for the theme
const localTheme = ref<Theme>(JSON.parse(JSON.stringify(props.theme)));
const skipAutoEmit = ref(true);

// Watch for external changes (if parent updates the theme)
watch(
  () => props.theme,
  (newTheme) => {
    // Pause auto-emit during external update to prevent loops
    skipAutoEmit.value = true;
    localTheme.value = JSON.parse(JSON.stringify(newTheme));
    // Resume auto-emit after update completes
    setTimeout(() => {
      skipAutoEmit.value = false;
    }, 0);
  },
  { deep: true }
);

// Emit changes to parent
const updateTheme = () => {
  emit('update', { ...localTheme.value });
};

// Auto-emit changes when localTheme is modified
watchDeep(localTheme, () => {
  if (!skipAutoEmit.value) {
    updateTheme();
  }
});

// Enable auto-emit after initial render
setTimeout(() => {
  skipAutoEmit.value = false;
}, 0);

// Toggle theme type (Mixte/Comparée)
const toggleType = () => {
  localTheme.value.type =
    localTheme.value.type === 'Mixte' ? 'Comparée' : 'Mixte';
  updateTheme();
};
</script>

<template>
  <tr class="border-b border-border hover:bg-muted/30 transition-colors">
    <!-- Number -->
    <td class="px-3 py-2 text-center text-sm font-medium text-muted-foreground">
      {{ themeNumber }}
    </td>

    <!-- Nature (Type) -->
    <td class="px-2 py-2">
      <button
        type="button"
        :class="
          localTheme.type === 'Mixte'
            ? 'bg-type-mixte text-type-mixte-foreground hover:bg-type-mixte-hover'
            : 'bg-type-comparee text-type-comparee-foreground hover:bg-type-comparee-hover'
        "
        class="text-xs px-2 py-1 rounded font-semibold transition-colors w-full"
        :title="`Changer en ${localTheme.type === 'Mixte' ? 'Comparée' : 'Mixte'}`"
        @click="toggleType"
      >
        {{ localTheme.type === 'Mixte' ? 'M' : 'C' }}
      </button>
    </td>

    <!-- Title -->
    <td class="px-2 py-2">
      <Input
        v-model="localTheme.title!"
        :placeholder="`Thème ${themeNumber}`"
        class="text-sm h-8"
      />
    </td>

    <!-- Participation -->
    <td class="px-2 py-2">
      <Input
        v-model="localTheme.participation"
        placeholder="illimitée"
        class="text-sm h-8"
      />
    </td>

    <!-- Category -->
    <td class="px-2 py-2">
      <CategoryCombobox
        v-model="localTheme.category"
        placeholder="Libre"
        class="text-sm h-8"
        :class="
          localTheme.category !== 'Libre'
            ? 'border-highlight bg-highlight-bg'
            : ''
        "
      />
    </td>

    <!-- Duration -->
    <td class="px-2 py-2">
      <Input
        v-model="localTheme.duration"
        placeholder="3:00"
        class="text-sm h-8 w-20"
      />
    </td>

    <!-- Notes -->
    <td class="px-2 py-2">
      <Input v-model="localTheme.notes" maxlength="250" class="text-sm h-8" />
    </td>
  </tr>
</template>
