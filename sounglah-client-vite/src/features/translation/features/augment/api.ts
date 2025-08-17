import api from '@/api/axios';

export interface StartRunResponse { ok: boolean; runId: string }
export interface RunStatusResponse {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  metrics?: { exported?: number; clean?: number; augmented?: number };
  artifact_path?: string;
  created_at?: string;
  started_at?: string;
  finished_at?: string;
  error?: string;
}

export interface StartRunPayload { sample?: boolean; sample_size?: number }

export async function startAugment(payload?: StartRunPayload): Promise<StartRunResponse> {
  const { data } = await api.post<StartRunResponse>('/augment/admin/augment', payload ?? { sample: true, sample_size: 50 });
  return data;
}

export async function getRun(runId: string): Promise<RunStatusResponse> {
  const { data } = await api.get<RunStatusResponse>(`/augment/admin/augment/${runId}`);
  return data;
}


