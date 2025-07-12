export interface Language {
  id: number;
  name: string;
  iso_code: string;
  region?: string;
  description?: string;
}

export interface Translation {
  id: number;
  source_text: string;
  target_text: string;
  source_language: Language;
  target_language: Language;
  status: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetTranslationsResponse {
  translations: Translation[];
  total_count: number;
  limit: number;
  offset: number | null;
  next_after_id: number | null;
} 