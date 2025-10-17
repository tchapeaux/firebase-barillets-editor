<template>
  <div class="flex justify-center items-center min-h-screen p-4 bg-muted/30">
    <div class="w-full max-w-md space-y-6">
      <!-- Title Card -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Editeur de barillets</h1>
        <h2 class="text-xl font-medium text-muted-foreground">
          Réinitialiser le mot de passe
        </h2>
      </div>

      <!-- Forgot Password Card -->
      <Card class="p-6">
        <div v-if="!emailSent">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">
                Entrez votre adresse email pour recevoir un lien de
                réinitialisation de mot de passe.
              </p>
            </div>

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

            <!-- Error Message -->
            <Alert v-if="error" variant="destructive">
              {{ error }}
            </Alert>

            <!-- Submit Button -->
            <Button type="submit" class="w-full" :disabled="isLoading">
              {{
                isLoading
                  ? 'Envoi en cours...'
                  : 'Envoyer le lien de réinitialisation'
              }}
            </Button>
          </form>
        </div>

        <!-- Success Message -->
        <div v-else class="space-y-4">
          <Alert variant="default" class="bg-green-50 border-green-200">
            <p class="text-green-800">
              Un email de réinitialisation a été envoyé à
              <strong>{{ email }}</strong
              >. Veuillez vérifier votre boîte de réception.
            </p>
          </Alert>
        </div>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <Button
            type="button"
            variant="link"
            @click="router.push({ name: 'login' })"
          >
            Retour à la connexion
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

const router = useRouter();
const { resetPassword } = useAuth();

const email = ref('');
const isLoading = ref(false);
const error = ref('');
const emailSent = ref(false);

const handleSubmit = async () => {
  error.value = '';
  isLoading.value = true;

  try {
    const result = await resetPassword(email.value);

    if (!result.success) {
      error.value = getErrorMessage(result.error || '');
    } else {
      emailSent.value = true;
    }
  } finally {
    isLoading.value = false;
  }
};

const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/user-not-found': 'Aucun compte ne correspond à cet email',
    'auth/too-many-requests':
      'Trop de tentatives. Veuillez réessayer plus tard.',
  };

  // Extract error code from message if present
  const errorKey = Object.keys(errorMessages).find((key) =>
    errorCode.includes(key)
  );
  return errorKey
    ? errorMessages[errorKey]
    : 'Une erreur est survenue. Veuillez réessayer.';
};
</script>
