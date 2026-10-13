import { useEffect, useState } from 'react';

// URL temporal para mostrar un Blob (foto) guardado en IndexedDB.
export function useObjectUrl(blob) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) { setUrl(null); return; }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

// Mantiene la pantalla encendida mientras el componente está montado.
export function useWakeLock() {
  useEffect(() => {
    let lock;
    const pedir = async () => { try { lock = await navigator.wakeLock?.request('screen'); } catch { /* no soportado */ } };
    const vis = () => { if (document.visibilityState === 'visible') pedir(); };
    pedir();
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); lock?.release?.(); };
  }, []);
}
