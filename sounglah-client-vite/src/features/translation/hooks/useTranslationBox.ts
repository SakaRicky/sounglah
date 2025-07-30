import { useQuery, useMutation } from '@tanstack/react-query';
import { translate, detectLangFromText, type Translate } from '@/services';
import { SourceLanguageCode } from '@/types';
import { useState, useEffect } from 'react';

// Useful exported types
export type { Translate };
export { SourceLanguageCode };

export interface TranslationRequest {
  srcLanguage: SourceLanguageCode;
  text: string;
}

export interface LanguageDetectionRequest {
  text: string;
}

// Query keys
export const translationBoxKeys = {
  all: ['translationBox'] as const,
  translations: () => [...translationBoxKeys.all, 'translations'] as const,
  translation: (request: TranslationRequest) => [...translationBoxKeys.translations(), request] as const,
  languageDetection: () => [...translationBoxKeys.all, 'languageDetection'] as const,
  detectedLanguage: (text: string) => [...translationBoxKeys.languageDetection(), text] as const,
};

// Debounced language detection hook
export const useLanguageDetection = (text: string, debounceMs: number = 800) => {
  const [debouncedText, setDebouncedText] = useState(text);

  // Debounce the text input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [text, debounceMs]);

  // Only run the query with debounced text
  return useQuery({
    queryKey: translationBoxKeys.detectedLanguage(debouncedText),
    queryFn: () => detectLangFromText(debouncedText),
    enabled: debouncedText.trim().length >= 3, // Only detect if text is long enough
    staleTime: 5 * 60 * 1000, // 5 minutes - language detection doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Translation mutation hook
export const useTranslate = () => {
  return useMutation({
    mutationFn: translate,
    onError: (error: unknown) => {
      console.error('Translation error:', error);
    },
  });
};

// Language mapping utility
export const langMap: { [key: string]: SourceLanguageCode } = {
  en: SourceLanguageCode.English,
  fr: SourceLanguageCode.Français,
};

// Hook for managing translation state
export const useTranslationState = () => {
  const translateMutation = useTranslate();

  const translateText = async (srcLanguage: SourceLanguageCode, text: string): Promise<Translate | undefined> => {
    if (!text.trim() || srcLanguage === SourceLanguageCode.Undetermined) {
      return undefined;
    }

    try {
      const result = await translateMutation.mutateAsync({
        srcLanguage,
        text: text.trim(),
      });
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      throw error;
    }
  };

  return {
    translateText,
    isTranslating: translateMutation.isPending,
    error: translateMutation.error,
  };
}; 