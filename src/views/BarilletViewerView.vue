<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useBarilletById } from '../composables/useBarilletById';
import { useBarilletExport } from '../composables/useBarilletExport';
import ThemeCardReadOnly from '../components/ThemeCardReadOnly.vue';
import Button from '@/components/ui/button.vue';
import Card from '@/components/ui/card.vue';
import Label from '@/components/ui/label.vue';
import Alert from '@/components/ui/alert.vue';
import DropdownMenu from '@/components/ui/dropdownMenu.vue';
import DropdownMenuItem from '@/components/ui/dropdownMenuItem.vue';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Edit,
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  Share2,
  ChevronDown,
  Play,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { user } = useAuth();
const { exportToPdf, exportToJson, exportToCsv, exportToExcel } =
  useBarilletExport();

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

// Navigate to live mode
const goToLive = () => {
  if (barillet.value?.id) {
    router.push({ name: 'barillet-live', params: { id: barillet.value.id } });
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

// Export barillet to different formats
const handleExportFile = async (format: 'pdf' | 'json' | 'xlsx' | 'csv') => {
  if (!barillet.value) return;
  try {
    switch (format) {
      case 'pdf':
        await exportToPdf(barillet.value);
        break;
      case 'json':
        await exportToJson(barillet.value);
        break;
      case 'csv':
        await exportToCsv(barillet.value);
        break;
      case 'xlsx':
        await exportToExcel(barillet.value);
        break;
    }
  } catch (err) {
    console.error(`Failed to export ${format}:`, err);
    alert(`Impossible d'exporter en ${format.toUpperCase()}`);
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
              variant="default"
              class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              @click="goToLive"
            >
              <Play class="mr-2 h-4 w-4" />
              Mode Live
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
            <DropdownMenu>
              <template #trigger>
                <Button variant="outline" class="w-full sm:w-auto">
                  <FileDown class="mr-2 h-4 w-4" />
                  Exporter
                  <ChevronDown class="ml-2 h-4 w-4" />
                </Button>
              </template>
              <DropdownMenuItem @click="() => handleExportFile('pdf')">
                <FileDown class="h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem @click="() => handleExportFile('json')">
                <FileJson class="h-4 w-4" />
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem @click="() => handleExportFile('xlsx')">
                <FileSpreadsheet class="h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem @click="() => handleExportFile('csv')">
                <FileText class="h-4 w-4" />
                CSV
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>

        <!-- Owner notice -->
        <Alert v-if="isOwner" class="mt-4 bg-info-light border-info-border">
          <p class="text-sm text-info">
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
