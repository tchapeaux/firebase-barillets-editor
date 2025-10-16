<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Theme } from '../types/barillet';
import Card from '@/components/ui/card.vue';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import { ArrowLeftRight } from 'lucide-vue-next';

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
    updateDurationInputs(newTheme.duration.value);
  },
  { deep: true }
);

// Emit changes to parent
const updateTheme = () => {
  emit('update', { ...localTheme.value });
};

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

// Smart duration input - numeric by default, free text when "special"
const durationMinutes = ref('3');
const durationSeconds = ref('00');

// Parse initial duration value
const updateDurationInputs = (value: string) => {
  // Handle "MM:SS" format
  const timeMatch = value.match(/^(\d+):(\d+)$/);
  if (timeMatch) {
    durationMinutes.value = timeMatch[1];
    durationSeconds.value = timeMatch[2];
  }
};

// Initialize duration inputs
updateDurationInputs(props.theme.duration.value);

// Update duration value when numeric inputs change
const updateDurationFromInputs = () => {
  const mins = parseInt(durationMinutes.value || '0', 10);
  const secs = parseInt(durationSeconds.value || '0', 10);
  localTheme.value.duration.value = `${mins}:${secs.toString().padStart(2, '0')}`;
  updateTheme();
};

// Format seconds input to always be 2 digits
const formatSeconds = () => {
  const secs = parseInt(durationSeconds.value || '0', 10);
  if (secs > 59) {
    durationSeconds.value = '59';
  } else {
    durationSeconds.value = secs.toString().padStart(2, '0');
  }
  updateDurationFromInputs();
};

// When switching duration type, convert format if needed
const toggleDurationType = (isSpecial: boolean) => {
  localTheme.value.duration.type = isSpecial ? 'special' : 'fixed';

  if (!isSpecial && localTheme.value.duration.value) {
    // If switching to fixed and value is not in MM:SS format, reset to default
    const timeMatch = localTheme.value.duration.value.match(/^(\d+):(\d+)$/);
    if (!timeMatch) {
      durationMinutes.value = '3';
      durationSeconds.value = '00';
      localTheme.value.duration.value = '3:00';
    }
  }

  updateTheme();
};
</script>

<template>
  <Card class="overflow-hidden hover:shadow-md transition-shadow">
    <!-- Header with Title Input and Type Selector -->
    <div class="bg-gray-50 px-3 py-2 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <!-- Type Selector as Button -->
        <button
          type="button"
          :class="
            localTheme.type === 'Mixte'
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
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
            @blur="updateTheme"
          />
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 shrink-0 px-1"
            title="Supprimer le titre"
            @click="noTitle = true"
          >
            ✕
          </button>
        </div>
        <button
          v-else
          type="button"
          class="text-xs text-gray-500 hover:text-gray-700 italic shrink-0 flex-1 text-left"
          @click="noTitle = false"
        >
          Thème {{ themeNumber }} - Cliquer pour ajouter un titre
        </button>
      </div>
    </div>

    <!-- Card Body -->
    <div class="px-3 py-3 bg-white space-y-3">
      <!-- Row 1: Category and Participation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Category Field -->
        <div>
          <Label class="text-xs text-gray-500 mb-1.5 block">Catégorie</Label>
          <div class="flex items-center gap-2">
            <!-- Preset button for Libre -->
            <button
              type="button"
              :class="
                localTheme.category === 'Libre'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              "
              class="text-xs px-2.5 py-1 rounded border font-medium transition-colors shrink-0"
              @click="
                localTheme.category = 'Libre';
                updateTheme();
              "
            >
              Libre
            </button>

            <!-- Custom category input -->
            <Input
              v-model="localTheme.category"
              placeholder="Catégorie personnalisée..."
              class="text-sm h-8 flex-1"
              :class="
                localTheme.category === 'Libre'
                  ? 'border-green-300 bg-green-50/30'
                  : ''
              "
              @blur="updateTheme"
            />
          </div>
        </div>

        <!-- Participation Field -->
        <div>
          <Label class="text-xs text-gray-500 mb-1 block">Participation</Label>
          <Input
            v-model="localTheme.participation"
            placeholder="2 / équipe"
            class="text-sm h-8"
            @blur="updateTheme"
          />
        </div>
      </div>

      <!-- Row 2: Duration (full width) -->
      <div>
        <Label class="text-xs text-gray-500 mb-1.5 block">Durée</Label>

        <!-- Duration Type Selector (Radio buttons) -->
        <div class="flex items-center gap-4 mb-2">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              :checked="localTheme.duration.type === 'fixed'"
              class="w-3.5 h-3.5 text-blue-600"
              @change="toggleDurationType(false)"
            />
            <span class="text-xs text-gray-600">Fixe</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              :checked="localTheme.duration.type === 'special'"
              class="w-3.5 h-3.5 text-blue-600"
              @change="toggleDurationType(true)"
            />
            <span class="text-xs text-gray-600">Spéciale</span>
          </label>
        </div>

        <!-- Numeric Duration Input (fixed) -->
        <div
          v-if="localTheme.duration.type === 'fixed'"
          class="flex items-center gap-2"
        >
          <Input
            v-model="durationMinutes"
            type="number"
            min="0"
            max="60"
            placeholder="3"
            class="text-sm w-16 h-8 text-center"
            @blur="updateDurationFromInputs"
          />
          <span class="text-gray-400 text-sm">:</span>
          <Input
            v-model="durationSeconds"
            type="number"
            min="0"
            max="59"
            placeholder="00"
            class="text-sm w-16 h-8 text-center"
            @blur="formatSeconds"
          />
        </div>

        <!-- Free Text Duration Input (special) -->
        <div v-else>
          <Input
            v-model="localTheme.duration.value"
            placeholder="jusqu'à la fin du spectacle"
            class="text-sm h-8"
            @blur="updateTheme"
          />
        </div>
      </div>
    </div>
  </Card>
</template>
