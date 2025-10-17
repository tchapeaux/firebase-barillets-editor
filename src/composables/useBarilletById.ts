import { ref, watch, onUnmounted, type Ref } from 'vue';
import {
  doc,
  onSnapshot,
  type Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase-app';
import type { Barillet } from '../types/barillet';

/**
 * Convert Firestore Timestamp to JavaScript Date
 * Handles various date formats from Firestore
 */
function convertTimestampToDate(
  value: Date | Timestamp | { seconds: number } | null | undefined
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  // Handle plain objects with seconds (shouldn't happen with this approach, but defensive)
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000);
  }
  return null;
}

/**
 * Composable to fetch a single barillet by ID
 * Works with or without authentication (for public read-only access)
 * @param barilletId - ID of the barillet to fetch
 * @param user - Optional authenticated user (for checking ownership)
 */
export function useBarilletById(
  barilletId: Ref<string>,
  user?: Ref<User | null>
) {
  const barillet = ref<Barillet | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const isOwner = ref(false);
  let unsubscribe: Unsubscribe | null = null;

  // Watch for barillet ID changes and set up listener
  watch(
    barilletId,
    (currentId) => {
      // Clean up previous listener
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      if (!currentId) {
        barillet.value = null;
        loading.value = false;
        isOwner.value = false;
        return;
      }

      try {
        loading.value = true;
        error.value = null;

        // Create reference to the barillet document
        const barilletRef = doc(db, 'barillets', currentId);

        // Set up real-time listener
        unsubscribe = onSnapshot(
          barilletRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              barillet.value = {
                id: snapshot.id,
                ...data,
                // Convert Firestore Timestamps to JavaScript Dates
                date: convertTimestampToDate(data.date),
                createdAt: convertTimestampToDate(data.createdAt),
                updatedAt: convertTimestampToDate(data.updatedAt),
              } as Barillet;

              // Check if the current user is the owner
              if (user?.value && data.userId) {
                isOwner.value = user.value.uid === data.userId;
              } else {
                isOwner.value = false;
              }
            } else {
              barillet.value = null;
              isOwner.value = false;
            }
            loading.value = false;
          },
          (err) => {
            console.error('Error fetching barillet:', err);
            error.value = err.message;
            loading.value = false;
            barillet.value = null;
            isOwner.value = false;
          }
        );
      } catch (err: unknown) {
        console.error('Error setting up barillet listener:', err);
        error.value = err instanceof Error ? err.message : 'An error occurred';
        loading.value = false;
        barillet.value = null;
        isOwner.value = false;
      }
    },
    { immediate: true }
  );

  // Also watch for user changes to update ownership status
  if (user) {
    watch(user, (currentUser) => {
      if (barillet.value) {
        isOwner.value = currentUser?.uid === barillet.value.userId;
      }
    });
  }

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    barillet: barillet as Ref<Barillet | null>,
    loading: loading as Ref<boolean>,
    error: error as Ref<string | null>,
    isOwner: isOwner as Ref<boolean>,
  };
}
