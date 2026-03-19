/**
 * Theme participation options
 */
export type ThemeParticipation = string;

/**
 * Theme type
 */
export type ThemeType = 'Mixte' | 'Comparée';

/**
 * Individual theme within a barillet
 */
export interface Theme {
  type: ThemeType;
  title: string | null;
  participation: ThemeParticipation;
  category: string; // "Libre" or custom category name
  duration: string; // e.g., "3:00", "jusqu'à la fin du spectacle"
  notes?: string; // Optional internal notes
}

/**
 * Main barillet document structure
 */
export interface Barillet {
  id?: string; // Firestore document ID (optional for new documents)
  userId: string;
  title: string;
  date: Date | null;
  location: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  folderId: string | null;
  themes: Theme[];
}

/**
 * Barillet data structure from JSON import
 * Represents the clean export format (without userId, timestamps, and id)
 */
export interface ImportedBarilletData {
  title: string;
  date: string | null; // ISO date string from JSON (e.g., "2025-10-19")
  location: string;
  themes: Theme[];
}

/**
 * Folder for organizing barillets
 */
export interface Folder {
  id?: string;
  userId: string;
  name: string;
  createdAt: Date | null;
}

/**
 * Category for theme classification
 */
export interface Category {
  id?: string;
  name: string;
  userId: string | null; // null for global categories
  isDefault: boolean;
  createdAt: Date | null;
}

/**
 * Computed statistics for a barillet
 */
export interface BarilletStats {
  typeProportions: {
    mixte: number;
    comparee: number;
  };
  libreCount: number;
  librePercentage: number;
  themeCount: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Default theme template
 */
export const createEmptyTheme = (): Theme => ({
  type: 'Mixte',
  title: '',
  participation: 'illimitée',
  category: 'Libre',
  duration: '3:00',
});

/**
 * Create a theme with specific type and category
 */
const createTheme = (type: ThemeType, category: string): Theme => ({
  type,
  title: '',
  participation: 'illimitée',
  category,
  duration: '3:00',
});

/**
 * Default barillet template with 18 themes
 */
export const createEmptyBarillet = (userId: string): Barillet => {
  const themes: Theme[] = [
    // 8 Mixte / Libre
    ...Array.from({ length: 8 }, () => createTheme('Mixte', 'Libre')),
    // 4 Mixte / À définir
    ...Array.from({ length: 4 }, () => createTheme('Mixte', 'À définir')),
    // 4 Comparée / Libre
    ...Array.from({ length: 4 }, () => createTheme('Comparée', 'Libre')),
    // 2 Comparée / À définir
    ...Array.from({ length: 2 }, () => createTheme('Comparée', 'À définir')),
  ];

  return {
    userId,
    title: 'Nouveau barillet',
    date: new Date(),
    location: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    folderId: null,
    themes,
  };
};

/**
 * Calculate statistics for a barillet
 */
export const calculateBarilletStats = (barillet: Barillet): BarilletStats => {
  if (!barillet || !barillet.themes || barillet.themes.length === 0) {
    return {
      typeProportions: { mixte: 0, comparee: 0 },
      libreCount: 0,
      librePercentage: 0,
      themeCount: 0,
    };
  }

  const { themes } = barillet;

  const mixteCount = themes.filter((t) => t.type === 'Mixte').length;
  const compareeCount = themes.filter((t) => t.type === 'Comparée').length;
  const libreCount = themes.filter((t) => t.category === 'Libre').length;
  const librePercentage =
    themes.length > 0 ? (libreCount / themes.length) * 100 : 0;

  return {
    typeProportions: {
      mixte: mixteCount,
      comparee: compareeCount,
    },
    libreCount,
    librePercentage: Math.round(librePercentage * 10) / 10,
    themeCount: themes.length,
  };
};

/**
 * Validate theme object
 */
export const isValidTheme = (theme: Theme): boolean => {
  if (!theme) return false;

  const validTypes: ThemeType[] = ['Mixte', 'Comparée'];

  return (
    validTypes.includes(theme.type) &&
    typeof theme.participation === 'string' &&
    typeof theme.category === 'string' &&
    typeof theme.duration === 'string'
  );
};

/**
 * Validate barillet object
 */
export const validateBarillet = (barillet: Barillet): ValidationResult => {
  const errors: string[] = [];

  if (!barillet.userId) {
    errors.push('userId is required');
  }

  if (!barillet.title || barillet.title.trim() === '') {
    errors.push('title is required');
  }

  if (!barillet.themes || !Array.isArray(barillet.themes)) {
    errors.push('themes must be an array');
  } else {
    barillet.themes.forEach((theme, index) => {
      if (!isValidTheme(theme)) {
        errors.push(`theme at index ${index} is invalid`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
