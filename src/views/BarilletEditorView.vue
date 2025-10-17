<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useBarillets } from '../composables/useBarillets';
import { validateBarillet } from '../types/barillet';
import ThemeList from '../components/ThemeList.vue';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import Alert from '@/components/ui/alert.vue';
import Card from '@/components/ui/card.vue';
import { Loader2, AlertCircle, Share2, Check } from 'lucide-vue-next';
import type { Barillet, Theme } from '../types/barillet';

const route = useRoute();
const router = useRouter();
const { user } = useAuth();
const {
  barillets,
  loading: barilletsLoading,
  error: barilletsError,
  updateBarillet,
} = useBarillets(user);

const barilletId = route.params.id as string;

// State
const barillet = ref<Barillet | null>(null);
const localBarillet = ref<Barillet | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);
const validationErrors = ref<string[]>([]);
const hasUnsavedChanges = ref(false);
const linkCopied = ref(false);

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
  barillets,
  (newBarillets) => {
    if (newBarillets.length > 0 && !barillet.value) {
      const foundBarillet = newBarillets.find((b) => b.id === barilletId);
      if (foundBarillet) {
        barillet.value = foundBarillet;
        localBarillet.value = cloneBarillet(foundBarillet);
      }
    }
  },
  { immediate: true }
);

// Check if barillet exists
const barilletNotFound = computed(() => {
  return !barilletsLoading.value && !barillet.value;
});

// Handle theme updates
const handleThemesUpdate = (updatedThemes: Theme[]) => {
  if (localBarillet.value) {
    localBarillet.value.themes = updatedThemes;
    hasUnsavedChanges.value = true;
    saveSuccess.value = false;
    validationErrors.value = [];
  }
};

// Handle metadata updates
const updateMetadata = () => {
  hasUnsavedChanges.value = true;
  saveSuccess.value = false;
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
      updateMetadata();
    }
  },
});

// Save changes
const saveChanges = async () => {
  if (!localBarillet.value || !localBarillet.value.id) return;

  // Validate before saving
  const validationResult = validateBarillet(localBarillet.value);
  if (!validationResult.valid) {
    validationErrors.value = validationResult.errors;
    return;
  }

  saving.value = true;
  saveError.value = null;
  saveSuccess.value = false;
  validationErrors.value = [];

  try {
    await updateBarillet(localBarillet.value.id, localBarillet.value);
    hasUnsavedChanges.value = false;
    saveSuccess.value = true;
    barillet.value = cloneBarillet(localBarillet.value);
    router.push({ name: 'home' });
  } catch (err) {
    console.error('Error saving barillet:', err);
    saveError.value = "Erreur lors de l'enregistrement. Veuillez réessayer.";
  } finally {
    saving.value = false;
  }
};

// Cancel and go back
const cancel = () => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm(
      'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?'
    );
    if (!confirmed) return;
  }
  router.push({ name: 'home' });
};

// Copy share link to clipboard
const copyShareLink = async () => {
  if (!barilletId) return;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/barillet/${barilletId}/view`;

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

// Warn before leaving with unsaved changes
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
  <div class="min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-muted/30">
    <!-- Loading state -->
    <Card v-if="barilletsLoading" class="max-w-2xl mx-auto p-12 text-center">
      <Loader2 class="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
      <p class="text-muted-foreground">Chargement du barillet...</p>
    </Card>

    <!-- Error state -->
    <Card
      v-else-if="barilletsError"
      class="max-w-2xl mx-auto p-8 text-center border-destructive"
    >
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <p class="text-destructive mb-4">Erreur: {{ barilletsError }}</p>
      <Button variant="outline" @click="cancel">Retour à la liste</Button>
    </Card>

    <!-- Not found state -->
    <Card
      v-else-if="barilletNotFound"
      class="max-w-2xl mx-auto p-8 text-center border-destructive"
    >
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h2 class="text-xl font-semibold mb-2">Barillet introuvable</h2>
      <p class="text-muted-foreground mb-6">
        Le barillet demandé n'existe pas ou vous n'avez pas l'autorisation d'y
        accéder.
      </p>
      <Button variant="outline" @click="cancel">Retour à la liste</Button>
    </Card>

    <!-- Editor content -->
    <div v-else-if="localBarillet" class="max-w-7xl mx-auto">
      <!-- Header -->
      <Card class="p-6 mb-6">
        <h1 class="text-2xl font-bold mb-6">Éditer le barillet</h1>

        <!-- Metadata form -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="space-y-2">
            <Label>Titre</Label>
            <Input
              v-model="localBarillet.title"
              placeholder="Titre du barillet"
              @input="updateMetadata"
            />
          </div>
          <div class="space-y-2">
            <Label>Lieu</Label>
            <Input
              v-model="localBarillet.location"
              placeholder="Lieu"
              @input="updateMetadata"
            />
          </div>
          <div class="space-y-2">
            <Label>Date</Label>
            <Input v-model="dateInputValue" type="date" />
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-3">
          <Button variant="outline" :disabled="saving" @click="copyShareLink">
            <Check v-if="linkCopied" class="mr-2 h-4 w-4" />
            <Share2 v-else class="mr-2 h-4 w-4" />
            {{ linkCopied ? 'Lien copié !' : 'Partager' }}
          </Button>
          <Button variant="outline" :disabled="saving" @click="cancel">
            Annuler
          </Button>
          <Button :disabled="saving" @click="saveChanges">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </div>
      </Card>

      <!-- Status messages -->
      <Alert
        v-if="saveSuccess"
        class="mb-6 bg-green-50 border-green-200 text-green-800"
      >
        ✓ Modifications enregistrées avec succès !
      </Alert>

      <Alert v-if="saveError" variant="destructive" class="mb-6">
        {{ saveError }}
      </Alert>

      <Alert
        v-if="validationErrors.length > 0"
        class="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800"
      >
        <strong>Erreurs de validation :</strong>
        <ul class="mt-2 ml-5 list-disc">
          <li v-for="(error, index) in validationErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </Alert>

      <Alert
        v-if="hasUnsavedChanges && !saveSuccess"
        class="mb-6 bg-blue-50 border-blue-200 text-blue-800"
      >
        ⚠️ Vous avez des modifications non enregistrées
      </Alert>

      <!-- Theme list -->
      <ThemeList :themes="localBarillet.themes" @update="handleThemesUpdate" />
    </div>
  </div>
</template>
