// sounglah-client-vite/src/components/InputTextZone/InputTextZone.tsx

import { Paper } from '@mantine/core';

import classes from './InputTextZone.module.scss';
import type { ChangeEvent } from 'react';
import { SourceLanguageCode, type LanguageSelect } from '@/types';
import { SounglahSelect } from '@/components/atoms/SounglahSelect';

export interface InputTextZoneProps {
    sourceTextChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    sourceLanguageChange?: (value: SourceLanguageCode) => void;
    noTextError?: boolean;
    srcLanguage: string;
    sourceText?: string;
    errorMessage?: string;
}

export const InputTextZone = ({ sourceText, noTextError, srcLanguage, sourceLanguageChange, sourceTextChange, errorMessage }: InputTextZoneProps) => {

    const inputLanguages: LanguageSelect[] = [
        { value: SourceLanguageCode.Français, label: "French" },
        { value: SourceLanguageCode.English, label: "English" },
    ];

    const paperClassName = noTextError ? `${classes.paper} ${classes.paperError}` : classes.paper;

    const handleSelectChange = (value: string) => {
        if (sourceLanguageChange && value) {
            sourceLanguageChange(value as SourceLanguageCode);
        }
    };

    return (
        <Paper
            shadow="xl"
            radius="md"
            p="md"
            className={paperClassName}
        >
            <SounglahSelect
                placeholder="Select source language"
                data={inputLanguages}
                onChange={handleSelectChange}
                value={inputLanguages.some(opt => opt.value === srcLanguage) ? srcLanguage : ""}
            />
            <div className={classes.textArea}>
                <textarea
                    placeholder="Type to translate"
                    required
                    onChange={sourceTextChange}
                    value={sourceText}
                />
            </div>

            {noTextError && errorMessage ? <p style={{ color: "red", marginBottom: 0 }}>{errorMessage}</p> : ""}

        </Paper>
    );
};