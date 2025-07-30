import { type ChangeEvent, useState, useCallback } from 'react';
import { ScaleLoader } from "react-spinners";
import useLanguageDetection from '../../hooks/useLanguageDetection';
import useTypeWriter from '../../hooks/useTypeWriter';

import { InputTextZone } from '../InputText';
import { OutTextZone } from '../OutTextZone';

import classes from './TranslationBox.module.scss';
import { RightArrow } from '../Arrows';
import { Box } from '@mantine/core';
import AppButton from '../atoms/Button/Button';
import { 
  useLanguageDetection as useLanguageDetectionQuery, 
  useTranslationState, 
  langMap,
  type SourceLanguageCode 
} from '@/features/translation/hooks/useTranslationBox';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

export const TranslationBox = () => {
    const [sourceText, setSourceText] = useState<string>("");
    const [fullTranslation, setFullTranslation] = useState<string>("");
    const [noTextError, setNoTextError] = useState(false);

    // React Query hooks
    const { data: detectedLangCode } = useLanguageDetectionQuery(sourceText);
    const { translateText, isTranslating, error } = useTranslationState();

    // Map detected language code to SourceLanguageCode
    const autoDetectedSourceLanguage: SourceLanguageCode = detectedLangCode ? 
        (langMap[detectedLangCode] || SourceLanguageCode.Undetermined) : 
        SourceLanguageCode.Undetermined;

    const displayedTranslation = useTypeWriter(fullTranslation);

    const sourceTextChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        const text = event.target.value;
        setSourceText(text);
        setNoTextError(false);
    }, []);

    const handleSourceLanguageChange = useCallback((language: SourceLanguageCode) => {
        // This would update the detected language if needed
        // For now, we'll rely on the auto-detection
    }, []);

    const fetchTranslation = useCallback(async () => {
        setFullTranslation("");
        
        if (autoDetectedSourceLanguage === SourceLanguageCode.Undetermined) {
            setNoTextError(true);
            return;
        }
        
        if (sourceText.trim() === "") {
            setNoTextError(true);
            return;
        }

        setNoTextError(false);
        
        try {
            const translated = await translateText(autoDetectedSourceLanguage, sourceText);
            
            if (translated !== undefined) {
                setFullTranslation(translated.fullTranslation.join(" "));
            }
        } catch (error) {
            console.error("Error in fetchTranslation:", error);
            // Show error to user instead of recursive retry
            setNoTextError(true);
        }
    }, [autoDetectedSourceLanguage, sourceText, translateText]);

    return (
        <div>
            <div className={classes.translationArea}>
                <InputTextZone
                    sourceLanguageChange={handleSourceLanguageChange}
                    sourceTextChange={sourceTextChange}
                    noTextError={noTextError}
                    srcLanguage={autoDetectedSourceLanguage}
                    sourceText={sourceText}
                />
                {isTranslating ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div>
                        <Box hiddenFrom='md'>
                            <AppButton 
                                variant='primary' 
                                onClick={fetchTranslation}
                                disabled={!sourceText.trim() || autoDetectedSourceLanguage === SourceLanguageCode.Undetermined}
                            >
                                Translate
                            </AppButton>
                        </Box>
                        <Box visibleFrom="md">
                            <RightArrow />
                        </Box>
                    </div>
                )}
                <OutTextZone
                    translated={displayedTranslation}
                />
            </div>
            <Box visibleFrom='md' style={{display: "flex", justifyContent: "center"}}>
                <AppButton
                    variant='primary'
                    onClick={fetchTranslation}
                    disabled={!sourceText.trim() || autoDetectedSourceLanguage === SourceLanguageCode.Undetermined}
                >
                    Translate
                </AppButton>
            </Box>
        </div>
    );
};