<template>
  <div class="app">
    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';

const { loading } = useAuth();
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
