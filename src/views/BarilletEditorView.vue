<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDebounceFn, watchDeep } from '@vueuse/core';
import { useAuth } from '../composables/useAuth';
import { useBarilletById } from '../composables/useBarilletById';
import { updateBarillet } from '../services/barillet';
import { validateBarillet } from '../types/barillet';
import ThemeList from '../components/ThemeList.vue';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import Alert from '@/components/ui/alert.vue';
import Card from '@/components/ui/card.vue';
import Tooltip from '@/components/ui/tooltip.vue';
import {
  Loader2,
  AlertCircle,
  Share2,
  Check,
  ArrowLeft,
} from 'lucide-vue-next';
import type { Barillet, Theme } from '../types/barillet';

const route = useRoute();
const router = useRouter();
const { user } = useAuth();

const barilletId = computed(() => route.params.id as string);

// Fetch barillet data
const { barillet, loading, error, isOwner } = useBarilletById(barilletId, user);

// State
const localBarillet = ref<Barillet | null>(null);
const syncStatus = ref<'synced' | 'saving' | 'error'>('synced');
const saveError = ref<string | null>(null);
const validationErrors = ref<string[]>([]);
const linkCopied = ref(false);
const isInitialLoad = ref(true);

/**
 * Deep clone a barillet while preserving Date objects
 * JSON.parse(JSON.stringify()) converts Dates to strings, so we need to restore them
 */
const cloneBarillet = (barillet: Barillet): Barillet => {
  const cloned = JSON.parse(JSON.stringify(barillet));
  // Restore Date objects after JSON serialization
  cloned.date = barillet.date ? new Date(barillet.date) : null;
  cloned.createdAt = barillet.createdAt ? new Date(barillet.createdAt) : null;
  cloned.updatedAt = barillet.updatedAt ? new Date(barillet.updatedAt) : null;
  return cloned;
};

// Load barillet when data is available
watch(
  barillet,
  (newBarillet) => {
    if (newBarillet && !localBarillet.value) {
      localBarillet.value = cloneBarillet(newBarillet);
      // Store initial state as last saved
      lastSavedState.value = JSON.stringify(localBarillet.value);
      // Mark initial load as complete after next tick
      setTimeout(() => {
        isInitialLoad.value = false;
      }, 0);
    }
  },
  { immediate: true }
);

// Check if barillet exists
const barilletNotFound = computed(() => {
  return !loading.value && !barillet.value;
});

// Check if user can edit (must be owner)
const canEdit = computed(() => isOwner.value);

// Handle theme updates
const handleThemesUpdate = (updatedThemes: Theme[]) => {
  if (localBarillet.value) {
    localBarillet.value.themes = updatedThemes;
  }
};

// Computed property for date input (converts Date to/from string)
const dateInputValue = computed({
  get: () => {
    if (!localBarillet.value?.date) return '';
    return localBarillet.value.date.toISOString().split('T')[0];
  },
  set: (value: string) => {
    if (localBarillet.value) {
      localBarillet.value.date = value ? new Date(value) : null;
    }
  },
});

// Auto-save function
const performAutoSave = async () => {
  if (!localBarillet.value || !localBarillet.value.id) return;

  // Check ownership before saving
  if (!canEdit.value) {
    syncStatus.value = 'error';
    saveError.value = "Vous n'avez pas la permission de modifier ce barillet.";
    return;
  }

  // Validate before saving
  const validationResult = validateBarillet(localBarillet.value);
  if (!validationResult.valid) {
    validationErrors.value = validationResult.errors;
    syncStatus.value = 'error';
    saveError.value = 'Validation échouée';
    return;
  }

  syncStatus.value = 'saving';
  saveError.value = null;
  validationErrors.value = [];

  try {
    const result = await updateBarillet(localBarillet.value.id, {
      title: localBarillet.value.title,
      location: localBarillet.value.location,
      date: localBarillet.value.date,
      themes: localBarillet.value.themes,
    });

    if (!result.success) {
      syncStatus.value = 'error';
      saveError.value = result.error || "Erreur lors de l'enregistrement.";
      return;
    }

    syncStatus.value = 'synced';
    // Update last saved state after successful save
    lastSavedState.value = JSON.stringify(localBarillet.value);
  } catch (err) {
    console.error('Error saving barillet:', err);
    syncStatus.value = 'error';
    saveError.value = "Erreur lors de l'enregistrement. Veuillez réessayer.";
  }
};

// Debounced auto-save (1.5 seconds)
const debouncedAutoSave = useDebounceFn(performAutoSave, 1500);

// Retry save after error
const retrySave = () => {
  performAutoSave();
};

// Go back to home
const goBack = () => {
  router.push({ name: 'home' });
};

