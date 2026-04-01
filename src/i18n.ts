import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const originalLog = console.log;
console.log = (...args) => {
  if (typeof args[0] === 'string' && (args[0].includes('i18next') || args[0].includes('Locize'))) {
    return; // Agar yozuvda i18next yoki Locize bo'lsa, uni chiqarma
  }
  originalLog(...args);
};
i18n
  .use(initReactI18next)
  .init({
    debug: false,
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: 'uz', // default language
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
