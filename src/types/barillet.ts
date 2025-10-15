/**
 * Duration configuration for a theme
 */
export interface ThemeDuration {
  value: string; // e.g., "3:00", "2 fois 3:00", "jusqu'à la fin du spectacle"
  type: "fixed" | "special";
  maximum: boolean;
}

/**
 * Theme participation options
 */
export type ThemeParticipation = string;

/**
 * Theme type
 */
export type ThemeType = "Mixte" | "Comparée";

/**
 * Individual theme within a barillet
 */
export interface Theme {
  type: ThemeType;
  title: string | null;
  participation: ThemeParticipation;
  category: string; // "Libre" or custom category name
  duration: ThemeDuration;
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
  totalDuration: string;
  totalMinutes: number;
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
  type: "Mixte",
  title: "", // Empty string by default
  participation: "illimitée",
  category: "Libre",
  duration: {
    value: "3:00",
    type: "fixed",
    maximum: false,
  },
});

/**
 * Default barillet template with 18 themes
 */
export const createEmptyBarillet = (userId: string): Barillet => ({
  userId,
  title: "Nouveau barillet",
  date: null,
  location: "",
  createdAt: null,
  updatedAt: null,
  folderId: null,
  themes: Array.from({ length: 18 }, () => createEmptyTheme()),
});

/**
 * Parse duration value to minutes
 * @param duration - Duration object { value, type, maximum }
 * @returns Duration in minutes, or 0 if not parseable
 */
export const parseDurationToMinutes = (duration: ThemeDuration): number => {
  if (!duration || duration.type === "special") {
    return 0; // Special durations don't count toward total time
  }

  const { value } = duration;

  // Handle "X fois Y:YY" format
  const timesMatch = value.match(/^(\d+)\s*fois\s*(\d+):(\d+)$/);
  if (timesMatch) {
    const times = parseInt(timesMatch[1], 10);
    const minutes = parseInt(timesMatch[2], 10);
    const seconds = parseInt(timesMatch[3], 10);
    return times * (minutes + seconds / 60);
  }

  // Handle "MM:SS" format
  const timeMatch = value.match(/^(\d+):(\d+)$/);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1], 10);
    const seconds = parseInt(timeMatch[2], 10);
    return minutes + seconds / 60;
  }

  return 0;
};

/**
 * Format minutes to MM:SS string
 * @param totalMinutes - Total duration in minutes
 * @returns Formatted duration "MM:SS"
 */
export const formatDuration = (totalMinutes: number): string => {
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Calculate statistics for a barillet
 * @param barillet - Barillet object
 * @returns Stats object with computed values
 */
export const calculateBarilletStats = (barillet: Barillet): BarilletStats => {
  if (!barillet || !barillet.themes || barillet.themes.length === 0) {
    return {
      totalDuration: "0:00",
      totalMinutes: 0,
      typeProportions: { mixte: 0, comparee: 0 },
      libreCount: 0,
      librePercentage: 0,
      themeCount: 0,
    };
  }

  const { themes } = barillet;

  // Calculate total duration
  const totalMinutes = themes.reduce((sum, theme) => {
    return sum + parseDurationToMinutes(theme.duration);
  }, 0);

  // Calculate type proportions
  const mixteCount = themes.filter((t) => t.type === "Mixte").length;
  const compareeCount = themes.filter((t) => t.type === "Comparée").length;

  // Calculate libre count and percentage
  const libreCount = themes.filter((t) => t.category === "Libre").length;
  const librePercentage =
    themes.length > 0 ? (libreCount / themes.length) * 100 : 0;

  return {
    totalDuration: formatDuration(totalMinutes),
    totalMinutes,
    typeProportions: {
      mixte: mixteCount,
      comparee: compareeCount,
    },
    libreCount,
    librePercentage: Math.round(librePercentage * 10) / 10, // Round to 1 decimal
    themeCount: themes.length,
  };
};

/**
 * Validate theme object
 * @param theme - Theme object to validate
 * @returns True if valid
 */
export const isValidTheme = (theme: Theme): boolean => {
  if (!theme) return false;

  const validTypes: ThemeType[] = ["Mixte", "Comparée"];
  const validParticipations: ThemeParticipation[] = [
    "2",
    "2 par équipe",
    "illimitée",
    "équivalente",
    "tout le monde",
  ];
  const validDurationTypes = ["fixed", "special"];

  return (
    validTypes.includes(theme.type) &&
    validParticipations.includes(theme.participation) &&
    typeof theme.category === "string" &&
    !!theme.duration &&
    typeof theme.duration.value === "string" &&
    validDurationTypes.includes(theme.duration.type) &&
    typeof theme.duration.maximum === "boolean"
  );
};

/**
 * Validate barillet object
 * @param barillet - Barillet object to validate
 * @returns Validation result { valid, errors }
 */
export const validateBarillet = (barillet: Barillet): ValidationResult => {
  const errors: string[] = [];

  if (!barillet.userId) {
    errors.push("userId is required");
  }

  if (!barillet.title || barillet.title.trim() === "") {
    errors.push("title is required");
  }

  if (!barillet.themes || !Array.isArray(barillet.themes)) {
    errors.push("themes must be an array");
  } else if (barillet.themes.length !== 18) {
    errors.push("barillet must have exactly 18 themes");
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
