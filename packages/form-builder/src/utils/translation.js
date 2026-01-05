/**
 * Translation utility functions for handling schema-based translations with fallbacks
 * Supports nested object properties, multiple languages, and graceful fallbacks
 */

/**
 * Get translations from schema or fallback to i18n
 * @param {string} key - Translation key (supports nested keys like "account.id")
 * @param {string} type - Type of translation (label, description, placeholders, error.custom, etc.)
 * @param {string} defaultValue - Default value if no translation found
 * @param {string} currentLanguage - Current language code
 * @param {object} translations - Translation object from schema
 * @param {function} i18nTranslate - i18n translate function
 * @param {string} entity - Entity name for i18n fallback
 * @returns {string} Translated text or fallback value
 */
export const getTranslation = (
  key,
  type = 'label',
  defaultValue = '',
  currentLanguage = 'en',
  translations = null,
  i18nTranslate = null,
  entity = ''
) => {
  // Check schema-based translations first
  if (translations && translations[currentLanguage]) {
    const result = getNestedTranslation(key, type, translations[currentLanguage]);
    if (result) return result;
  }

  // Try fallback to English if current language doesn't have the translation
  if (translations && translations.en && currentLanguage !== 'en') {
    const result = getNestedTranslation(key, type, translations.en);
    if (result) return result;
  }

  // Fallback to i18n translation
  if (i18nTranslate && entity) {
    const i18nKey = `forms.${entity}.${key}.${type}`;
    const i18nResult = i18nTranslate(i18nKey, { defaultValue: null });
    if (i18nResult && i18nResult !== i18nKey) {
      return i18nResult;
    }
  }

  // Final fallback: create a user-friendly version from the key if no defaultValue provided
  if (!defaultValue) {
    return createHumanReadableLabel(key);
  }

  return defaultValue;
};

/**
 * Navigate through nested translation object
 * @param {string} key - Translation key (supports nested keys like "account.id")
 * @param {string} type - Type of translation (label, description, etc.)
 * @param {object} translationObj - Translation object for specific language
 * @returns {string|null} Translation text or null if not found
 */
export const getNestedTranslation = (key, type, translationObj) => {
  // Navigate through nested keys (e.g., "primary_contact.first_name")
  const keys = key.split('.');
  let current = translationObj;

  for (const k of keys) {
    if (current && typeof current === 'object' && current[k]) {
      current = current[k];
    } else {
      return null;
    }
  }

  // If current is an object with the requested type (e.g., label, description)
  if (current && typeof current === 'object' && current[type]) {
    return current[type];
  }

  // If current is a direct string value (for groups)
  if (current && typeof current === 'string') {
    return current;
  }

  return null;
};

/**
 * Create a human-readable label from a key
 * Converts snake_case or camelCase to Title Case
 * @param {string} key - The key to convert
 * @returns {string} Human-readable label
 */
export const createHumanReadableLabel = (key) => {
  const lastKey = key.split('.').pop();
  return lastKey
    .replace(/[_-]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
};

/**
 * Get specific error messages for form validation
 * @param {Array} errors - Array of validation errors
 * @param {string} fieldPath - Field path to find error for
 * @param {string|null} keyword - Optional keyword to match (e.g., 'minItems')
 * @param {function} getTranslationFn - Translation function
 * @returns {string|null} Error message or null if not found
 */
export const getSpecificError = (errors, fieldPath, keyword = null, getTranslationFn) => {
  const error = errors.find(
    (error) => error.instancePath.includes(fieldPath) || (keyword && error.keyword === keyword)
  );

  if (error) {
    if (keyword === 'minItems') {
      return getTranslationFn(
        fieldPath,
        'error.min_items',
        `At least one ${fieldPath} is required`
      );
    }
    return getTranslationFn(fieldPath, 'error.required', `${fieldPath} information is required`);
  }

  return null;
};

/**
 * Create a translation function bound to current context
 * This is a higher-order function that creates a translation function
 * with all the necessary context pre-filled
 * @param {object} context - Translation context
 * @param {string} context.currentLanguage - Current language
 * @param {object} context.translations - Schema translations
 * @param {function} context.i18nTranslate - i18n translate function
 * @param {string} context.entity - Entity name
 * @returns {function} Bound translation function
 */
export const createTranslationFunction = (context) => {
  const { currentLanguage, translations, i18nTranslate, entity } = context;

  return (key, type = 'label', defaultValue = '') => {
    return getTranslation(
      key,
      type,
      defaultValue,
      currentLanguage,
      translations,
      i18nTranslate,
      entity
    );
  };
};

/**
 * Create an error translation function bound to current context
 * @param {function} translationFn - Translation function
 * @returns {function} Bound error translation function
 */
export const createErrorTranslationFunction = (translationFn) => {
  return (errors, fieldPath, keyword = null) => {
    return getSpecificError(errors, fieldPath, keyword, translationFn);
  };
};
