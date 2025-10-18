<template>
  <div class="app-layout min-h-screen flex flex-col">
    <!-- Offline Status Banner -->
    <div
      v-if="!isOnline"
      class="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-4 py-2 text-center text-sm border-b border-yellow-200 dark:border-yellow-800"
    >
      <span class="font-medium">Mode hors ligne</span>
      <span class="mx-2">•</span>
      <span>Les modifications seront synchronisées lors de la reconnexion</span>
    </div>

    <!-- Header -->
    <header class="bg-background border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4"
        >
          <h1 class="text-2xl font-bold tracking-tight">
            <router-link
              to="/"
              class="hover:text-primary transition-colors flex items-center gap-3"
            >
              <img aria-hidden="true" src="/logo-zebra.png" class="h-14 w-14" />
              <span>Editeur de barillets</span>
            </router-link>
          </h1>
          <div v-if="user" class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">{{ user.email }}</span>
            <Button variant="outline" size="sm" @click="handleSignOut">
              <LogOut class="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
          <div v-else>
            <Button variant="outline" size="sm" as-child>
              <router-link to="/login">Se connecter</router-link>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-muted/50 border-t py-4 mt-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm text-muted-foreground">Vibe-coded with care</p>
        <p class="text-sm text-muted-foreground">
          <a
            class="underline"
            href="https://github.com/tchapeaux/firebase-barillets-editor"
            target="_blank"
          >
            Source Code
          </a>
          -
          <a
            class="underline"
            href="mailto:editeur-barillets-support@googlegroups.com"
          >
            Contact
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useOnline } from '@vueuse/core';
import { useAuth } from '../composables/useAuth';
import Button from '@/components/ui/button.vue';
import { LogOut } from 'lucide-vue-next';

const router = useRouter();
const { user, signOut } = useAuth();
const isOnline = useOnline();

const handleSignOut = async () => {
  const result = await signOut();
  if (!result.success) {
    console.error('Error signing out:', result.error);
  } else {
    // Successfully signed out, navigate to login
    router.push({ name: 'login' });
  }
};
</script>
