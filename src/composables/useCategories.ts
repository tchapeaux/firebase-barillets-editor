import categoriesData from '@/data/categories.json';

export interface Category {
  name: string;
  description: string;
}

/**
 * Composable for managing improvisation categories
 * Provides access to the preset category list and lookup functions
 */
export function useCategories() {
  // The categories loaded from the JSON file
  const categories: Category[] = categoriesData as Category[];

  // Just the category names, useful for autocomplete
  const categoryNames = categories.map((cat) => cat.name);

  /**
   * Get a category object by its name
   * Returns undefined if not found
   */
  function getCategoryByName(name: string): Category | undefined {
    return categories.find((cat) => cat.name === name);
  }

  /**
   * Check if a category name exists in the preset list
   */
  function isPresetCategory(name: string): boolean {
    return categories.some((cat) => cat.name === name);
  }

  return {
    categories,
    categoryNames,
    getCategoryByName,
    isPresetCategory,
  };
}
