// ── Firebase — ÚNICO ponto de inicialização do projeto ───────────────────────
// Lê as chaves do arquivo .env (VITE_FIREBASE_*). Se o .env não existir
// (ex.: no deploy), usa os valores abaixo. Essas chaves da web NÃO são segredo:
// quem protege os dados são as REGRAS do Firestore/Storage (firestore.rules e
// storage.rules), não esconder a chave.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const DEFAULT_BUCKET_CANDIDATES = [
  'oliveira-veiculos.firebasestorage.app',
  'oliveira-veiculos.appspot.com',
];

export function getStoredBucket() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('custom_firebase_storage_bucket');
      if (stored) return stored.trim().replace(/^gs:\/\//, '');
    } catch (_) {}
  }
  return null;
}

export function getCurrentBucketName() {
  return (
    getStoredBucket() ||
    (env.VITE_FIREBASE_STORAGE_BUCKET ? env.VITE_FIREBASE_STORAGE_BUCKET.replace(/^gs:\/\//, '') : null) ||
    DEFAULT_BUCKET_CANDIDATES[0]
  );
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBFgCL8NZJmNSQ-IbnIfszOEQRaZ03e2L8',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'oliveira-veiculos.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'oliveira-veiculos',
  storageBucket: getCurrentBucketName(),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1039186424923',
  appId: env.VITE_FIREBASE_APP_ID || '1:1039186424923:web:4cdf61b2d07f54a75cfb7e',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8HY8D3VQ1X',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export let storage = getStorage(app, `gs://${getCurrentBucketName()}`);

export function updateStorageBucket(bucketName) {
  if (!bucketName) return storage;
  const clean = bucketName.trim().replace(/^gs:\/\//, '');
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('custom_firebase_storage_bucket', clean);
    } catch (_) {}
  }
  storage = getStorage(app, `gs://${clean}`);
  return storage;
}

export function getStorageInstance() {
  return storage;
}

/**
 * Verifica se o Cloud Storage do Firebase está provisionado e ativo.
 * Testa o bucket configurado e seus candidatos padrão (.firebasestorage.app e .appspot.com).
 * Se encontrar um bucket ativo, conecta automaticamente a ele.
 */
export async function assertStorageAvailable(preferredBucket = null) {
  const candidates = [
    preferredBucket,
    getStoredBucket(),
    env.VITE_FIREBASE_STORAGE_BUCKET,
    ...DEFAULT_BUCKET_CANDIDATES,
  ]
    .filter(Boolean)
    .map((b) => b.trim().replace(/^gs:\/\//, ''));

  const uniqueCandidates = [...new Set(candidates)];

  for (const bucket of uniqueCandidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?maxResults=1`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      // Se a resposta for diferente de 404 (ex.: 200, 401, 403), o bucket existe no Google Cloud!
      if (response.status !== 404) {
        updateStorageBucket(bucket);
        return { bucket, status: 'active', code: response.status };
      }
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error('O serviço do Firebase Storage não respondeu dentro do tempo limite. Confira sua conexão.');
      }
    }
  }

  const notFoundError = new Error('STORAGE_NOT_ACTIVATED');
  notFoundError.testedBuckets = uniqueCandidates;
  notFoundError.consoleUrl = 'https://console.firebase.google.com/project/oliveira-veiculos/storage';
  throw notFoundError;
}

// Analytics nunca pode derrubar o site: em navegador que bloqueia (Brave, modo
// privado, extensões) ele só é ignorado.
export const analytics = isSupported()
  .then((ok) => (ok ? getAnalytics(app) : null))
  .catch(() => null);

export default app;