// Copy share link to clipboard
const copyShareLink = async () => {
  if (!barilletId.value) return;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/barillet/${barilletId.value}/view`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy link:', err);
    alert('Impossible de copier le lien');
  }
};

// Track last saved state to detect actual changes
const lastSavedState = ref<string>('');

// Set up auto-save watcher
watchDeep(localBarillet, (newValue) => {
  if (newValue && newValue.id && !isInitialLoad.value) {
    // Compare with last saved state to avoid unnecessary saves
    const currentState = JSON.stringify(newValue);
    if (currentState === lastSavedState.value) {
      // No actual changes, don't trigger save
      return;
    }

    // Set status to saving immediately to show user feedback
    syncStatus.value = 'saving';
    // Trigger debounced auto-save
    debouncedAutoSave();
  }
});
</script>

<template>
  <div class="min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-muted/30">
    <!-- Loading state -->
    <Card v-if="loading" class="max-w-2xl mx-auto p-12 text-center">
      <Loader2 class="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
      <p class="text-muted-foreground">Chargement du barillet...</p>
    </Card>

    <!-- Error state -->
    <Card
      v-else-if="error"
      class="max-w-2xl mx-auto p-8 text-center border-destructive"
    >
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <p class="text-destructive mb-4">Erreur: {{ error }}</p>
      <Button variant="outline" @click="goBack">Retour à la liste</Button>
    </Card>

    <!-- Not found state -->
    <Card
      v-else-if="barilletNotFound"
      class="max-w-2xl mx-auto p-8 text-center border-destructive"
    >
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h2 class="text-xl font-semibold mb-2">Barillet introuvable</h2>
      <p class="text-muted-foreground mb-6">
        Le barillet demandé n'existe pas ou a été supprimé.
      </p>
      <Button variant="outline" @click="goBack">Retour à la liste</Button>
    </Card>

    <!-- Non-owner trying to edit -->
    <Card
      v-else-if="!canEdit"
      class="max-w-2xl mx-auto p-8 text-center border-destructive"
    >
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h2 class="text-xl font-semibold mb-2">Accès non autorisé</h2>
      <p class="text-muted-foreground mb-6">
        Vous n'avez pas la permission de modifier ce barillet. Seul le
        propriétaire peut le modifier.
      </p>
      <Button variant="outline" @click="goBack">Retour à la liste</Button>
    </Card>

    <!-- Editor content -->
    <div v-else-if="localBarillet" class="max-w-7xl mx-auto">
      <Button class="mb-2" variant="outline" @click="goBack">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Retour
      </Button>

      <!-- Header -->
      <Card class="p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">Éditer le barillet</h1>
          </div>
          <div class="flex items-center gap-4">
            <!-- Sync Status Indicator -->
            <div class="flex items-center gap-2">
              <Check
                v-if="syncStatus === 'synced'"
                class="h-4 w-4 text-success"
              />
              <Loader2
                v-else-if="syncStatus === 'saving'"
                class="h-4 w-4 animate-spin text-info"
              />
              <AlertCircle
                v-else-if="syncStatus === 'error'"
                class="h-4 w-4 text-destructive"
              />
              <span
                :class="{
                  'text-success': syncStatus === 'synced',
                  'text-info': syncStatus === 'saving',
                  'text-destructive': syncStatus === 'error',
                }"
                class="text-sm font-medium"
              >
                {{
                  syncStatus === 'synced'
                    ? 'Synchronisé'
                    : syncStatus === 'saving'
                      ? 'Synchronisation...'
                      : 'Erreur'
                }}
              </span>
              <Button
                v-if="syncStatus === 'error'"
                variant="ghost"
                size="sm"
                @click="retrySave"
              >
                Réessayer
              </Button>
            </div>
            <!-- Share Button -->
            <Tooltip>
              <template #trigger>
                <Button variant="outline" @click="copyShareLink">
                  <Check v-if="linkCopied" class="mr-2 h-4 w-4" />
                  <Share2 v-else class="mr-2 h-4 w-4" />
                  {{ linkCopied ? 'Lien copié !' : 'Partager' }}
                </Button>
              </template>
              Générer un lien public pour partager ce barillet en lecture seule
            </Tooltip>
          </div>
        </div>

        <!-- Metadata form -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>Titre</Label>
            <Input
              v-model="localBarillet.title"
              placeholder="Titre du barillet"
            />
          </div>
          <div class="space-y-2">
            <Label>Lieu</Label>
            <Input v-model="localBarillet.location" placeholder="Lieu" />
          </div>
          <div class="space-y-2">
            <Label>Date</Label>
            <Input v-model="dateInputValue" type="date" />
          </div>
        </div>
      </Card>

      <!-- Status messages -->
      <Alert v-if="saveError" variant="destructive" class="mb-6">
        {{ saveError }}
      </Alert>

      <Alert
        v-if="validationErrors.length > 0"
        variant="destructive"
        class="mb-6"
      >
        <strong>Erreurs de validation :</strong>
        <ul class="mt-2 ml-5 list-disc">
          <li v-for="(validationError, index) in validationErrors" :key="index">
            {{ validationError }}
          </li>
        </ul>
      </Alert>

      <!-- Theme list -->
      <ThemeList :themes="localBarillet.themes" @update="handleThemesUpdate" />
    </div>
  </div>
</template>
