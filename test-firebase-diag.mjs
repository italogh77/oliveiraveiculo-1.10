import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, listAll } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBFgCL8NZJmNSQ-IbnIfszOEQRaZ03e2L8',
  authDomain: 'oliveira-veiculos.firebaseapp.com',
  projectId: 'oliveira-veiculos',
  storageBucket: 'oliveira-veiculos.firebasestorage.app',
  messagingSenderId: '1039186424923',
  appId: '1:1039186424923:web:4cdf61b2d07f54a75cfb7e',
  measurementId: 'G-8HY8D3VQ1X',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function run() {
  console.log('--- Testing Firestore ---');
  try {
    const snap = await getDocs(collection(db, 'vehicles'));
    console.log('Vehicles count in Firestore:', snap.size);
    snap.forEach(doc => {
      const data = doc.data();
      console.log('Doc:', doc.id, 'Modelo:', data.modelo, 'Fotos:', data.fotos?.length, 'Foto sample:', typeof data.fotos?.[0] === 'object' ? data.fotos[0]?.url : data.fotos?.[0]);
    });
  } catch (e) {
    console.log('Firestore error:', e.message);
  }

  console.log('--- Testing Storage listAll ---');
  try {
    const listRes = await listAll(ref(storage, 'vehicles'));
    console.log('Storage prefixes:', listRes.prefixes.length, 'items:', listRes.items.length);
  } catch (e) {
    console.log('Storage error code:', e.code, 'message:', e.message);
  }
}

run().catch(console.error);
