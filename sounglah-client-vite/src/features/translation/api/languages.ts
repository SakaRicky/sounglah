import api from '@/api/axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  const response = await api.get(`${API_BASE_URL}/languages/list`);
  return response.data;
};

// Create a new language
export const createLanguage = async (languageData: CreateLanguageRequest): Promise<Language> => {
  const response = await api.post(`${API_BASE_URL}/languages`, languageData);
  return response.data;
};

// Update a language
export const updateLanguage = async (languageId: number, data: UpdateLanguageRequest): Promise<Language> => {
  const response = await api.put(`${API_BASE_URL}/languages/${languageId}`, data);
  return response.data;
};

// Delete a language
export const deleteLanguage = async (languageId: number): Promise<{ message: string }> => {
  const response = await api.delete(`${API_BASE_URL}/languages/${languageId}`);
  return response.data;
};

// Get a single language by ID
export const getLanguage = async (languageId: number): Promise<Language> => {
  const response = await api.get(`${API_BASE_URL}/languages/${languageId}`);
  return response.data;
}; 