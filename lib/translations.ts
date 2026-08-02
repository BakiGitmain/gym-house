export type Language = "en" | "am";

export type TranslationDictionary = {
  languageSelector: {
    eyebrow: string;
    title: string;
    description: string;
    englishName: string;
    englishNativeName: string;
    englishDescription: string;
    amharicName: string;
    amharicNativeName: string;
    amharicDescription: string;
    footer: string;
  };
};

export const translations: Record<
  Language,
  TranslationDictionary
> = {
  en: {
    languageSelector: {
      eyebrow: "Welcome to GYM House",
      title: "Choose your language",
      description:
        "Select your preferred language to continue.",
      englishName: "English",
      englishNativeName: "EN",
      englishDescription:
        "Continue using the website in English.",
      amharicName: "Amharic",
      amharicNativeName: "አማ",
      amharicDescription:
        "ድረ ገጹን በአማርኛ ለመጠቀም ይምረጡ።",
      footer:
        "You can change the language again later.",
    },
  },

  am: {
    languageSelector: {
      eyebrow: "ወደ GYM House እንኳን ደህና መጡ",
      title: "ቋንቋዎን ይምረጡ",
      description:
        "ለመቀጠል የሚመርጡትን ቋንቋ ይምረጡ።",
      englishName: "እንግሊዝኛ",
      englishNativeName: "EN",
      englishDescription:
        "ድረ ገጹን በእንግሊዝኛ ለመጠቀም ይምረጡ።",
      amharicName: "አማርኛ",
      amharicNativeName: "አማ",
      amharicDescription:
        "ድረ ገጹን በአማርኛ ለመጠቀም ይምረጡ።",
      footer:
        "ቋንቋውን በኋላም መቀየር ይችላሉ።",
    },
  },
};