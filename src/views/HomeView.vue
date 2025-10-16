<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <header
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b"
    >
      <h1 class="text-3xl font-bold tracking-tight">Editeur de barillets</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground">{{ user?.email }}</span>
        <Button variant="outline" @click="handleSignOut">
          <LogOut class="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </header>

    <!-- Content -->
    <main>
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h2 class="text-2xl font-semibold">Mes barillets</h2>
        <Button @click="handleCreateBarillet">
          <Plus class="h-4 w-4 mr-2" />
          Créer un nouveau barillet
        </Button>
      </div>

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
          @duplicate="handleDuplicate"
          @delete="handleDelete"
          @export-pdf="handleExportPdf"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useBarillets } from '../composables/useBarillets';
import { usePdfExport } from '../composables/usePdfExport';
import BarilletCard from '../components/BarilletCard.vue';
import Button from '@/components/ui/button.vue';
import Alert from '@/components/ui/alert.vue';
import { Plus, LogOut } from 'lucide-vue-next';

const router = useRouter();
const { user, signOut } = useAuth();
const { exportBarilletToPdf } = usePdfExport();

// Get user's barillets
const {
  barillets,
  loading,
  error,
  createBarillet,
  duplicateBarillet,
  deleteBarillet,
} = useBarillets(user);

const handleSignOut = async () => {
  const result = await signOut();
  if (!result.success) {
    console.error('Error signing out:', result.error);
  } else {
    // Successfully signed out, navigate to login
    router.push({ name: 'login' });
  }
};

const handleCreateBarillet = async () => {
  const result = await createBarillet({
    title: 'Nouveau barillet',
    date: new Date(),
    location: '',
  });

  if (!result.success) {
    alert(`Erreur lors de la création : ${result.error}`);
  }
  // Note: The barillet will appear automatically thanks to the real-time listener
};

const handleEdit = (barilletId: string) => {
  router.push({ name: 'barillet-edit', params: { id: barilletId } });
};

const handleDuplicate = async (barilletId: string) => {
  const result = await duplicateBarillet(barilletId);
  if (!result.success) {
    alert(`Erreur lors de la duplication : ${result.error}`);
  }
  // Note: The duplicated barillet will appear automatically
};

const handleDelete = async (barilletId: string) => {
  const result = await deleteBarillet(barilletId);
  if (!result.success) {
    alert(`Erreur lors de la suppression : ${result.error}`);
  }
  // Note: The barillet will disappear automatically
};

const handleExportPdf = (barilletId: string) => {
  const barillet = barillets.value.find((b) => b.id === barilletId);
  if (barillet) {
    exportBarilletToPdf(barillet);
  }
};
</script>
