import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en.json";
import viTranslation from "./locales/vi.json";

const languageDetectorOptions = {
  order: ["localStorage"],
  lookupLocalStorage: "i18next",
  caches: ["localStorage"],
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      vi: { translation: viTranslation },
    },
    fallbackLng: "vi",
    detection: languageDetectorOptions,
    interpolation: {
      escapeValue: false,
    },
  });

if (!localStorage.getItem("i18next")) {
  i18n.changeLanguage("vi");
}

export default i18n;
