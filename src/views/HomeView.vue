<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Content -->
    <div>
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h2 class="text-2xl font-semibold">Mes barillets</h2>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button class="w-full sm:w-auto" @click="handleCreateBarillet">
            <Plus class="h-4 w-4 mr-2" />
            Créer un nouveau barillet
          </Button>
          <Button
            variant="outline"
            class="w-full sm:w-auto"
            @click="triggerFileInput"
          >
            <Upload class="h-4 w-4 mr-2" />
            Importer depuis JSON
          </Button>
        </div>
      </div>

      <!-- Hidden file input for import -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleFileChange"
      />

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-muted-foreground">Chargement des barillets...</p>
      </div>

      <!-- Error state -->
      <Alert v-else-if="error" variant="destructive">
        Erreur lors du chargement : {{ error }}
      </Alert>

      <!-- Empty state -->
      <div
        v-else-if="barillets.length === 0"
        class="text-center py-16 max-w-md mx-auto"
      >
        <div class="text-6xl mb-4">🎭</div>
        <h3 class="text-xl font-semibold mb-2">
          Aucun barillet pour le moment
        </h3>
        <p class="text-muted-foreground mb-6 leading-relaxed">
          Créez votre premier barillet pour commencer à organiser vos spectacles
          d'improvisation.
        </p>
        <Button @click="handleCreateBarillet">
          <Plus class="h-4 w-4 mr-2" />
          Créer mon premier barillet
        </Button>
      </div>

      <!-- Barillets grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BarilletCard
          v-for="barillet in barillets"
          :key="barillet.id"
          :barillet="barillet"
          @edit="handleEdit"
          @view="handleView"
          @live="handleLive"
          @duplicate="handleDuplicate"
          @delete="handleDelete"
          @export="handleExport"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import { useAuth } from '../composables/useAuth';
import { useBarillets } from '../composables/useBarillets';
import { useBarilletExport } from '../composables/useBarilletExport';
import { useBarilletImport } from '../composables/useBarilletImport';
import BarilletCard from '../components/BarilletCard.vue';
import Button from '@/components/ui/button.vue';
import Alert from '@/components/ui/alert.vue';
import { Plus, Upload } from 'lucide-vue-next';

const router = useRouter();
const { user } = useAuth();
const { exportToPdf, exportToJson, exportToCsv, exportToExcel } =
  useBarilletExport();
const { importFromJson } = useBarilletImport(user);

// Get user's barillets
const {
  barillets,
  loading,
  error,
  createBarillet,
  duplicateBarillet,
  deleteBarillet,
} = useBarillets(user);

// File input reference for import
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);

const handleCreateBarillet = async () => {
  const result = await createBarillet({
    title: 'Nouveau barillet',
    date: new Date(),
    location: '',
  });

  if (!result.success) {
    toast.error(`Erreur lors de la création : ${result.error}`);
  } else if (result.id) {
    // Redirect to the editor for the newly created barillet
    router.push({ name: 'barillet-edit', params: { id: result.id } });
  }
};

const handleEdit = (barilletId: string) => {
  router.push({ name: 'barillet-edit', params: { id: barilletId } });
};

const handleView = (barilletId: string) => {
  router.push({ name: 'barillet-view', params: { id: barilletId } });
};

const handleLive = (barilletId: string) => {
  router.push({ name: 'barillet-live', params: { id: barilletId } });
};

const handleDuplicate = async (barilletId: string) => {
  const result = await duplicateBarillet(barilletId);
  if (!result.success) {
    toast.error(`Erreur lors de la duplication : ${result.error}`);
  } else {
    toast.success('Barillet dupliqué');
  }
  // Note: The duplicated barillet will appear automatically
};

const handleDelete = async (barilletId: string) => {
  const result = await deleteBarillet(barilletId);
  if (!result.success) {
    toast.error(`Erreur lors de la suppression : ${result.error}`);
  } else {
    toast.success('Barillet supprimé');
  }
};

const handleExport = async (
  barilletId: string,
  format: 'pdf' | 'json' | 'xlsx' | 'csv'
) => {
  const barillet = barillets.value.find((b) => b.id === barilletId);
  if (!barillet) return;

  try {
    switch (format) {
      case 'pdf':
        await exportToPdf(barillet);
        break;
      case 'json':
        await exportToJson(barillet);
        break;
      case 'csv':
        await exportToCsv(barillet);
        break;
      case 'xlsx':
        await exportToExcel(barillet);
        break;
    }
    toast.success(`Barillet exporté en ${format.toUpperCase()}`);
  } catch (err) {
    console.error(`Export to ${format} failed:`, err);
    toast.error(`Impossible d'exporter en ${format.toUpperCase()}`);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  importing.value = true;

  try {
    const result = await importFromJson(file);

    if (!result.success) {
      toast.error(
        `Erreur lors de l'import : ${result.error || 'Erreur inconnue'}`
      );
    } else if (result.barilletId) {
      toast.success('Barillet importé avec succès');
      // Success - redirect to editor
      router.push({ name: 'barillet-edit', params: { id: result.barilletId } });
    }
  } catch (err) {
    console.error('Import failed:', err);
    toast.error("Erreur lors de l'import du fichier");
  } finally {
    importing.value = false;
    // Reset file input
    input.value = '';
  }
};
</script>
