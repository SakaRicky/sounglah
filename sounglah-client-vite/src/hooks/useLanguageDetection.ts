import { useCallback, useEffect, useState } from 'react';
import { SourceLanguageCode } from '../types';
import { detectLangFromText } from '@/services';
import { debounce } from 'lodash';

const langMap: { [key: string]: SourceLanguageCode } = {
    en: SourceLanguageCode.English,
    fr: SourceLanguageCode.Français,
};

const useLanguageDetection = (sourceText: string) => {
    const [autoDetectedSourceLanguage, setDetectedSourceLanguage] = useState<SourceLanguageCode>(SourceLanguageCode.Undetermined);

    const detectedLanguage = useCallback(async () => {
        if (sourceText.trim().length < 3) {
            return SourceLanguageCode.Undetermined;
        }
        
        const detectedLangCode = await detectLangFromText(sourceText);

        setDetectedSourceLanguage(langMap[detectedLangCode] || SourceLanguageCode.Undetermined);

    }, [sourceText]);

    const debouncedDetectLanguage = debounce(detectedLanguage, 500);

    useEffect(() => {
        debouncedDetectLanguage();

        return () => {
            debouncedDetectLanguage.cancel();
        };
    }, [sourceText, detectedLanguage, debouncedDetectLanguage]);

    const handleSourceLanguageChange = (value: SourceLanguageCode) => {
        setDetectedSourceLanguage(value);
    };

    return { autoDetectedSourceLanguage, handleSourceLanguageChange };
};

export default useLanguageDetection;
