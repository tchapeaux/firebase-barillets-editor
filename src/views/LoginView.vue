<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Editeur de barillets</h1>
      <h2>{{ isSignUp ? 'Créer un compte' : 'Connexion' }}</h2>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="votre@email.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            autocomplete="current-password"
            minlength="6"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Chargement...' : (isSignUp ? 'Créer un compte' : 'Se connecter') }}
        </button>
      </form>

      <div class="toggle-mode">
        <button type="button" @click="toggleMode" class="btn-link">
          {{ isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { signIn, signUp } = useAuth();

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
    'auth/invalid-credential': 'Email ou mot de passe incorrect'
  };

  // Extract error code from message if present
  const errorKey = Object.keys(errorMessages).find(key => errorCode.includes(key));
  return errorKey ? errorMessages[errorKey] : 'Une erreur est survenue. Veuillez réessayer.';
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--surface);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
}

.login-card h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  text-align: center;
  color: var(--text-primary);
}

.login-card h2 {
  margin: 0 0 2rem 0;
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--background);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--team1color);
}

.error-message {
  padding: 0.75rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
  font-size: 0.9rem;
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

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode {
  margin-top: 1rem;
  text-align: center;
}

.btn-link {
  background: none;
  border: none;
  color: var(--team1color);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0.5rem;
}

.btn-link:hover {
  opacity: 0.8;
}
</style>
