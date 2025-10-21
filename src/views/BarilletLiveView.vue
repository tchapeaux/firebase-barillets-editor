<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useBarilletById } from '../composables/useBarilletById';
import type { Theme } from '../types/barillet';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  SkipForward,
} from 'lucide-vue-next';
import Button from '../components/ui/button.vue';
import Card from '../components/ui/card.vue';
import CardContent from '../components/ui/cardContent.vue';
import ThemeCardReadOnly from '../components/ThemeCardReadOnly.vue';

const route = useRoute();
const router = useRouter();
const { user } = useAuth();

const barilletId = computed(() => route.params.id as string);
const { barillet, loading, error } = useBarilletById(barilletId, user);

// State management
const remainingThemes = ref<Theme[]>([]);
const discardedThemes = ref<Theme[]>([]);
const currentTheme = ref<Theme | null>(null);
const isInitialized = ref(false);

// Initialize the stack
const initializeStack = () => {
  if (barillet.value?.themes && !isInitialized.value) {
    remainingThemes.value = [...barillet.value.themes];
    discardedThemes.value = [];
    isInitialized.value = true;
    drawNextTheme();
  }
};

// Watch for barillet changes and initialize
watch(
  barillet,
  (newBarillet) => {
    if (newBarillet && !isInitialized.value) {
      initializeStack();
    }
  },
  { immediate: true }
);

// Computed statistics
const totalThemes = computed(() => {
  return barillet.value?.themes.length || 0;
});

const remainingCount = computed(() => remainingThemes.value.length);

// Get the current theme number (position in original barillet themes)
const currentThemeNumber = computed(() => {
  if (!currentTheme.value || !barillet.value) return 0;
  const index = barillet.value.themes.findIndex(
    (t) => t === currentTheme.value
  );
  return index !== -1 ? index + 1 : 0;
});

const discardedStats = computed(() => {
  const total = discardedThemes.value.length;
  if (total === 0) return null;

  // Count Mixte vs Comparée
  const mixteCount = discardedThemes.value.filter(
    (t) => t.type === 'Mixte'
  ).length;
  const compareeCount = total - mixteCount;

  // Count Libre vs other categories
  const libreCount = discardedThemes.value.filter(
    (t) => t.category === 'Libre'
  ).length;
  const otherCategoriesCount = total - libreCount;

  return {
    total,
    mixteCount,
    compareeCount,
    libreCount,
    otherCategoriesCount,
  };
});

// Get random theme from remaining stack
const getRandomTheme = (): Theme | null => {
  if (remainingThemes.value.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * remainingThemes.value.length);
  return remainingThemes.value[randomIndex];
};

// Draw next theme
const drawNextTheme = () => {
  currentTheme.value = getRandomTheme();
};

// Action: Remove theme from stack
const retirerTheme = () => {
  if (!currentTheme.value) return;

  // Move theme from remaining to discarded
  const index = remainingThemes.value.findIndex(
    (t) => t === currentTheme.value
  );
  if (index !== -1) {
    remainingThemes.value.splice(index, 1);
    discardedThemes.value.push(currentTheme.value);
  }

  // Draw next theme
  drawNextTheme();
};

// Action: Skip theme (keep in stack)
const passerTheme = () => {
  // Just draw a different theme, keeping current in the stack
  drawNextTheme();
};

// Navigation
const goBack = () => {
  router.push({ name: 'home' });
};

