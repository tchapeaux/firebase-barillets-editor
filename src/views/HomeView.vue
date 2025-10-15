<template>
  <div class="home">
    <header class="header">
      <h1>Editeur de barillets</h1>
      <div class="user-info">
        <span class="user-email">{{ user?.email }}</span>
        <button @click="handleSignOut" class="btn-logout">
          Déconnexion
        </button>
      </div>
    </header>

    <main class="content">
      <div class="content-header">
        <h2>Mes barillets</h2>
        <button @click="handleCreateBarillet" class="btn-primary">
          + Créer un nouveau barillet
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <p>Chargement des barillets...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <p>Erreur lors du chargement : {{ error }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="barillets.length === 0" class="empty-state">
        <div class="empty-icon">🎭</div>
        <h3>Aucun barillet pour le moment</h3>
        <p>Créez votre premier barillet pour commencer à organiser vos spectacles d'improvisation.</p>
        <button @click="handleCreateBarillet" class="btn-primary">
          Créer mon premier barillet
        </button>
      </div>

      <!-- Barillets grid -->
      <div v-else class="barillets-grid">
        <BarilletCard
          v-for="barillet in barillets"
          :key="barillet.id"
          :barillet="barillet"
          @edit="handleEdit"
          @duplicate="handleDuplicate"
          @delete="handleDelete"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useBarillets } from '../composables/useBarillets';
import BarilletCard from '../components/BarilletCard.vue';

const router = useRouter();
const { user, signOut } = useAuth();

// Get user's barillets
const { barillets, loading, error, createBarillet, duplicateBarillet, deleteBarillet } = useBarillets(user);

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
    location: ''
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
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.header h1 {
  margin: 0;
  font-size: 1.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background-color: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background-color: var(--border);
}

.content {
  padding: 1rem 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.content-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--team1color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.error-state {
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.barillets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .content-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .barillets-grid {
    grid-template-columns: 1fr;
  }
}
</style>
