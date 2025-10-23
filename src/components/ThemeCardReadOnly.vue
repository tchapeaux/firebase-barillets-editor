<script setup lang="ts">
import { computed } from 'vue';
import type { Theme } from '../types/barillet';
import Card from '@/components/ui/card.vue';
import Label from '@/components/ui/label.vue';
import Tooltip from '@/components/ui/tooltip.vue';
import { Info } from 'lucide-vue-next';
import { useCategories } from '@/composables/useCategories';

interface Props {
  theme: Theme;
  themeNumber: number;
}

const props = defineProps<Props>();

const { getCategoryByName } = useCategories();

// Get the category description if it exists
const categoryDescription = computed(() => {
  if (!props.theme.category) return null;
  const category = getCategoryByName(props.theme.category);
  return category?.description;
});
</script>

<template>
  <Card class="overflow-hidden @container">
    <!-- Header with Title and Type -->
    <div class="bg-muted px-3 py-2 border-b border-muted">
      <div class="flex items-center gap-2">
        <!-- Type Badge -->
        <span
          :class="
            theme.type === 'Mixte'
              ? 'bg-type-mixte text-type-mixte-foreground'
              : 'bg-type-comparee text-type-comparee-foreground'
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
          <span v-else class="text-sm text-muted-foreground italic">
            Thème {{ themeNumber }}
          </span>
        </div>
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
          <div class="text-sm px-3 py-2 bg-muted rounded border border-muted">
            {{ theme.participation }}
          </div>
        </div>

        <!-- Category Field -->
        <div>
          <Label class="text-xs text-muted-foreground mb-1 block"
            >Catégorie</Label
          >
          <div
            :class="
              theme.category !== 'Libre'
                ? 'bg-highlight-bg border-highlight text-success'
                : 'bg-muted border-muted'
            "
            class="text-sm px-3 py-2 rounded border font-medium flex items-center gap-2"
          >
            <span class="flex-1">{{ theme.category }}</span>

            <!-- Info icon with tooltip for category description -->
            <Tooltip
              v-if="categoryDescription"
              :delay-duration="300"
              side="top"
            >
              <template #trigger>
                <button
                  type="button"
                  class="shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 rounded"
                  aria-label="Afficher la description de la catégorie"
                >
                  <Info class="w-4 h-4 opacity-70 hover:opacity-100" />
                </button>
              </template>
              <div class="max-w-sm text-xs leading-relaxed">
                {{ categoryDescription }}
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Row 2: Duration and Notes -->
      <div class="grid grid-cols-1 @lg:grid-cols-2 gap-3">
        <!-- Duration Field -->
        <div>
          <Label class="text-xs text-muted-foreground mb-1 block">Durée</Label>
          <div class="flex items-center gap-2">
            <span
              :class="
                theme.duration.type === 'special'
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-muted border-muted'
              "
              class="text-sm px-3 py-2 rounded border flex-1"
            >
              {{ theme.duration.value }}
            </span>
          </div>
        </div>

        <!-- Notes Field -->
        <div v-if="theme.notes">
          <Label class="text-xs text-muted-foreground mb-1 block">Notes</Label>
          <div
            class="text-sm px-3 py-2 bg-muted rounded border border-muted whitespace-pre-wrap"
          >
            {{ theme.notes }}
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
