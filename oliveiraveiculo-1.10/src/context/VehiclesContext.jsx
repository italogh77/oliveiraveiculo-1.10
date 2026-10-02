import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { VEHICLES_DATA } from '../data/vehiclesData';

const VehiclesContext = createContext(null);

// Remove o campo "id" antes de gravar: o id do veículo é o nome do documento no Firestore.
function withoutId(data) {
  const { id: _ignored, ...rest } = data;
  return rest;
}

function isPermissionError(err) {
  return err?.code === 'permission-denied' || /permission|Missing/i.test(err?.message || '');
}

function sanitizeVehicles(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((v) => {
    const text = `${v.modelo || ''} ${v.tituloCard || ''} ${v.marca || ''}`.toLowerCase();
    return !text.includes('c180') && !text.includes('c 180');
  });
}

export function VehiclesProvider({ children }) {
  const [vehicles, setVehicles] = useState(() => {
    try {
      const localSaved = sanitizeVehicles(JSON.parse(localStorage.getItem('localVehicles') || 'null'));
      return localSaved && localSaved.length > 0 ? localSaved : VEHICLES_DATA;
    } catch (_) {
      return VEHICLES_DATA;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLocalMode, setUseLocalMode] = useState(false);

  useEffect(() => {
    // Purga c180 do localStorage do navegador caso tenha sido salvo em teste
    try {
      const raw = localStorage.getItem('localVehicles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = sanitizeVehicles(parsed);
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('localVehicles', JSON.stringify(cleaned));
          }
        }
      }
    } catch (_) {}

    const localSaved = sanitizeVehicles(JSON.parse(localStorage.getItem('localVehicles') || 'null'));

    const q = query(collection(db, 'vehicles'), orderBy('criadoEm', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setVehicles(localSaved.length > 0 ? localSaved : VEHICLES_DATA);
        } else {
          // id vem por último: nunca deixa um campo "id" gravado no documento sobrescrever o real
          const docs = sanitizeVehicles(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
          setVehicles(docs);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error (Ativando Modo Local):', err.code, err.message);
        setUseLocalMode(true);
        setVehicles(localSaved.length > 0 ? localSaved : VEHICLES_DATA);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  function saveLocal(updater) {
    setVehicles((prev) => {
      const next = sanitizeVehicles(updater(prev));
      localStorage.setItem('localVehicles', JSON.stringify(next));
      return next;
    });
  }

  // Se o formulário mandar um id, ele vira o nome do documento. Assim, um clique duplo
  // ou uma nova tentativa grava SEMPRE o mesmo documento e nunca cria um segundo veículo.
  async function addVehicle(data) {
    const id = data.id ? String(data.id) : Date.now().toString();
    const addLocal = () =>
      saveLocal((prev) => [{ ...withoutId(data), id }, ...prev.filter((v) => v.id !== id)]);

    if (useLocalMode) {
      addLocal();
      return;
    }

    try {
      await setDoc(doc(db, 'vehicles', id), {
        ...withoutId(data),
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
    } catch (err) {
      if (isPermissionError(err)) {
        setUseLocalMode(true);
        addLocal();
      } else {
        throw err;
      }
    }
  }

  async function updateVehicle(id, data) {
    const updateLocal = () =>
      saveLocal((prev) => prev.map((v) => (v.id === id ? { ...v, ...withoutId(data) } : v)));

    if (useLocalMode) {
      updateLocal();
      return;
    }

    try {
      await updateDoc(doc(db, 'vehicles', id), {
        ...withoutId(data),
        atualizadoEm: serverTimestamp(),
      });
    } catch (err) {
      if (isPermissionError(err)) {
        setUseLocalMode(true);
        updateLocal();
      } else {
        throw err;
      }
    }
  }

  async function deleteVehicle(id) {
    const deleteLocal = () => saveLocal((prev) => prev.filter((v) => v.id !== id));

    if (useLocalMode) {
      deleteLocal();
      return;
    }

    try {
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (err) {
      if (isPermissionError(err)) {
        setUseLocalMode(true);
        deleteLocal();
      } else {
        throw err;
      }
    }
  }

  return (
    <VehiclesContext.Provider
      value={{ vehicles, loading, error, isLocalMode: useLocalMode, addVehicle, updateVehicle, deleteVehicle }}
    >
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error('useVehicles must be used within VehiclesProvider');
  return ctx;
}
