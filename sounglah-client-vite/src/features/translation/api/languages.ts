import api from '@/api/axios';

export interface Language {
  id: number;
  name: string;
  iso_code?: string;
  region?: string;
  description?: string;
}

export interface CreateLanguageRequest {
  name: string;
  iso_code?: string;
  region?: string;
  description?: string;
}

export interface UpdateLanguageRequest {
  name?: string;
  iso_code?: string;
  region?: string;
  description?: string;
}

export interface LanguagesResponse {
  languages: Language[];
}

// Fetch all languages
export const getLanguages = async (): Promise<LanguagesResponse> => {
  const response = await api.get('/languages/list');
  return response.data;
};

// Create a new language
export const createLanguage = async (languageData: CreateLanguageRequest): Promise<Language> => {
  const response = await api.post('/languages', languageData);
  return response.data;
};

// Update a language
export const updateLanguage = async (languageId: number, data: UpdateLanguageRequest): Promise<Language> => {
  const response = await api.put(`/languages/${languageId}`, data);
  return response.data;
};

// Delete a language
export const deleteLanguage = async (languageId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/languages/${languageId}`);
  return response.data;
};

// Get a single language by ID
export const getLanguage = async (languageId: number): Promise<Language> => {
  const response = await api.get(`/languages/${languageId}`);
  return response.data;
}; 