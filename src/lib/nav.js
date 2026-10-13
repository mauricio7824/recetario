import { useEffect, useState } from 'react';

const leer = () => location.hash.replace(/^#\/?/, '').split('/');

export function useRuta() {
  const [ruta, setRuta] = useState(leer);
  useEffect(() => {
    const f = () => { setRuta(leer()); window.scrollTo(0, 0); };
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export const ir = (p) => { location.hash = '#/' + p; };
export const atras = () => { if (history.length > 1) history.back(); else ir(''); };
