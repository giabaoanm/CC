import locale from "./locales/vi-VN.json";

type LocaleKey = keyof typeof locale;

export function t(key: LocaleKey): string {
  return locale[key];
}

export { locale };
