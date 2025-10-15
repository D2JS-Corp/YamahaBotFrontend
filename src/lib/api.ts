// Pequeño cliente para consultar la API del robot
// Base configurable por variable de entorno VITE_API_BASE_URL

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/robot';

/**
 * Obtiene el último valor publicado para un tópico dado.
 * La forma del payload depende del backend; devolvemos el JSON tal cual.
 */
export async function fetchLatestTopic<T = unknown>(topic: string): Promise<T> {
  const url = `${API_BASE_URL}/latest/${encodeURIComponent(topic)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error ${res.status} al consultar ${url}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Helpers de extracción segura para distintos formatos de payload
export function getNumericValue(payload: any, keys: string[] = []): number | undefined {
  if (typeof payload === 'number') return payload;
  for (const k of keys) {
    const v = payload?.[k];
    if (typeof v === 'number') return v;
  }
  return undefined;
}

export function getStringValue(payload: any, keys: string[] = []): string | undefined {
  if (typeof payload === 'string') return payload;
  for (const k of keys) {
    const v = payload?.[k];
    if (typeof v === 'string') return v;
  }
  if (payload != null) return String(payload);
  return undefined;
}

export function getXY(payload: any, xKeys: string[] = ['x'], yKeys: string[] = ['y']): { x: number; y: number } | undefined {
  const xKey = xKeys.find((k) => typeof payload?.[k] === 'number');
  const yKey = yKeys.find((k) => typeof payload?.[k] === 'number');
  if (xKey && yKey) {
    return { x: payload[xKey], y: payload[yKey] };
  }
  return undefined;
}
