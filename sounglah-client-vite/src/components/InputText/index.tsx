// sounglah-client-vite/src/components/InputTextZone/InputTextZone.tsx

import { Paper, Select, type ComboboxItem } from '@mantine/core';
import { SourceLanguageCode, type Language } from '../../types'; // Assuming types are defined elsewhere

import classes from './InputTextZone.module.scss';
import type { ChangeEvent } from 'react';

export interface InputTextZoneProps {
    sourceTextChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    sourceLanguageChange?: (value: SourceLanguageCode) => void;
    noTextError?: boolean;
    srcLanguage: string;
    sourceText?: string;
}

export const InputTextZone = ({ sourceText, noTextError, srcLanguage, sourceLanguageChange, sourceTextChange }: InputTextZoneProps) => {

    const inputLanguages: Language[] = [
        { value: SourceLanguageCode.Français, label: "French" },
        { value: SourceLanguageCode.English, label: "English" },
    ];

    const paperClassName = noTextError ? `${classes.paper } ${classes.paperError}` : classes.paper ;

    const handleSelectChange = (value: string | null, option: ComboboxItem) => {

        if (sourceLanguageChange && value !== null && option.value === value) {
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
            <Select
                className={classes.select}
                placeholder="Select source language"
                data={inputLanguages}
                radius="sm"
                onChange={handleSelectChange}
                value={srcLanguage}
                classNames={{
                    input: classes.selectInput,
                    dropdown: classes.selectDropdown,
                }}
               
            />
            <div className={classes.textArea}>
                <textarea
                    placeholder="Type to translate"
                    required
                    onChange={sourceTextChange}
                    value={sourceText}
                />
            </div>

            {noTextError ? <p style={{ color: "red", marginBottom: 0 }}>Please enter some text</p> : ""}

        </Paper>
    );
};