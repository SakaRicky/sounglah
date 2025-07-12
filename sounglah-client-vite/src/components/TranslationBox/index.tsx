import { type ChangeEvent, useState } from 'react';

import { translate, type Translate } from "../../services";
import { ScaleLoader } from "react-spinners";
import useLanguageDetection from '../../hooks/useLanguageDetection'; // Assuming custom hook exists
import useTypeWriter from '../../hooks/useTypeWriter'; // Assuming custom hook exists

import { InputTextZone } from '../InputText';
import { OutTextZone } from '../OutTextZone';

import classes from './TranslationBox.module.scss';
import { RightArrow } from '../Arrows';
import { Box } from '@mantine/core';
import AppButton from '../atoms/Button/Button';

export const TranslationBox = () => {
    const [sourceText, setSourceText] = useState<string>("");
    const [fullTranslation, setFullTranslation] = useState<string>("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [noTextError, setNoTextError] = useState(false);

    const { autoDetectedSourceLanguage, handleSourceLanguageChange } = useLanguageDetection(sourceText);
    const displayedTranslation = useTypeWriter(fullTranslation);

    const sourceTextChange = async (event: ChangeEvent<HTMLTextAreaElement>) => {
        const text = event.target.value;
        setSourceText(text);
        setNoTextError(false);
    };

    const fetchTranslation = async () => {
        setFullTranslation("");
        if (autoDetectedSourceLanguage === "und") {
            setNoTextError(true);
        } else if (sourceText.trim() === "") {
            setNoTextError(true);
        } else {
            setNoTextError(false);
            try {
                setIsTranslating(true);
                const translated: Translate | undefined = await translate({
                    srcLanguage: autoDetectedSourceLanguage,
                    text: sourceText,
                });

                if (translated !== undefined) {
                    setFullTranslation(translated.fullTranslation.join(" "));
                    setIsTranslating(false);
                }
            } catch (error) {
                console.log("Error in fetchTranslation App", error);
                setSourceText(sourceText); // This line seems potentially problematic, setting text back on error?
                // Recursive retry on error after 25s? Be careful with this pattern.
                // Consider adding error state or user feedback instead of recursive calls.
                setTimeout(() => {
                    fetchTranslation();
                }, 25000);
            }
        }
    };

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
                    <ScaleLoader width={"10px"} />
                ) : (
                    <div>
                        <Box hiddenFrom='md'>
                            <AppButton variant='primary' onClick={fetchTranslation}>
                                Translate
                            </AppButton>
                        </Box>
                        <Box
                            visibleFrom="md"
                        >
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
                >
                    Translate
                </AppButton>
            </Box>
        </div>
    );
};