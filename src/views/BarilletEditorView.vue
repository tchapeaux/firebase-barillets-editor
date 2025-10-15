<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useBarillets } from "../composables/useBarillets";
import { validateBarillet } from "../types/barillet";
import ThemeList from "../components/ThemeList.vue";
import type { Barillet, Theme } from "../types/barillet";

const route = useRoute();
const router = useRouter();
const { user } = useAuth();
const {
  barillets,
  loading: barilletsLoading,
  error: barilletsError,
  updateBarillet,
} = useBarillets(user);

const barilletId = route.params.id as string;

// State
const barillet = ref<Barillet | null>(null);
const localBarillet = ref<Barillet | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);
const validationErrors = ref<string[]>([]);
const hasUnsavedChanges = ref(false);

// Load barillet when data is available
watch(
  barillets,
  (newBarillets) => {
    if (newBarillets.length > 0 && !barillet.value) {
      const foundBarillet = newBarillets.find((b) => b.id === barilletId);
      if (foundBarillet) {
        barillet.value = foundBarillet;
        localBarillet.value = JSON.parse(JSON.stringify(foundBarillet)); // Deep clone
      }
    }
  },
  { immediate: true }
);

// Check if barillet exists
const barilletNotFound = computed(() => {
  return !barilletsLoading.value && !barillet.value;
});

// Handle theme updates
const handleThemesUpdate = (updatedThemes: Theme[]) => {
  if (localBarillet.value) {
    localBarillet.value.themes = updatedThemes;
    hasUnsavedChanges.value = true;
    saveSuccess.value = false;
    validationErrors.value = [];
  }
};

// Handle metadata updates
const updateMetadata = () => {
  hasUnsavedChanges.value = true;
  saveSuccess.value = false;
};

// Computed property for date input (converts Date to/from string)
const dateInputValue = computed({
  get: () => {
    if (!localBarillet.value?.date) return "";
    const date = localBarillet.value.date;
    // Handle both Date objects and Firestore Timestamps
    const dateObj = date instanceof Date ? date : new Date(date as any);
    return dateObj.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  },
  set: (value: string) => {
    if (localBarillet.value) {
      localBarillet.value.date = value ? new Date(value) : null;
      updateMetadata();
    }
  },
});

// Save changes
const saveChanges = async () => {
  if (!localBarillet.value || !localBarillet.value.id) return;

  // Validate before saving
  const validationResult = validateBarillet(localBarillet.value);
  if (!validationResult.valid) {
    validationErrors.value = validationResult.errors;
    return;
  }

  saving.value = true;
  saveError.value = null;
  saveSuccess.value = false;
  validationErrors.value = [];

  try {
    await updateBarillet(localBarillet.value.id, localBarillet.value);
    hasUnsavedChanges.value = false;
    saveSuccess.value = true;

    // Update the original barillet reference
    barillet.value = JSON.parse(JSON.stringify(localBarillet.value));

    // Redirect to Home after successful save
    router.push({ name: "home" });
  } catch (err) {
    console.error("Error saving barillet:", err);
    saveError.value = "Erreur lors de l'enregistrement. Veuillez réessayer.";
  } finally {
    saving.value = false;
  }
};

// Cancel and go back
const cancel = () => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm(
      "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?"
    );
    if (!confirmed) return;
  }
  router.push({ name: "home" });
};

// Warn before leaving with unsaved changes
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault();
    e.returnValue = "";
  }
};

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<template>
  <div class="editor">
    <!-- Loading state -->
    <div v-if="barilletsLoading" class="editor-message">
      <div class="spinner"></div>
      <p>Chargement du barillet...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="barilletsError" class="editor-message error">
      <p>❌ Erreur: {{ barilletsError }}</p>
      <button @click="cancel" class="btn-secondary">Retour à la liste</button>
    </div>

    <!-- Not found state -->
    <div v-else-if="barilletNotFound" class="editor-message error">
      <h2>Barillet introuvable</h2>
      <p>
        Le barillet demandé n'existe pas ou vous n'avez pas l'autorisation d'y
        accéder.
      </p>
      <button @click="cancel" class="btn-secondary">Retour à la liste</button>
    </div>

    <!-- Editor content -->
    <div v-else-if="localBarillet" class="editor-content">
      <!-- Header -->
      <div class="editor-header">
        <div class="header-left">
          <h1>Éditer le barillet</h1>
          <div class="metadata-form">
            <div class="form-row">
              <div class="form-field">
                <label>Titre</label>
                <input
                  type="text"
                  v-model="localBarillet.title"
                  @input="updateMetadata"
                  placeholder="Titre du barillet"
                  class="input-text"
                />
              </div>
              <div class="form-field">
                <label>Lieu</label>
                <input
                  type="text"
                  v-model="localBarillet.location"
                  @input="updateMetadata"
                  placeholder="Lieu"
                  class="input-text"
                />
              </div>
              <div class="form-field">
                <label>Date</label>
                <input
                  type="date"
                  v-model="dateInputValue"
                  class="input-text"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button @click="cancel" class="btn-secondary" :disabled="saving">
            Annuler
          </button>
          <button @click="saveChanges" class="btn-primary" :disabled="saving">
            <span v-if="saving">Enregistrement...</span>
            <span v-else>Enregistrer</span>
          </button>
        </div>
      </div>

      <!-- Status messages -->
      <div v-if="saveSuccess" class="alert alert-success">
        ✓ Modifications enregistrées avec succès !
      </div>

      <div v-if="saveError" class="alert alert-error">
        {{ saveError }}
      </div>

      <div v-if="validationErrors.length > 0" class="alert alert-warning">
        <strong>Erreurs de validation :</strong>
        <ul>
          <li v-for="(error, index) in validationErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>

      <div v-if="hasUnsavedChanges && !saveSuccess" class="alert alert-info">
        ⚠️ Vous avez des modifications non enregistrées
      </div>

      <!-- Theme list -->
      <ThemeList :themes="localBarillet.themes" @update="handleThemesUpdate" />
    </div>
  </div>
</template>

<style scoped>
.editor {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.editor-message {
  max-width: 600px;
  margin: 4rem auto;
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-message.error {
  border: 2px solid #f44336;
}

.editor-message h2 {
  margin-top: 0;
  color: #2c3e50;
}

.editor-message p {
  color: #666;
  margin-bottom: 1.5rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.editor-content {
  max-width: 1200px;
  margin: 0 auto;
}

.editor-header {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.75rem;
}

.metadata-form {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.375rem;
}

.input-text {
  padding: 0.625rem 0.875rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.input-text:focus {
  outline: none;
  border-color: #4caf50;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.alert ul {
  margin: 0.5rem 0 0 1.25rem;
  padding: 0;
}

.alert li {
  margin: 0.25rem 0;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* Responsive design */
@media (max-width: 768px) {
  .editor {
    padding: 1rem;
  }

  .editor-header {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
