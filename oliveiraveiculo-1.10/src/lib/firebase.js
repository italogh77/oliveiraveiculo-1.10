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

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBFgCL8NZJmNSQ-IbnIfszOEQRaZ03e2L8',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'oliveira-veiculos.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'oliveira-veiculos',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'oliveira-veiculos.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1039186424923',
  appId: env.VITE_FIREBASE_APP_ID || '1:1039186424923:web:4cdf61b2d07f54a75cfb7e',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8HY8D3VQ1X',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function assertStorageAvailable() {
  const bucket = firebaseConfig.storageBucket;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o?maxResults=1`, {
      signal: controller.signal,
    });
    if (response.status === 404) {
      throw new Error('O armazenamento de fotos não está ativo neste projeto Firebase. Use links do Drive ou configure um serviço gratuito de imagens.');
    }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('O serviço de fotos não respondeu. Confira a conexão e tente novamente.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// Analytics nunca pode derrubar o site: em navegador que bloqueia (Brave, modo
// privado, extensões) ele só é ignorado.
export const analytics = isSupported()
  .then((ok) => (ok ? getAnalytics(app) : null))
  .catch(() => null);

export default app;
