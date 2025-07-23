# Internationalization (i18n) Guide

## Overview
This application supports multiple languages with separate translation systems for the renderer and main processes.

## Directory Structure
```
src/
├── main/
│   └── i18n/
│       └── translations.ts    # Main process translations
├── renderer/
│   └── i18n/
│       └── locales/          # Renderer process translations
│           ├── ja.json
│           └── en.json
└── shared/
    └── constants/
        └── languages.ts      # Language definitions
```

## Adding a New Language

### 1. Update Language Constants
Add the new language to `src/shared/constants/languages.ts`:

```typescript
export const SUPPORTED_LANGUAGES = {
  // ... existing languages ...
  fr: {
    code: 'fr',
    name: 'Français',
    englishName: 'French',
  },
} as const;
```

### 2. Add Renderer Translations
Create a new file `src/renderer/i18n/locales/fr.json`:

```json
{
  "app": {
    "title": "EPUB Image Extractor",
    "settings": "Paramètres"
  },
  // ... all other keys ...
}
```

### 3. Add Main Process Translations
Update `src/main/i18n/translations.ts`:

```typescript
export const translations = {
  // ... existing languages ...
  fr: {
    exitDialog: {
      title: 'Des fichiers sont en cours de traitement',
      message: 'Des fichiers sont en cours de traitement',
      detail: 'Êtes-vous sûr de vouloir quitter et interrompre le traitement?',
      buttons: {
        quit: 'Quitter',
        cancel: 'Annuler',
      },
    },
    menu: {
      file: 'Fichier',
      edit: 'Éditer',
      view: 'Affichage',
      help: 'Aide',
    },
  },
} as const;
```

### 4. Update i18n Configuration
Add the language to the renderer's i18n configuration in the appropriate setup files.

### 5. Update Settings UI
Add the language option to the settings dropdown.

## Translation Keys

### Renderer Process
- Uses i18next with JSON files
- Supports nested keys and interpolation
- Example: `t('processing.completed', { completed: 5 })`

### Main Process
- Uses TypeScript-based translations
- Type-safe with compile-time checking
- Example: `getTranslation(lang).exitDialog.title`

## Best Practices

1. **Consistency**: Keep key names consistent between renderer and main process where applicable
2. **Context**: Group related translations together (e.g., all dialog messages under `dialog`)
3. **Fallbacks**: Always provide English translations as fallback
4. **Testing**: Test all UI elements in each supported language
5. **Length**: Consider text length differences between languages in UI design

## Current Languages
- Japanese (ja) - Default
- English (en)

## Future Considerations
- Right-to-left (RTL) language support
- Locale-specific number and date formatting
- Pluralization rules for different languages