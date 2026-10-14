import { Account } from '../types';

export function getStoragePrefix(accountId: string): string {
  return accountId === 'acc_default' ? 'nexus_' : `nexus_${accountId}_`;
}

export function loadLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Quota exceeded guard
  }
}

// Background sync with Express Backend REST API
export async function syncWithBackend(accountId: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`/api/data/${accountId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
