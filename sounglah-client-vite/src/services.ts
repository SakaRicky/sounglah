// import { NewStudent, Student } from "types";
import api from "./api/axios";
import type { SourceLanguageCode } from "./types";

// const baseURL = "http://10.0.0.73:5000/api";
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
console.log("🚀 ~ baseURL:", baseURL);

export const SUPPORTED_INPUT_LANGUAGES = ['en', 'fr'];

export interface LangDetectResponse {
	language: SourceLanguageCode;
	confidence: string;
}

export const detectLangFromText = async (textToDetectLang: string): Promise<string> => {

	try {
		const response = await api.post<LangDetectResponse>(
			`/detectlang`,
			{ text_to_detect_lang: textToDetectLang }
		);
		
		return response.data.language;
	} catch (error: unknown) {
		console.log(error);

		throw new Error(`Error in translate ${error}`);
	}
};

export interface TranslateProps {
	srcLanguage: string;
	text: string;
}

export interface TranslateResponse {
	translate: Translate
}

export interface Translate {
	language: SourceLanguageCode;
	targetLanguage: string;
	srcText: string;
	fullTranslation: string[];
}

export const translate = async ({ srcLanguage, text }: TranslateProps) => {

	try {
		const response = await api.post<TranslateResponse>(`/translate`, {
			srcLanguage: srcLanguage,
			targetLanguage: "med",
			text: text,
		});
		

		return response.data.translate;
	} catch (error: unknown) {
		console.log(error);

		throw new Error(`Error in translate ${error}`);
	}
};
