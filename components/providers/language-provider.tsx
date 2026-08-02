"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  translations,
  type Language,
  type TranslationDictionary,
} from "@/lib/translations";

const LANGUAGE_STORAGE_KEY =
  "gym-house-language";

const LANGUAGE_CHANGE_EVENT =
  "gym-house-language-change";

/*
 * Keeps the selected language working for the
 * current visit even if localStorage is blocked.
 */
let memoryLanguage: Language | null = null;

type LanguageContextValue = {
  language: Language | null;
  dictionary: TranslationDictionary;
  isLanguageReady: boolean;
  setLanguage: (language: Language) => void;
  resetLanguage: () => void;
};

const LanguageContext =
  createContext<LanguageContextValue | null>(
    null,
  );

function isSupportedLanguage(
  value: string | null,
): value is Language {
  return value === "en" || value === "am";
}

function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedLanguage =
      window.localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      );

    memoryLanguage = isSupportedLanguage(
      savedLanguage,
    )
      ? savedLanguage
      : null;

    return memoryLanguage;
  } catch {
    return memoryLanguage;
  }
}

function getServerLanguage(): Language | null {
  return null;
}

function subscribeToLanguage(
  onStoreChange: () => void,
) {
  const handleChange = () => {
    onStoreChange();
  };

  window.addEventListener(
    "storage",
    handleChange,
  );

  window.addEventListener(
    LANGUAGE_CHANGE_EVENT,
    handleChange,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleChange,
    );

    window.removeEventListener(
      LANGUAGE_CHANGE_EVENT,
      handleChange,
    );
  };
}

function subscribeToClientReady() {
  return () => {};
}

function getClientReady() {
  return true;
}

function getServerReady() {
  return false;
}

function applyDocumentLanguage(
  language: Language,
) {
  const html = document.documentElement;

  html.lang = language;
  html.dataset.language = language;
}

function clearDocumentLanguage() {
  const html = document.documentElement;

  html.lang = "en";

  delete html.dataset.language;
}

type LanguageProviderProps = {
  children: ReactNode;
};

export default function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getStoredLanguage,
    getServerLanguage,
  );

  const isLanguageReady =
    useSyncExternalStore(
      subscribeToClientReady,
      getClientReady,
      getServerReady,
    );

  /*
   * This effect only synchronizes React with the
   * document element. It does not update React state.
   */
  useEffect(() => {
    if (language) {
      applyDocumentLanguage(language);
      return;
    }

    clearDocumentLanguage();
  }, [language]);

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      memoryLanguage = newLanguage;

      applyDocumentLanguage(newLanguage);

      try {
        window.localStorage.setItem(
          LANGUAGE_STORAGE_KEY,
          newLanguage,
        );
      } catch {
        /*
         * memoryLanguage keeps it working during
         * the current browser visit.
         */
      }

      window.dispatchEvent(
        new Event(LANGUAGE_CHANGE_EVENT),
      );
    },
    [],
  );

  const resetLanguage = useCallback(() => {
    memoryLanguage = null;

    clearDocumentLanguage();

    try {
      window.localStorage.removeItem(
        LANGUAGE_STORAGE_KEY,
      );
    } catch {
      /*
       * Ignore browsers that block localStorage.
       */
    }

    window.dispatchEvent(
      new Event(LANGUAGE_CHANGE_EVENT),
    );
  }, []);

  const dictionary =
    translations[language ?? "en"];

  const contextValue = useMemo(
    () => ({
      language,
      dictionary,
      isLanguageReady,
      setLanguage,
      resetLanguage,
    }),
    [
      language,
      dictionary,
      isLanguageReady,
      setLanguage,
      resetLanguage,
    ],
  );

  return (
    <LanguageContext.Provider
      value={contextValue}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider.",
    );
  }

  return context;
}