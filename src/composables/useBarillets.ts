import { ref, watch, onUnmounted, type Ref } from 'vue';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase-app';
import type { Barillet } from '../types/barillet';
import * as barilletService from '../services/barillet';
import type { OperationResult } from '../services/barillet';

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

export function useBarillets(user: Ref<User | null>) {
  const barillets = ref<Barillet[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  let unsubscribe: Unsubscribe | null = null;

  // Watch for user changes and set up listener
  watch(
    user,
    (currentUser) => {
      // Clean up previous listener
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      if (!currentUser || !currentUser.uid) {
        barillets.value = [];
        loading.value = false;
        return;
      }

      try {
        // Create query for user's barillets, ordered by date (newest first)
        const barilletsQuery = query(
          collection(db, 'barillets'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );

        // Set up real-time listener
        unsubscribe = onSnapshot(
          barilletsQuery,
          (snapshot) => {
            barillets.value = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamps to JavaScript Dates
                date: convertTimestampToDate(data.date),
                createdAt: convertTimestampToDate(data.createdAt),
                updatedAt: convertTimestampToDate(data.updatedAt),
              } as Barillet;
            });
            loading.value = false;
            error.value = null;
          },
          (err) => {
            console.error('Error fetching barillets:', err);
            error.value = err.message;
            loading.value = false;
          }
        );
      } catch (err: unknown) {
        console.error('Error setting up barillets listener:', err);
        error.value = err instanceof Error ? err.message : 'An error occurred';
        loading.value = false;
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  /**
   * Create a new barillet
   * @param barilletData - Partial barillet data (will be merged with defaults)
   * @returns Result with success status and barillet id or error
   */
  const createBarillet = async (
    barilletData: Partial<Barillet> = {}
  ): Promise<OperationResult> => {
    if (!user.value || !user.value.uid) {
      return { success: false, error: 'User not authenticated' };
    }
    return barilletService.createBarillet(user.value.uid, barilletData);
  };

  /**
   * Update an existing barillet
   * @param barilletId - ID of the barillet to update
   * @param updates - Fields to update
   * @returns Result with success status or error
   */
  const updateBarillet = async (
    barilletId: string,
    updates: Partial<Barillet>
  ): Promise<OperationResult> => {
    return barilletService.updateBarillet(barilletId, updates);
  };

  /**
   * Delete a barillet
   * @param barilletId - ID of the barillet to delete
   * @returns Result with success status or error
   */
  const deleteBarillet = async (
    barilletId: string
  ): Promise<OperationResult> => {
    return barilletService.deleteBarillet(barilletId);
  };

  /**
   * Duplicate a barillet
   * @param barilletId - ID of the barillet to duplicate
   * @returns Result with success status and new barillet id or error
   */
  const duplicateBarillet = async (
    barilletId: string
  ): Promise<OperationResult> => {
    try {
      const original = barillets.value.find((b) => b.id === barilletId);
      if (!original) {
        return { success: false, error: 'Barillet not found' };
      }

      // Create copy without id and timestamps
      const {
        id: _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...barilletData
      } = original;
      const duplicate: Partial<Barillet> = {
        ...barilletData,
        title: `${barilletData.title} (copie)`,
      };

      return await createBarillet(duplicate);
    } catch (err: unknown) {
      console.error('Error duplicating barillet:', err);
      const message = err instanceof Error ? err.message : 'An error occurred';
      return { success: false, error: message };
    }
  };

  return {
    barillets: barillets as Ref<Barillet[]>,
    loading: loading as Ref<boolean>,
    error: error as Ref<string | null>,
    createBarillet,
    updateBarillet,
    deleteBarillet,
    duplicateBarillet,
  };
}
