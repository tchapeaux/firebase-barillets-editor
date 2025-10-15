import { ref, watch, onUnmounted, type Ref } from "vue";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase-app";
import {
  createEmptyBarillet,
  validateBarillet,
  type Barillet,
} from "../types/barillet";

interface OperationResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Convert Firestore Timestamp to JavaScript Date
 * Handles various date formats from Firestore
 */
function convertTimestampToDate(value: any): Date | null {
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
          collection(db, "barillets"),
          where("userId", "==", currentUser.uid),
          orderBy("date", "desc")
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
            console.error("Error fetching barillets:", err);
            error.value = err.message;
            loading.value = false;
          }
        );
      } catch (err: any) {
        console.error("Error setting up barillets listener:", err);
        error.value = err.message;
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
    try {
      if (!user.value || !user.value.uid) {
        return { success: false, error: "User not authenticated" };
      }

      // Create barillet with defaults
      const newBarillet: any = {
        ...createEmptyBarillet(user.value.uid),
        ...barilletData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Validate barillet
      const validation = validateBarillet(newBarillet);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(", ") };
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, "barillets"), newBarillet);

      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error("Error creating barillet:", err);
      return { success: false, error: err.message };
    }
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
    try {
      if (!barilletId) {
        return { success: false, error: "Barillet ID is required" };
      }

      // Add updatedAt timestamp
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Update in Firestore
      const barilletRef = doc(db, "barillets", barilletId);
      await updateDoc(barilletRef, updateData);

      return { success: true };
    } catch (err: any) {
      console.error("Error updating barillet:", err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Delete a barillet
   * @param barilletId - ID of the barillet to delete
   * @returns Result with success status or error
   */
  const deleteBarillet = async (
    barilletId: string
  ): Promise<OperationResult> => {
    try {
      if (!barilletId) {
        return { success: false, error: "Barillet ID is required" };
      }

      // Delete from Firestore
      const barilletRef = doc(db, "barillets", barilletId);
      await deleteDoc(barilletRef);

      return { success: true };
    } catch (err: any) {
      console.error("Error deleting barillet:", err);
      return { success: false, error: err.message };
    }
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
        return { success: false, error: "Barillet not found" };
      }

      // Create copy without id and timestamps
      const { id, createdAt, updatedAt, ...barilletData } = original;
      const duplicate: Partial<Barillet> = {
        ...barilletData,
        title: `${barilletData.title} (copie)`,
      };

      return await createBarillet(duplicate);
    } catch (err: any) {
      console.error("Error duplicating barillet:", err);
      return { success: false, error: err.message };
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
