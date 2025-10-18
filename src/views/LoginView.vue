<template>
  <div class="flex justify-center items-center min-h-screen p-4 bg-muted/30">
    <div class="w-full max-w-md space-y-6">
      <!-- Title Card -->
      <div class="text-center space-y-4">
        <div class="flex justify-center">
          <img aria-hidden="true" src="/logo-zebra.png" class="h-20 w-20" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Editeur de barillets</h1>
        <h2 class="text-xl font-medium text-muted-foreground">
          {{ isSignUp ? 'Créer un compte' : 'Connexion' }}
        </h2>
      </div>

      <!-- Login Card -->
      <Card class="p-6">
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Email Field -->
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="votre@email.com"
              autocomplete="email"
            />
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <Label for="password">Mot de passe</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              autocomplete="current-password"
              minlength="6"
            />
            <div v-if="!isSignUp" class="text-right">
              <Button
                type="button"
                variant="link"
                class="h-auto p-0 text-sm"
                @click="router.push({ name: 'forgot-password' })"
              >
                Mot de passe oublié ?
              </Button>
            </div>
          </div>

          <!-- Error Message -->
          <Alert v-if="error" variant="destructive">
            {{ error }}
          </Alert>

          <!-- Submit Button -->
          <Button type="submit" class="w-full" :disabled="isLoading">
            {{
              isLoading
                ? 'Chargement...'
                : isSignUp
                  ? 'Créer un compte'
                  : 'Se connecter'
            }}
          </Button>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground"> ou </span>
            </div>
          </div>

          <!-- Google Sign-in Button -->
          <Button
            type="button"
            variant="outline"
            class="w-full"
            :disabled="isLoading"
            @click="handleGoogleSignIn"
          >
            <GoogleIcon />
            Se connecter avec Google
          </Button>
        </form>

        <!-- Toggle Mode -->
        <div class="mt-6 text-center">
          <Button type="button" variant="link" @click="toggleMode">
            {{
              isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Pas de compte ? Créer un compte'
            }}
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import Card from '@/components/ui/card.vue';
import Alert from '@/components/ui/alert.vue';
import GoogleIcon from '@/components/GoogleIcon.vue';

const router = useRouter();
const { signIn, signUp, signInWithGoogle } = useAuth();

const email = ref('');
const password = ref('');
const isSignUp = ref(false);
const isLoading = ref(false);
const error = ref('');

const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
  error.value = '';
};

const handleSubmit = async () => {
  error.value = '';
  isLoading.value = true;

  try {
    const result = isSignUp.value
      ? await signUp(email.value, password.value)
      : await signIn(email.value, password.value);

    if (!result.success) {
      error.value = getErrorMessage(result.error || '');
    } else {
      // Successfully logged in, navigate to home
      router.push({ name: 'home' });
    }
  } finally {
    isLoading.value = false;
  }
};

const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte ne correspond à cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/invalid-credential': 'Email ou mot de passe incorrect',
    'auth/popup-closed-by-user':
      'La fenêtre de connexion a été fermée. Veuillez réessayer.',
    'auth/cancelled-popup-request': 'Opération annulée',
    'auth/popup-blocked':
      'La fenêtre popup a été bloquée. Veuillez autoriser les popups pour ce site.',
  };

  // Extract error code from message if present
  const errorKey = Object.keys(errorMessages).find((key) =>
    errorCode.includes(key)
  );
  return errorKey
    ? errorMessages[errorKey]
    : 'Une erreur est survenue. Veuillez réessayer.';
};

const handleGoogleSignIn = async () => {
  error.value = '';
  isLoading.value = true;

  try {
    const result = await signInWithGoogle();

    if (!result.success) {
      error.value = getErrorMessage(result.error || '');
    } else {
      // Successfully logged in, navigate to home
      router.push({ name: 'home' });
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
