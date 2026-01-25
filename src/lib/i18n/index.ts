import { en } from "./translations/en";
import { id } from "./translations/id";

export type Language = "en" | "id";
export type TranslationKey = keyof typeof en;

export const translations = {
  en,
  id,
} as const;

export const defaultLanguage: Language = "en";

export const getTranslation = (lang: Language) => {
  return translations[lang] || translations[defaultLanguage];
};
