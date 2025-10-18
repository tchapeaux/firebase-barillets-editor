<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useBarilletById } from '../composables/useBarilletById';
import ThemeCardReadOnly from '../components/ThemeCardReadOnly.vue';
import Button from '@/components/ui/button.vue';
import Card from '@/components/ui/card.vue';
import Label from '@/components/ui/label.vue';
import Alert from '@/components/ui/alert.vue';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Edit,
  Loader2,
  Share2,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { user } = useAuth();

const barilletId = computed(() => route.params.id as string);

// Fetch barillet data
const { barillet, loading, error, isOwner } = useBarilletById(barilletId, user);

// State for copy link functionality
const linkCopied = ref(false);

// Check if barillet exists
const barilletNotFound = computed(() => {
  return !loading.value && !barillet.value;
});

// Format date for display
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Go back to home
const goBack = () => {
  router.push({ name: 'home' });
};

// Navigate to edit mode (only available for owner)
const goToEdit = () => {
  if (barillet.value?.id) {
    router.push({ name: 'barillet-edit', params: { id: barillet.value.id } });
  }
};

// Copy share link to clipboard
const copyShareLink = async () => {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy link:', err);
    alert('Impossible de copier le lien');
  }
};
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
    </Card>

    <!-- Viewer content -->
    <div v-else-if="barillet" class="max-w-7xl mx-auto">
      <Button class="mb-2" variant="outline" @click="goBack">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Retour
      </Button>

      <!-- Header -->
      <Card class="p-6 mb-6">
        <div
          class="flex flex-col sm:flex-row justify-between items-start gap-4"
        >
          <div class="flex-1">
            <h1 class="text-2xl font-bold mb-4">{{ barillet.title }}</h1>

            <!-- Metadata display -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="barillet.location" class="space-y-1">
                <Label class="text-xs text-muted-foreground uppercase"
                  >Lieu</Label
                >
                <p class="text-base">{{ barillet.location }}</p>
              </div>
              <div v-if="barillet.date" class="space-y-1">
                <Label class="text-xs text-muted-foreground uppercase"
                  >Date</Label
                >
                <p class="text-base">{{ formatDate(barillet.date) }}</p>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-col gap-2 sm:ml-4">
            <Button
              v-if="isOwner"
              variant="default"
              class="w-full sm:w-auto"
              @click="goToEdit"
            >
              <Edit class="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              class="w-full sm:w-auto"
              @click="copyShareLink"
            >
              <Check v-if="linkCopied" class="mr-2 h-4 w-4" />
              <Share2 v-else class="mr-2 h-4 w-4" />
              {{ linkCopied ? 'Lien copié !' : 'Partager' }}
            </Button>
          </div>
        </div>

        <!-- Owner notice -->
        <Alert v-if="isOwner" class="mt-4 bg-blue-50 border-blue-200">
          <p class="text-sm text-blue-800">
            Vous êtes le propriétaire de ce barillet. Vous pouvez le modifier en
            cliquant sur le bouton "Modifier".
          </p>
        </Alert>
      </Card>

      <!-- Theme list -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold mb-4">
          Thèmes ({{ barillet.themes.length }})
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          <ThemeCardReadOnly
            v-for="(theme, index) in barillet.themes"
            :key="index"
            :theme="theme"
            :theme-number="index + 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>
