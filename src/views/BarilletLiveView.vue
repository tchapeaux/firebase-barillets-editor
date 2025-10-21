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
import CardHeader from '../components/ui/cardHeader.vue';
import CardTitle from '../components/ui/cardTitle.vue';
import Badge from '../components/ui/badge.vue';

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

const discardedStats = computed(() => {
  const total = discardedThemes.value.length;
  if (total === 0) return null;

  // Count Mixte vs Catégorie
  const mixteCount = discardedThemes.value.filter(
    (t) => t.type === 'Mixte'
  ).length;
  const categorieCount = total - mixteCount;

  // Count Libre vs other categories
  const libreCount = discardedThemes.value.filter(
    (t) => t.category === 'Libre'
  ).length;
  const otherCategoriesCount = total - libreCount;

  return {
    total,
    mixtePercentage: Math.round((mixteCount / total) * 100),
    categoriePercentage: Math.round((categorieCount / total) * 100),
    librePercentage: Math.round((libreCount / total) * 100),
    otherCategoriesPercentage: Math.round((otherCategoriesCount / total) * 100),
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
    >
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <Button variant="ghost" size="sm" class="gap-2" @click="goBack">
            <ArrowLeft class="h-4 w-4" />
            <span class="hidden sm:inline">Retour</span>
          </Button>
          <h1
            class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white"
          >
            Mode Live
          </h1>
          <div class="w-20"></div>
          <!-- Spacer for centering -->
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <Loader2 class="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex items-center justify-center min-h-[60vh]"
    >
      <div class="text-center max-w-md px-4">
        <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
        <Button @click="goBack">Retour</Button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="barillet" class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <!-- Barillet Info -->
      <div class="mb-6">
        <h2
          class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {{ barillet.title }}
        </h2>
        <div
          class="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <span v-if="barillet.date">{{
            new Date(barillet.date).toLocaleDateString('fr-FR')
          }}</span>
          <span v-if="barillet.location && barillet.date">•</span>
          <span v-if="barillet.location">{{ barillet.location }}</span>
        </div>
      </div>

      <!-- Statistics Bar -->
      <Card
        class="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
      >
        <CardContent class="pt-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Remaining Count -->
            <div class="text-center">
              <div
                class="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400"
              >
                {{ remainingCount }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Thème{{ remainingCount > 1 ? 's' : '' }} restant{{
                  remainingCount > 1 ? 's' : ''
                }}
              </div>
            </div>

            <!-- Discarded Stats: Mixte vs Catégorie -->
            <div
              v-if="discardedStats"
              class="text-center border-t sm:border-t-0 sm:border-l border-gray-300 dark:border-gray-700 pt-4 sm:pt-0"
            >
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Retirés ({{ discardedStats.total }})
              </div>
              <div class="flex items-center justify-center gap-2">
                <Badge variant="outline" class="bg-white dark:bg-gray-800">
                  Mixte {{ discardedStats.mixtePercentage }}%
                </Badge>
                <Badge variant="outline" class="bg-white dark:bg-gray-800">
                  Cat. {{ discardedStats.categoriePercentage }}%
                </Badge>
              </div>
            </div>

            <!-- Discarded Stats: Libre vs Others -->
            <div
              v-if="discardedStats"
              class="text-center border-t sm:border-t-0 sm:border-l border-gray-300 dark:border-gray-700 pt-4 sm:pt-0"
            >
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Catégories
              </div>
              <div class="flex items-center justify-center gap-2">
                <Badge variant="outline" class="bg-white dark:bg-gray-800">
                  Libre {{ discardedStats.librePercentage }}%
                </Badge>
                <Badge variant="outline" class="bg-white dark:bg-gray-800">
                  Autres {{ discardedStats.otherCategoriesPercentage }}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Current Theme Card (or Empty State) -->
      <div v-if="currentTheme" class="mb-6">
        <Card class="shadow-lg">
          <CardHeader
            class="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Badge
                    :class="
                      currentTheme.type === 'Mixte'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    "
                  >
                    {{ currentTheme.type }}
                  </Badge>
                  <Badge
                    variant="outline"
                    class="bg-white/20 text-white border-white/30"
                  >
                    {{ currentTheme.category }}
                  </Badge>
                </div>
                <CardTitle class="text-2xl sm:text-3xl text-white">
                  {{ currentTheme.title || 'Sans titre' }}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="space-y-4">
              <!-- Participation -->
              <div>
                <div
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Participation
                </div>
                <div class="text-gray-900 dark:text-white">
                  {{ currentTheme.participation }}
                </div>
              </div>

              <!-- Duration -->
              <div>
                <div
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Durée
                </div>
                <div class="text-gray-900 dark:text-white">
                  {{ currentTheme.duration.value }}
                  <Badge
                    v-if="currentTheme.duration.type === 'special'"
                    variant="outline"
                    class="ml-2"
                  >
                    Hors temps
                  </Badge>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="currentTheme.notes">
                <div
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Notes
                </div>
                <div class="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {{ currentTheme.notes }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <Button
            variant="outline"
            size="lg"
            class="h-16 sm:h-20 text-lg sm:text-xl font-bold border-2 border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-950/30"
            @click="retirerTheme"
          >
            <X class="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
            Retirer
          </Button>
          <Button
            variant="outline"
            size="lg"
            class="h-16 sm:h-20 text-lg sm:text-xl font-bold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-500 dark:hover:bg-blue-950/30"
            @click="passerTheme"
          >
            <SkipForward class="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
            Passer
          </Button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Card class="max-w-md mx-auto">
          <CardContent class="pt-12 pb-12">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Le barillet est vide
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Tous les thèmes ont été retirés du barillet.
            </p>
            <div v-if="discardedStats" class="mb-6 text-left">
              <div
                class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >
                Récapitulatif ({{ discardedStats.total }} thèmes retirés)
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Mixte</span>
                  <Badge>{{ discardedStats.mixtePercentage }}%</Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Catégorie</span
                  >
                  <Badge>{{ discardedStats.categoriePercentage }}%</Badge>
                </div>
                <div
                  class="flex justify-between items-center border-t pt-2 mt-2"
                >
                  <span class="text-gray-600 dark:text-gray-400">Libre</span>
                  <Badge>{{ discardedStats.librePercentage }}%</Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Autres catégories</span
                  >
                  <Badge>{{ discardedStats.otherCategoriesPercentage }}%</Badge>
                </div>
              </div>
            </div>
            <Button size="lg" class="w-full" @click="goBack">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Progress Indicator (Mobile) -->
      <div class="mt-6 sm:hidden">
        <div
          class="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
        >
          <div
            class="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
            :style="{
              width: `${((totalThemes - remainingCount) / totalThemes) * 100}%`,
            }"
          ></div>
        </div>
        <div class="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {{ totalThemes - remainingCount }} / {{ totalThemes }} traités
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles if needed */
</style>
