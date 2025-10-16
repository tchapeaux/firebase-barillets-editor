<template>
  <div class="app">
    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>
    <template v-else>
      <AppLayout v-if="requiresLayout">
        <router-view />
      </AppLayout>
      <router-view v-else />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from './composables/useAuth';
import AppLayout from './components/AppLayout.vue';

const { loading } = useAuth();
const route = useRoute();

const requiresLayout = computed(() => route.meta.requiresLayout === true);
</script>

<style>
.app {
  min-height: 100vh;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: var(--text-secondary);
}
</style>
