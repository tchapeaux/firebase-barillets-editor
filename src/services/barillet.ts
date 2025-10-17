/**
 * Barillet Service
 *
 * Provides functions to create, read, update, and delete barillets in Firestore.
 * Handles data validation, timestamp conversion, and error handling for all
 * barillet operations.
 */

import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase-app';
import {
  createEmptyBarillet,
  validateBarillet,
  type Barillet,
} from '../types/barillet';

export interface OperationResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Convert JavaScript Date to Firestore Timestamp
 * Used when writing user-provided dates to Firestore
 */
function convertDateToTimestamp(
  value: Date | null | undefined
): Timestamp | null {
  if (!value) return null;
  if (value instanceof Date) return Timestamp.fromDate(value);
  return null;
}

/**
 * Update an existing barillet
 * @param barilletId - ID of the barillet to update
 * @param updates - Fields to update
 * @returns Result with success status or error
 */
export async function updateBarillet(
  barilletId: string,
  updates: Partial<Barillet>
): Promise<OperationResult> {
  try {
    if (!barilletId) {
      return { success: false, error: 'Barillet ID is required' };
    }

    // Convert Date fields to Firestore Timestamps for storage
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Convert the date field if present
    if (updates.date !== undefined) {
      updateData.date = convertDateToTimestamp(updates.date);
    }

    // Update in Firestore
    const barilletRef = doc(db, 'barillets', barilletId);
    await updateDoc(barilletRef, updateData);

    return { success: true };
  } catch (err: unknown) {
    console.error('Error updating barillet:', err);
    const message = err instanceof Error ? err.message : 'An error occurred';
    return { success: false, error: message };
  }
}

/**
 * Create a new barillet
 * @param userId - ID of the user creating the barillet
 * @param barilletData - Partial barillet data (will be merged with defaults)
 * @returns Result with success status and barillet id or error
 */
export async function createBarillet(
  userId: string,
  barilletData: Partial<Barillet> = {}
): Promise<OperationResult> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Create barillet with defaults
    const barilletDefaults = createEmptyBarillet(userId);

    // Prepare data for Firestore with timestamp conversions
    const newBarillet = {
      ...barilletDefaults,
      ...barilletData,
      // Convert Date fields to Timestamps for Firestore
      date: convertDateToTimestamp(barilletData.date ?? barilletDefaults.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Validate barillet (cast for validation as serverTimestamp will be resolved by Firestore)
    const validation = validateBarillet(barilletDefaults);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'barillets'), newBarillet);

    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    console.error('Error creating barillet:', err);
    const message = err instanceof Error ? err.message : 'An error occurred';
    return { success: false, error: message };
  }
}

/**
 * Delete a barillet
 * @param barilletId - ID of the barillet to delete
 * @returns Result with success status or error
 */
export async function deleteBarillet(
  barilletId: string
): Promise<OperationResult> {
  try {
    if (!barilletId) {
      return { success: false, error: 'Barillet ID is required' };
    }

    // Delete from Firestore
    const barilletRef = doc(db, 'barillets', barilletId);
    await deleteDoc(barilletRef);

    return { success: true };
  } catch (err: unknown) {
    console.error('Error deleting barillet:', err);
    const message = err instanceof Error ? err.message : 'An error occurred';
    return { success: false, error: message };
  }
}
