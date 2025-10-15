<template>
  <div class="barillet-card">
    <div class="card-header">
      <div class="card-title-section">
        <h3 class="card-title">{{ barillet.title || 'Sans titre' }}</h3>
        <div class="card-meta">
          <span v-if="barillet.date" class="meta-date">
            {{ formatDate(barillet.date) }}
          </span>
          <span v-if="barillet.location" class="meta-location">
            {{ barillet.location }}
          </span>
        </div>
      </div>
      <div class="card-actions">
        <button @click="toggleMenu" class="btn-menu" :aria-expanded="menuOpen">
          ⋮
        </button>
        <div v-if="menuOpen" class="actions-menu">
          <button @click="handleEdit" class="menu-item">
            Modifier
          </button>
          <button @click="handleDuplicate" class="menu-item">
            Dupliquer
          </button>
          <button @click="handleDelete" class="menu-item menu-item-danger">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <div class="card-stats">
      <div class="stat-item">
        <span class="stat-label">Durée totale</span>
        <span class="stat-value">{{ stats.totalDuration }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Thèmes</span>
        <span class="stat-value">{{ stats.themeCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Mixtes</span>
        <span class="stat-value">{{ stats.typeProportions.mixte }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Comparées</span>
        <span class="stat-value">{{ stats.typeProportions.comparee }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Libres</span>
        <span class="stat-value">{{ stats.libreCount }} ({{ stats.librePercentage }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { calculateBarilletStats, type Barillet } from '../types/barillet';

interface Props {
  barillet: Barillet;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [id: string];
  duplicate: [id: string];
  delete: [id: string];
}>();

const menuOpen = ref(false);

const stats = computed(() => calculateBarilletStats(props.barillet));

const formatDate = (date: Date | null): string => {
  if (!date) return '';

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const handleEdit = () => {
  menuOpen.value = false;
  if (props.barillet.id) {
    emit('edit', props.barillet.id);
  }
};

const handleDuplicate = () => {
  menuOpen.value = false;
  if (props.barillet.id) {
    emit('duplicate', props.barillet.id);
  }
};

const handleDelete = () => {
  menuOpen.value = false;
  if (props.barillet.id && confirm(`Êtes-vous sûr de vouloir supprimer "${props.barillet.title || 'ce barillet'}" ?`)) {
    emit('delete', props.barillet.id);
  }
};

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuOpen.value && !(event.target as HTMLElement).closest('.card-actions')) {
    menuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.barillet-card {
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
  cursor: pointer;
}

.barillet-card:hover {
  box-shadow: 0 4px 12px var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-title-section {
  flex: 1;
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.meta-date::before {
  content: '📅 ';
}

.meta-location::before {
  content: '📍 ';
}

.card-actions {
  position: relative;
}

.btn-menu {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-menu:hover {
  color: var(--text-primary);
}

.actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 4px 12px var(--shadow);
  min-width: 150px;
  z-index: 10;
  overflow: hidden;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: var(--surface);
}

.menu-item-danger {
  color: #dc3545;
}

.menu-item-danger:hover {
  background-color: #fff5f5;
}

.card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .card-stats {
    gap: 1rem;
  }

  .stat-item {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 0;
  }
}
</style>
