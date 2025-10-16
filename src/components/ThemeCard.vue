<script setup lang="ts">
import { ref, watch } from "vue";
import type { Theme } from "../types/barillet";
import Card from '@/components/ui/card.vue';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import Checkbox from '@/components/ui/checkbox.vue';
import Badge from '@/components/ui/badge.vue';

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
const noTitle = ref(props.theme.title === null);

const toggleTitle = () => {
  if (noTitle.value) {
    localTheme.value.title = null;
    updateTheme();
  } else {
    localTheme.value.title = "";
    updateTheme();
  }
};

watch(noTitle, toggleTitle);
</script>

<template>
  <Card class="p-5 hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex justify-between items-center pb-3 mb-4 border-b">
      <h3 class="text-lg font-semibold">Thème {{ themeNumber }}</h3>
      <div class="flex gap-2">
        <Badge :class="localTheme.type === 'Mixte' ? 'bg-blue-600' : 'bg-purple-600'">
          {{ localTheme.type }}
        </Badge>
      </div>
    </div>

    <!-- Type Selection (Radio buttons styled as toggle) -->
    <div class="flex gap-3 mb-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          :value="'Mixte'"
          v-model="localTheme.type"
          @change="updateTheme"
          class="w-4 h-4 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-sm">Mixte</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          :value="'Comparée'"
          v-model="localTheme.type"
          @change="updateTheme"
          class="w-4 h-4 text-purple-600 focus:ring-purple-500"
        />
        <span class="text-sm">Comparée</span>
      </label>
    </div>

    <!-- Title Field -->
    <div class="space-y-2 mb-4">
      <div class="flex items-center gap-2">
        <Checkbox :checked="noTitle" @update:checked="noTitle = $event" id="no-title" />
        <Label for="no-title" class="cursor-pointer">Pas de titre</Label>
      </div>
      <Input
        v-if="!noTitle"
        v-model="localTheme.title!"
        @blur="updateTheme"
        placeholder="Titre du thème"
      />
    </div>

    <!-- Participation Field -->
    <div class="space-y-2 mb-4">
      <Label>Participation</Label>
      <Input
        v-model="localTheme.participation"
        @blur="updateTheme"
        placeholder="Participation"
      />
    </div>

    <!-- Category Field -->
    <div class="space-y-2 mb-4">
      <Label>Catégorie</Label>
      <Input
        v-model="localTheme.category"
        @blur="updateTheme"
        placeholder="Libre"
      />
    </div>

    <!-- Duration Field -->
    <div class="space-y-2">
      <Label>Durée</Label>
      <Input
        v-model="localTheme.duration.value"
        @blur="updateTheme"
        placeholder="3:00 ou 2 fois 3:00"
      />
      <div class="flex gap-4 mt-2">
        <label class="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            :checked="localTheme.duration.type === 'special'"
            @update:checked="localTheme.duration.type = $event ? 'special' : 'fixed'; updateTheme()"
          />
          Spéciale
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            :checked="localTheme.duration.maximum"
            @update:checked="localTheme.duration.maximum = $event; updateTheme()"
          />
          Maximum
        </label>
      </div>
    </div>
  </Card>
</template>
