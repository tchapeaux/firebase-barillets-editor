<script setup lang="ts">
import { ref, watch } from 'vue';
import { watchDeep } from '@vueuse/core';
import type { Theme } from '../types/barillet';
import Card from '@/components/ui/card.vue';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import CategoryCombobox from '@/components/ui/CategoryCombobox.vue';
import DurationTypeBadge from './DurationTypeBadge.vue';
import { ArrowLeftRight, RotateCcw } from 'lucide-vue-next';
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
const skipAutoEmit = ref(true);

// Watch for external changes (if parent updates the theme)
watch(
  () => props.theme,
  (newTheme) => {
    // Pause auto-emit during external update to prevent loops
    skipAutoEmit.value = true;
    localTheme.value = { ...newTheme };
    noTitle.value = newTheme.title === null;
    updateDurationInputs(newTheme.duration.value);
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

// Handle "No title" checkbox
const noTitle = ref(props.theme.title === null);

const toggleTitle = () => {
  if (noTitle.value) {
    localTheme.value.title = null;
    updateTheme();
  } else {
    localTheme.value.title = '';
    updateTheme();
  }
};

watch(noTitle, toggleTitle);

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
  <Card class="overflow-hidden hover:shadow-md transition-shadow @container">
    <!-- Header with Title Input and Type Selector -->
    <div class="bg-muted px-3 py-2 border-b border-muted">
      <div class="flex items-center gap-2">
        <!-- Type Selector as Button -->
        <button
          type="button"
          :class="
            localTheme.type === 'Mixte'
              ? 'bg-type-mixte text-type-mixte-foreground hover:bg-type-mixte-hover'
              : 'bg-type-comparee text-type-comparee-foreground hover:bg-type-comparee-hover'
          "
          class="text-xs px-2 py-1 rounded font-medium transition-colors shrink-0 flex items-center gap-1 group"
          :title="`Changer en ${localTheme.type === 'Mixte' ? 'Comparée' : 'Mixte'}`"
          @click="
            localTheme.type =
              localTheme.type === 'Mixte' ? 'Comparée' : 'Mixte';
            updateTheme();
          "
        >
          {{ localTheme.type }}
          <ArrowLeftRight
            class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </button>

        <!-- Title Input or Add Title Button -->
        <div v-if="!noTitle" class="flex items-center gap-2 flex-1">
          <Input
            v-model="localTheme.title!"
            :placeholder="`Thème ${themeNumber}`"
            class="text-sm font-medium flex-1 bg-white"
          />
          <button
            type="button"
            class="text-xs text-muted-foreground hover:text-foreground shrink-0 px-1"
            title="Supprimer le titre"
            @click="noTitle = true"
          >
            ✕
          </button>
        </div>
        <button
          v-else
          type="button"
          class="text-xs text-muted-foreground hover:text-foreground italic shrink-0 flex-1 text-left"
          @click="noTitle = false"
        >
          Thème {{ themeNumber }} - Cliquer pour ajouter un titre
        </button>
      </div>
    </div>

    <!-- Card Body -->
    <div class="px-3 py-3 bg-white space-y-3">
      <!-- Row 1: Category and Participation -->
      <div class="grid grid-cols-1 @lg:grid-cols-2 gap-3">
        <!-- Participation Field -->
        <div>
          <Label class="text-xs text-muted-foreground mb-1 block"
            >Participation</Label
          >
          <Input
            v-model="localTheme.participation"
            placeholder="2 / équipe"
            class="text-sm h-8"
          />
        </div>

        <!-- Category Field -->
        <div>
          <Label class="text-xs text-muted-foreground mb-1.5 block"
            >Catégorie</Label
          >
          <div class="flex items-center gap-2">
            <!-- Category combobox with autocomplete -->
            <CategoryCombobox
              v-model="localTheme.category"
              class="flex-1"
              :class="
                localTheme.category !== 'Libre'
                  ? 'border-highlight bg-highlight-bg'
                  : ''
              "
            />

            <!-- Preset button for Libre -->
            <button
              type="button"
              class="text-xs px-2.5 py-1 rounded border font-medium transition-colors shrink-0 bg-muted text-muted-foreground border-muted hover:bg-secondary flex items-center gap-1"
              title="Réinitialiser à 'Libre'"
              @click="
                localTheme.category = 'Libre';
                updateTheme();
              "
            >
              <RotateCcw class="w-3 h-3" />
              Libre
            </button>
          </div>
        </div>
      </div>

      <!-- Row 2: Duration and Notes (2 columns on desktop) -->
      <div class="grid grid-cols-1 @lg:grid-cols-2 gap-3">
        <!-- Duration Field -->
        <div>
          <Label class="text-xs text-muted-foreground mb-1.5 block"
            >Durée</Label
          >
          <div class="flex items-center gap-2">
            <DurationTypeBadge
              :duration-type="localTheme.duration.type"
              @toggle="toggleDurationType"
            />

            <!-- Numeric Duration Input (fixed) -->
            <template v-if="localTheme.duration.type === 'fixed'">
              <Input
                v-model="durationMinutes"
                type="number"
                min="0"
                max="60"
                placeholder="3"
                class="text-sm w-16 h-8 text-center"
                @blur="updateDurationFromInputs"
              />
              <span class="text-muted-foreground text-sm">:</span>
              <Input
                v-model="durationSeconds"
                type="number"
                min="0"
                max="59"
                placeholder="00"
                class="text-sm w-16 h-8 text-center"
                @blur="formatSeconds"
              />
            </template>

            <!-- Free Text Duration Input (special) -->
            <Input
              v-else
              v-model="localTheme.duration.value"
              placeholder="jusqu'à la fin du spectacle"
              class="text-sm h-8 flex-1"
            />
          </div>
        </div>

        <!-- Notes Field -->
        <div>
          <Label class="text-xs text-muted-foreground mb-1.5 block"
            >Notes</Label
          >
          <textarea
            v-model="localTheme.notes"
            placeholder="Notes internes"
            maxlength="250"
            class="w-full text-sm rounded-md border border-input bg-card px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  </Card>
</template>
