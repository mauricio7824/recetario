import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db.js';
import { ir } from '../lib/nav.js';
import { useObjectUrl } from '../lib/hooks.js';
import { ejemplos } from '../lib/ejemplos.js';

function Fila({ r }) {
  const foto = useObjectUrl(r.foto);
  return (
    <li>
      <a className="fila" href={`#/r/${r.id}`}>
        {foto ? <img src={foto} alt="" loading="lazy" /> : <span className="sinfoto" aria-hidden="true">{r.titulo.slice(0, 1)}</span>}
        <span className="fila-texto">
          <span className="fila-titulo">{r.titulo}{r.favorita ? <span className="fav" title="Favorita"> ★</span> : null}</span>
          <span className="fila-meta">
            {[r.tiempoMin ? `${r.tiempoMin} min` : '', r.porciones ? `${r.porciones} porciones` : '', (r.etiquetas || []).join(', ')]
              .filter(Boolean).join(' · ')}
          </span>
        </span>
      </a>
    </li>
  );
}

export default function Lista() {
  const recetas = useLiveQuery(() => db.recetas.toArray());
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [soloFav, setSoloFav] = useState(false);

  const etiquetas = useMemo(
    () => [...new Set((recetas || []).flatMap((r) => r.etiquetas || []))].sort(),
    [recetas]
  );

  const visibles = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (recetas || [])
      .filter((r) => !soloFav || r.favorita)
      .filter((r) => !tag || (r.etiquetas || []).includes(tag))
      .filter((r) => !n || r.titulo.toLowerCase().includes(n) ||
        (r.ingredientes || []).some((i) => i.nombre.toLowerCase().includes(n)))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
  }, [recetas, q, tag, soloFav]);

  if (!recetas) return <p className="vacio">Cargando…</p>;

  if (recetas.length === 0) {
    return (
      <section className="vacio">
        <h2>Aún no tienes recetas</h2>
        <p>Escribe la primera, importa una copia de seguridad o prueba con dos recetas de ejemplo.</p>
        <div className="acciones">
          <button onClick={() => ir('nueva')}>Nueva receta</button>
          <button className="sec" onClick={() => db.recetas.bulkAdd(ejemplos())}>Cargar ejemplos</button>
          <button className="sec" onClick={() => ir('ajustes')}>Importar</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="busqueda">
        <input type="search" placeholder="Buscar por título o ingrediente" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar recetas" />
      </div>
      <div className="chips" role="group" aria-label="Filtros">
        <button className={'chip' + (soloFav ? ' on' : '')} aria-pressed={soloFav} onClick={() => setSoloFav(!soloFav)}>★ Favoritas</button>
        {etiquetas.map((t) => (
          <button key={t} className={'chip' + (tag === t ? ' on' : '')} aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>{t}</button>
        ))}
      </div>
      {visibles.length === 0 ? (
        <p className="vacio">Ninguna receta coincide con tu búsqueda.</p>
      ) : (
        <ul className="lista">{visibles.map((r) => <Fila key={r.id} r={r} />)}</ul>
      )}
      <button className="flotante" onClick={() => ir('nueva')} aria-label="Nueva receta">+</button>
    </section>
  );
}
