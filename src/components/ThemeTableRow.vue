<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Theme } from '../types/barillet';
import Input from '@/components/ui/input.vue';
import DurationTypeBadge from './DurationTypeBadge.vue';
import { useThemeDuration } from '../composables/useThemeDuration';

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
    updateDurationInputs(newTheme.duration.value);
  },
  { deep: true }
);

// Emit changes to parent
const updateTheme = () => {
  emit('update', { ...localTheme.value });
};

// Toggle theme type (Mixte/Comparée)
const toggleType = () => {
  localTheme.value.type =
    localTheme.value.type === 'Mixte' ? 'Comparée' : 'Mixte';
  updateTheme();
};

// Use shared duration composable
const {
  durationMinutes,
  durationSeconds,
  updateDurationInputs,
  updateDurationFromInputs,
  formatSeconds,
  toggleDurationType,
} = useThemeDuration(localTheme, updateTheme);

// Initialize duration inputs
updateDurationInputs(props.theme.duration.value);
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
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
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
        @blur="updateTheme"
      />
    </td>

    <!-- Participation -->
    <td class="px-2 py-2">
      <Input
        v-model="localTheme.participation"
        placeholder="illimitée"
        class="text-sm h-8"
        @blur="updateTheme"
      />
    </td>

    <!-- Category -->
    <td class="px-2 py-2">
      <Input
        v-model="localTheme.category"
        placeholder="Libre"
        class="text-sm h-8"
        :class="
          localTheme.category !== 'Libre'
            ? 'border-green-300 bg-green-50/30'
            : ''
        "
        @blur="updateTheme"
      />
    </td>

    <!-- Duration -->
    <td class="px-2 py-2">
      <div class="flex items-center gap-1">
        <DurationTypeBadge
          :duration-type="localTheme.duration.type"
          @toggle="toggleDurationType"
        />

        <!-- Numeric Duration Input (fixed) -->
        <div
          v-if="localTheme.duration.type === 'fixed'"
          class="flex items-center gap-1"
        >
          <Input
            v-model="durationMinutes"
            type="number"
            min="0"
            max="60"
            placeholder="3"
            class="text-sm w-12 h-8 text-center p-1"
            @blur="updateDurationFromInputs"
          />
          <span class="text-gray-400 text-xs">:</span>
          <Input
            v-model="durationSeconds"
            type="number"
            min="0"
            max="59"
            placeholder="00"
            class="text-sm w-12 h-8 text-center p-1"
            @blur="formatSeconds"
          />
        </div>

        <!-- Free Text Duration Input (special) -->
        <Input
          v-else
          v-model="localTheme.duration.value"
          placeholder="jusqu'à la fin"
          class="text-sm h-8 flex-1"
          @blur="updateTheme"
        />
      </div>
    </td>

    <!-- Notes -->
    <td class="px-2 py-2">
      <Input
        v-model="localTheme.notes"
        maxlength="250"
        class="text-sm h-8"
        @blur="updateTheme"
      />
    </td>
  </tr>
</template>
