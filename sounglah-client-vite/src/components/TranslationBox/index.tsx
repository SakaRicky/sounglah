import { type ChangeEvent, useState, useCallback, useEffect } from 'react';
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
  langMap
} from '@/features/translation/hooks/useTranslationBox';
import { SourceLanguageCode } from '@/types';
import { ScaleLoader } from 'react-spinners';

export const TranslationBox = () => {
    const [sourceText, setSourceText] = useState<string>("");
    const [fullTranslation, setFullTranslation] = useState<string>("");
    const [noTextError, setNoTextError] = useState(false);
    const [manualLanguage, setManualLanguage] = useState<SourceLanguageCode | null>(null);
    const [previousDetectedLanguage, setPreviousDetectedLanguage] = useState<SourceLanguageCode>(SourceLanguageCode.Undetermined);

    // React Query hooks
    const { data: detectedLangCode, isLoading: isDetecting } = useLanguageDetectionQuery(sourceText);
    const { translateText, isTranslating } = useTranslationState();

    // Determine the source language - manual selection takes precedence over auto-detection
    const autoDetectedSourceLanguage: SourceLanguageCode = detectedLangCode ? 
        (langMap[detectedLangCode] || SourceLanguageCode.Undetermined) : 
        SourceLanguageCode.Undetermined;

    // Update previous detected language when we get new data
    useEffect(() => {
        if (autoDetectedSourceLanguage !== SourceLanguageCode.Undetermined) {
            setPreviousDetectedLanguage(autoDetectedSourceLanguage);
        }
    }, [autoDetectedSourceLanguage]);

    // Use previous detected language while loading to prevent flickering
    const currentSourceLanguage = manualLanguage || 
        (isDetecting ? previousDetectedLanguage : autoDetectedSourceLanguage);

    const displayedTranslation = useTypeWriter({ fullTranslatedText: fullTranslation });

    const sourceTextChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        const text = event.target.value;
        setSourceText(text);
        setNoTextError(false);
    }, []);

    const handleSourceLanguageChange = useCallback((language: SourceLanguageCode) => {
        setManualLanguage(language);
        setNoTextError(false);
    }, []);

    const fetchTranslation = useCallback(async () => {
        setFullTranslation("");
        
        if (currentSourceLanguage === SourceLanguageCode.Undetermined) {
            setNoTextError(true);
            return;
        }
        
        if (sourceText.trim() === "") {
            setNoTextError(true);
            return;
        }

        setNoTextError(false);
        
        try {
            const translated = await translateText(currentSourceLanguage, sourceText);
            
            if (translated !== undefined) {
                setFullTranslation(translated.fullTranslation.join(" "));
            }
        } catch (error) {
            console.error("Error in fetchTranslation:", error);
            // Show error to user instead of recursive retry
            setNoTextError(true);
        }
    }, [currentSourceLanguage, sourceText, translateText]);

    // Determine if we should show an error
    const shouldShowError = noTextError && (
        sourceText.trim() === "" || 
        currentSourceLanguage === SourceLanguageCode.Undetermined
    );

    // Get appropriate error message
    const getErrorMessage = () => {
        if (sourceText.trim() === "") {
            return "Please enter some text";
        }
        if (currentSourceLanguage === SourceLanguageCode.Undetermined) {
            return "Please select a source language or enter text for auto-detection";
        }
        return "";
    };

    return (
        <div>
            <div className={classes.translationArea}>
                <InputTextZone
                    sourceLanguageChange={handleSourceLanguageChange}
                    sourceTextChange={sourceTextChange}
                    noTextError={shouldShowError}
                    srcLanguage={currentSourceLanguage}
                    sourceText={sourceText}
                    errorMessage={getErrorMessage()}
                />
                {isTranslating ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        padding: '8px'
                    }}>
                        <ScaleLoader width="10px" />
                    </div>
                ) : (
                    <div>
                        <Box hiddenFrom='md'>
                            <AppButton 
                                variant='primary' 
                                onClick={fetchTranslation}
                                disabled={!sourceText.trim() || currentSourceLanguage === SourceLanguageCode.Undetermined}
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
                    disabled={!sourceText.trim() || currentSourceLanguage === SourceLanguageCode.Undetermined}
                >
                    Translate
                </AppButton>
            </Box>
        </div>
    );
};