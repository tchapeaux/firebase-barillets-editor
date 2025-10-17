<script setup lang="ts">
import type { Theme } from '../types/barillet';
import Card from '@/components/ui/card.vue';
import Label from '@/components/ui/label.vue';

interface Props {
  theme: Theme;
  themeNumber: number;
}

defineProps<Props>();
</script>

<template>
  <Card class="overflow-hidden">
    <!-- Header with Title and Type -->
    <div class="bg-gray-50 px-3 py-2 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <!-- Type Badge -->
        <span
          :class="
            theme.type === 'Mixte'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          "
          class="text-xs px-2 py-1 rounded font-medium shrink-0"
        >
          {{ theme.type }}
        </span>

        <!-- Title or Theme Number -->
        <div class="flex-1">
          <span v-if="theme.title" class="text-sm font-medium">
            {{ theme.title }}
          </span>
          <span v-else class="text-sm text-gray-500 italic">
            Thème {{ themeNumber }}
          </span>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="px-3 py-3 bg-white space-y-3">
      <!-- Row 1: Category and Participation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Participation Field -->
        <div>
          <Label class="text-xs text-gray-500 mb-1 block">Participation</Label>
          <div
            class="text-sm px-3 py-2 bg-gray-50 rounded border border-gray-200"
          >
            {{ theme.participation }}
          </div>
        </div>

        <!-- Category Field -->
        <div>
          <Label class="text-xs text-gray-500 mb-1 block">Catégorie</Label>
          <div
            :class="
              theme.category !== 'Libre'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200'
            "
            class="text-sm px-3 py-2 rounded border font-medium"
          >
            {{ theme.category }}
          </div>
        </div>
      </div>

      <!-- Row 2: Duration and Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Duration Field -->
        <div>
          <Label class="text-xs text-gray-500 mb-1 block">Durée</Label>
          <div class="flex items-center gap-2">
            <span
              :class="
                theme.duration.type === 'special'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-gray-50 border-gray-200'
              "
              class="text-sm px-3 py-2 rounded border flex-1"
            >
              {{ theme.duration.value }}
            </span>
          </div>
        </div>

        <!-- Notes Field -->
        <div v-if="theme.notes">
          <Label class="text-xs text-gray-500 mb-1 block">Notes</Label>
          <div
            class="text-sm px-3 py-2 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap"
          >
            {{ theme.notes }}
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
