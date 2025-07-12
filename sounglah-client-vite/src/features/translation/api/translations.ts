import api from "@/api/axios";
import type { Language, Translation } from './types';

export interface KeysetTranslationsResponse {
  translations: Translation[];
  next_cursor?: string;
  prev_cursor?: string;
  total?: number;
}

export async function getTranslations(params?: Record<string, unknown>): Promise<KeysetTranslationsResponse> {
  const response = await api.get<KeysetTranslationsResponse>('/translations/list', { params });
  return response.data;
}

export async function getLanguages(): Promise<{ languages: Language[] }> {
  const response = await api.get<{ languages: Language[] }>('/languages/list');
  return response.data;
}

export async function createTranslation(payload: {
  source_text: string;
  target_text: string;
  source_lang_id: number;
  target_lang_id: number;
}): Promise<Translation> {
  const response = await api.post('/translations/list', payload);
  return response.data;
}

export async function updateTranslation(id: number, payload: {
  source_text: string;
  target_text: string;
  source_lang_id: number;
  target_lang_id: number;
  status?: string;
  domain?: string | null;
}): Promise<Translation> {
  const response = await api.put(`/translations/${id}`, payload);
  return response.data;
}

export async function bulkUpdateTranslations(ids: number[], status: string) {
  const response = await api.post('/translations/bulk_update', { ids, status });
  return response.data;
}

export interface UploadCSVResult {
  added: number;
  total: number;
  results: Array<{
    row: number;
    source_text: string;
    target_text: string;
    source_language: string;
    target_language: string;
    status: 'added' | 'error';
    error?: string;
  }>;
}

export async function uploadTranslationsCSV(rows: Array<{
  source_text: string;
  target_text: string;
  source_language: string;
  target_language: string;
  domain?: string;
}>): Promise<UploadCSVResult> {
  const response = await api.post('/translations/upload_csv', rows);
  return response.data;
} 