// Reset the live session
const recommencer = () => {
  isInitialized.value = false;
  initializeStack();
};
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <!-- Header -->
    <div class="bg-card border-b border-border sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <Button variant="ghost" size="sm" class="gap-2" @click="goBack">
            <ArrowLeft class="h-4 w-4" />
            <span class="hidden sm:inline">Retour</span>
          </Button>
          <h1 class="text-lg sm:text-xl font-bold">Mode Live</h1>
          <div class="w-20"></div>
          <!-- Spacer for centering -->
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <Loader2
          class="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4"
        />
        <p class="text-muted-foreground">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex items-center justify-center min-h-[60vh]"
    >
      <div class="text-center max-w-md px-4">
        <AlertCircle class="h-12 w-12 text-destructive mx-auto mb-4" />
        <p class="text-destructive mb-4">{{ error }}</p>
        <Button @click="goBack">Retour</Button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="barillet" class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <!-- Barillet Info -->
      <div class="mb-6">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">
          {{ barillet.title }}
        </h2>
        <div class="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span v-if="barillet.date">{{
            new Date(barillet.date).toLocaleDateString('fr-FR')
          }}</span>
          <span v-if="barillet.location && barillet.date">•</span>
          <span v-if="barillet.location">{{ barillet.location }}</span>
        </div>
      </div>

      <!-- Current Theme Card (or Empty State) -->
      <div v-if="currentTheme">
        <!-- Theme Display -->
        <div class="mb-6">
          <ThemeCardReadOnly
            :theme="currentTheme"
            :theme-number="currentThemeNumber"
          />
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            size="lg"
            class="h-16 sm:h-20 text-lg sm:text-xl font-bold"
            @click="passerTheme"
          >
            <SkipForward class="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
            Passer
          </Button>
          <Button
            variant="default"
            size="lg"
            class="h-16 sm:h-20 text-lg sm:text-xl font-bold"
            @click="retirerTheme"
          >
            <X class="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
            Retirer
          </Button>
        </div>

        <!-- Statistics Card -->
        <Card class="mb-6">
          <CardContent class="pt-6 pb-6">
            <!-- Remaining Count -->
            <div class="text-center mb-6 pb-6 border-b border-border">
              <div
                class="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold"
              >
                Restants
              </div>
              <div class="text-5xl sm:text-6xl font-bold text-primary mb-1">
                {{ remainingCount }}
              </div>
              <div class="text-sm text-muted-foreground">
                Thème{{ remainingCount > 1 ? 's' : '' }}
              </div>
            </div>

            <!-- Discarded Stats -->
            <div v-if="discardedStats" class="space-y-4">
              <div class="text-center">
                <div
                  class="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-semibold"
                >
                  Retirés
                </div>
              </div>

              <!-- Nature -->
              <div class="text-center">
                <div class="text-xs text-muted-foreground mb-2">Nature</div>
                <div class="text-lg">
                  <span class="font-semibold">{{
                    discardedStats.mixteCount
                  }}</span>
                  <span class="text-muted-foreground mx-2"
                    >Mixte{{ discardedStats.mixteCount > 1 ? 's' : '' }}</span
                  >
                  <span class="text-muted-foreground mx-1">-</span>
                  <span class="font-semibold">{{
                    discardedStats.compareeCount
                  }}</span>
                  <span class="text-muted-foreground mx-2"
                    >Comparée{{
                      discardedStats.compareeCount > 1 ? 's' : ''
                    }}</span
                  >
                </div>
              </div>

              <!-- Categories -->
              <div class="text-center">
                <div class="text-xs text-muted-foreground mb-2">Catégories</div>
                <div class="text-lg">
                  <span class="font-semibold">{{
                    discardedStats.libreCount
                  }}</span>
                  <span class="text-muted-foreground mx-2"
                    >Libre{{ discardedStats.libreCount > 1 ? 's' : '' }}</span
                  >
                  <span class="text-muted-foreground mx-1">-</span>
                  <span class="font-semibold">{{
                    discardedStats.otherCategoriesCount
                  }}</span>
                  <span class="text-muted-foreground mx-2"
                    >Autre{{
                      discardedStats.otherCategoriesCount > 1 ? 's' : ''
                    }}</span
                  >
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Card class="max-w-md mx-auto">
          <CardContent class="pt-12 pb-12">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-2xl font-bold mb-2">Le barillet est vide</h3>
            <p class="text-muted-foreground mb-6">
              Tous les thèmes ont été retirés du barillet.
            </p>
            <div class="flex flex-col gap-3">
              <Button size="lg" class="w-full" @click="recommencer">
                Recommencer
              </Button>
              <Button
                size="lg"
                variant="outline"
                class="w-full"
                @click="goBack"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Progress Indicator (Mobile) -->
      <div class="mt-6 sm:hidden">
        <div class="bg-muted rounded-full h-2 overflow-hidden">
          <div
            class="bg-primary h-full transition-all duration-300"
            :style="{
              width: `${((totalThemes - remainingCount) / totalThemes) * 100}%`,
            }"
          ></div>
        </div>
        <div class="text-center text-sm text-muted-foreground mt-2">
          {{ totalThemes - remainingCount }} / {{ totalThemes }} traités
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles if needed */
</style>
