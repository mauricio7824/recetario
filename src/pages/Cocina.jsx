import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db.js';
import { ir } from '../lib/nav.js';
import { useWakeLock } from '../lib/hooks.js';
import { lineaIngrediente } from '../lib/units.js';
import Temporizador from '../components/Temporizador.jsx';

export default function Cocina({ id }) {
  const r = useLiveQuery(async () => (await db.recetas.get(id)) ?? null, [id]);
  const [i, setI] = useState(0);
  useWakeLock();

  if (r === undefined) return <p className="vacio">Cargando…</p>;
  if (r === null) return <p className="vacio">Esta receta no existe. <a href="#/">Volver</a></p>;

  const pasos = r.pasos?.length ? r.pasos : ['Esta receta no tiene pasos todavía.'];
  return (
    <section className="cocina">
      <header>
        <button className="enlace" onClick={() => ir('r/' + r.id)}>Salir del modo cocina</button>
        <p className="progreso">Paso {i + 1} de {pasos.length}</p>
      </header>
      <p className="paso-grande">{pasos[i]}</p>
      <Temporizador />
      <div className="navpasos">
        <button className="sec" disabled={i === 0} onClick={() => setI(i - 1)}>Anterior</button>
        {i < pasos.length - 1
          ? <button onClick={() => setI(i + 1)}>Siguiente</button>
          : <button onClick={() => ir('r/' + r.id)}>Terminar</button>}
      </div>
      <details>
        <summary>Ingredientes</summary>
        <ul className="ingredientes">{(r.ingredientes || []).map((g, k) => <li key={k}>{lineaIngrediente(g)}</li>)}</ul>
      </details>
    </section>
  );
}
