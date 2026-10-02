// Mantido só por compatibilidade com o main.jsx. A configuração real está em
// src/lib/firebase.js (um único initializeApp para o projeto inteiro).
export { default as app, analytics, auth, db, storage } from './lib/firebase.js';
