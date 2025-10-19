import type { Barillet, ImportedBarilletData, Theme } from '../types/barillet';
import { useBarillets } from './useBarillets';
import type { Ref } from 'vue';
import type { User } from 'firebase/auth';

export interface ImportResult {
  success: boolean;
  error?: string;
  barilletId?: string;
}

/**
 * Composable for importing barillets from JSON files
 */
export function useBarilletImport(user: Ref<User | null>) {
  const { createBarillet } = useBarillets(user);

  /**
   * Validates that all required fields exist in a theme
   */
  const isValidThemeStructure = (theme: unknown): theme is Theme => {
    if (typeof theme !== 'object' || theme === null) return false;

    const t = theme as Record<string, unknown>;
    return (
      (t.type === 'Mixte' || t.type === 'Comparée') &&
      typeof t.title === 'string' &&
      typeof t.participation === 'string' &&
      typeof t.category === 'string' &&
      typeof t.duration === 'object' &&
      t.duration !== null &&
      'value' in t.duration &&
      'type' in t.duration &&
      (t.duration.type === 'fixed' || t.duration.type === 'special')
    );
  };

  /**
   * Validates the imported JSON structure
   */
  const validateImportedData = (
    data: unknown
  ): data is ImportedBarilletData => {
    if (typeof data !== 'object' || data === null) return false;

    const d = data as Record<string, unknown>;

    // Check required fields
    if (typeof d.title !== 'string' || d.title.trim() === '') {
      throw new Error(
        'Le fichier JSON doit contenir un titre de barillet valide'
      );
    }

    if (!Array.isArray(d.themes)) {
      throw new Error('Le fichier JSON doit contenir un tableau de thèmes');
    }

    if (d.themes.length !== 18) {
      throw new Error(
        `Le fichier doit contenir exactement 18 thèmes (trouvé: ${d.themes.length})`
      );
    }

    // Validate each theme structure
    for (let i = 0; i < d.themes.length; i++) {
      if (!isValidThemeStructure(d.themes[i])) {
        throw new Error(
          `Le thème #${i + 1} a une structure invalide ou des champs manquants`
        );
      }
    }

    // Validate optional fields
    if (d.date !== null && typeof d.date !== 'string') {
      throw new Error('La date doit être au format ISO (YYYY-MM-DD)');
    }

    if (d.location !== undefined && typeof d.location !== 'string') {
      throw new Error('Le lieu doit être une chaîne de caractères');
    }

    return true;
  };

  /**
   * Parse ISO date string to JavaScript Date
   */
  const parseDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date string: ${dateString}, using null`);
        return null;
      }
      return date;
    } catch (err) {
      console.warn(`Error parsing date ${dateString}:`, err);
      return null;
    }
  };

  /**
   * Read and parse JSON from file
   */
  const readJsonFile = async (file: File): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result;
          if (typeof content !== 'string') {
            reject(new Error('Impossible de lire le fichier'));
            return;
          }

          const data = JSON.parse(content);
          resolve(data);
        } catch {
          reject(new Error('Le fichier JSON est invalide ou mal formaté'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsText(file);
    });
  };

  /**
   * Import a barillet from JSON file
   */
  const importFromJson = async (file: File): Promise<ImportResult> => {
    try {
      // Check file type
      if (!file.name.endsWith('.json')) {
        return {
          success: false,
          error: "Le fichier doit avoir l'extension .json",
        };
      }

      // Read and parse JSON
      const data = await readJsonFile(file);

      // Validate structure
      if (!validateImportedData(data)) {
        return {
          success: false,
          error: 'Le format du fichier est invalide',
        };
      }

      // Parse date from ISO string
      const parsedDate = parseDate(data.date);

      // Prepare barillet data for creation
      const barilletData: Partial<Barillet> = {
        title: `${data.title} (importé)`,
        date: parsedDate,
        location: data.location || '',
        themes: data.themes,
      };

      // Create barillet
      const result = await createBarillet(barilletData);

      if (!result.success) {
        return {
          success: false,
          error: `Erreur lors de la création du barillet : ${result.error || 'Erreur inconnue'}`,
        };
      }

      return {
        success: true,
        barilletId: result.id,
      };
    } catch (err) {
      console.error('Import error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    importFromJson,
  };
}
