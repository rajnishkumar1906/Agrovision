import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

const useLanguageStore = create(
  persist(
    (set) => ({
      language: i18n.language || 'en',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

export default useLanguageStore;
