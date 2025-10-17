import { ref, Ref } from 'vue';
import type { Theme } from '../types/barillet';

/**
 * Composable for managing theme duration input and type switching
 */
export const useThemeDuration = (
  localTheme: Ref<Theme>,
  onUpdate: () => void
) => {
  // Smart duration input - numeric by default, free text when "special"
  const durationMinutes = ref('3');
  const durationSeconds = ref('00');

  /**
   * Parse duration value and update input fields
   */
  const updateDurationInputs = (value: string) => {
    // Handle "MM:SS" format
    const timeMatch = value.match(/^(\d+):(\d+)$/);
    if (timeMatch) {
      durationMinutes.value = timeMatch[1];
      durationSeconds.value = timeMatch[2];
    }
  };

  /**
   * Update duration value from numeric inputs
   */
  const updateDurationFromInputs = () => {
    const mins = parseInt(durationMinutes.value || '0', 10);
    const secs = parseInt(durationSeconds.value || '0', 10);
    localTheme.value.duration.value = `${mins}:${secs.toString().padStart(2, '0')}`;
    onUpdate();
  };

  /**
   * Format seconds input to always be 2 digits
   */
  const formatSeconds = () => {
    const secs = parseInt(durationSeconds.value || '0', 10);
    if (secs > 59) {
      durationSeconds.value = '59';
    } else {
      durationSeconds.value = secs.toString().padStart(2, '0');
    }
    updateDurationFromInputs();
  };

  /**
   * Toggle duration type between fixed and special
   * When switching to fixed, validates and resets value if needed
   */
  const toggleDurationType = () => {
    const isCurrentlyFixed = localTheme.value.duration.type === 'fixed';
    localTheme.value.duration.type = isCurrentlyFixed ? 'special' : 'fixed';

    if (!isCurrentlyFixed && localTheme.value.duration.value) {
      // Switching to fixed - check if value is in MM:SS format
      const timeMatch = localTheme.value.duration.value.match(/^(\d+):(\d+)$/);
      if (!timeMatch) {
        durationMinutes.value = '3';
        durationSeconds.value = '00';
        localTheme.value.duration.value = '3:00';
      }
    }

    onUpdate();
  };

  return {
    durationMinutes,
    durationSeconds,
    updateDurationInputs,
    updateDurationFromInputs,
    formatSeconds,
    toggleDurationType,
  };
};
