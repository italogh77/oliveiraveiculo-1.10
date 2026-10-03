import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll } from 'firebase/storage';

const buckets = [
  'oliveira-veiculos.firebasestorage.app',
  'oliveira-veiculos.appspot.com',
  'oliveira-veiculos'
];

for (const b of buckets) {
  const app = initializeApp({
    apiKey: 'AIzaSyBFgCL8NZJmNSQ-IbnIfszOEQRaZ03e2L8',
    authDomain: 'oliveira-veiculos.firebaseapp.com',
    projectId: 'oliveira-veiculos',
    storageBucket: b,
    appId: '1:1039186424923:web:4cdf61b2d07f54a75cfb7e',
  }, 'app-' + b);

  const storage = getStorage(app);
  try {
    console.log('\n--- Testing Bucket:', b);
    const listRes = await listAll(ref(storage, 'vehicles'));
    console.log('SUCCESS! Prefixes:', listRes.prefixes.length, 'Items:', listRes.items.length);
  } catch (e) {
    console.log('FAILED:', b);
    console.log('Code:', e.code);
    console.log('Message:', e.message);
    console.log('Server response:', e.serverResponse);
    console.log('Custom data:', JSON.stringify(e.customData || {}));
  }
}
