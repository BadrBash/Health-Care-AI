export type DiagnosisApiResult = {
  condition: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | string;
  description: string;
  recommendations: string[];
};

export type RecentDiagnosis = {
  id: number;
  patient: string;
  date: string;
  condition: string;
  status: string;
};

export async function fetchDiagnosis(symptoms: string): Promise<DiagnosisApiResult[]> {
  const base = (import.meta.env.VITE_DJANGO_API_URL as string) || '';
  const endpoint = base ? `${base.replace(/\/$/, '')}/diagnose/` : '/api/diagnose/';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Django API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function fetchRecentDiagnoses(): Promise<RecentDiagnosis[]> {
  const base = (import.meta.env.VITE_DJANGO_API_URL as string) || '';
  const endpoint = base ? `${base.replace(/\/$/, '')}/diagnoses/` : '/api/diagnoses/';

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Django API error ${res.status}: ${text}`);
  }

  return res.json();
}
