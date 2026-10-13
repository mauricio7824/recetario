import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db.js';
import { ir, atras } from '../lib/nav.js';
import { useObjectUrl } from '../lib/hooks.js';
import { convertir, escalar, lineaIngrediente } from '../lib/units.js';
import { agregarACompras } from '../lib/compras.js';

export default function Receta({ id }) {
  const r = useLiveQuery(async () => (await db.recetas.get(id)) ?? null, [id]);
  const [porc, setPorc] = useState(null);
  const [modo, setModo] = useState('original');
  const [aviso, setAviso] = useState('');
  const foto = useObjectUrl(r?.foto);

  if (r === undefined) return <p className="vacio">Cargando…</p>;
  if (r === null) return <p className="vacio">Esta receta no existe. <a href="#/">Volver a la lista</a></p>;

  const p = porc ?? r.porciones ?? 1;
  const factor = r.porciones ? p / r.porciones : 1;
  const ingredientes = (r.ingredientes || []).map((i) => convertir(escalar(i, factor), modo));

  const alternarFav = () => db.recetas.update(r.id, { favorita: r.favorita ? 0 : 1 });
  const borrar = async () => {
    if (confirm(`¿Eliminar «${r.titulo}»? Esta acción no se puede deshacer.`)) {
      await db.recetas.delete(r.id);
      ir('');
    }
  };
  const aCompras = async () => {
    await agregarACompras(ingredientes);
    setAviso('Ingredientes añadidos a la lista de compras.');
  };

  return (
    <article className="receta">
      <button className="enlace" onClick={atras}>← Volver</button>
      {foto && <img className="portada" src={foto} alt="" />}
      <h2 className="titulo">{r.titulo}</h2>
      <p className="meta">
        {[r.tiempoMin ? `${r.tiempoMin} min` : '', (r.etiquetas || []).join(', ')].filter(Boolean).join(' · ')}
      </p>

      <div className="acciones">
        <button onClick={() => ir('cocina/' + r.id)}>Cocinar</button>
        <button className="sec" onClick={alternarFav} aria-pressed={!!r.favorita}>{r.favorita ? '★ Favorita' : '☆ Favorita'}</button>
        <button className="sec" onClick={() => ir('editar/' + r.id)}>Editar</button>
      </div>

      <section>
        <h3>Ingredientes</h3>
        <div className="controles">
          {r.porciones ? (
            <div className="porciones" role="group" aria-label="Porciones">
              <button className="sec redondo" onClick={() => setPorc(Math.max(1, p - 1))} aria-label="Menos porciones">−</button>
              <span><strong className="grande">{p}</strong> porciones</span>
              <button className="sec redondo" onClick={() => setPorc(p + 1)} aria-label="Más porciones">+</button>
            </div>
          ) : null}
          <label className="unidades">
            Unidades
            <select value={modo} onChange={(e) => setModo(e.target.value)}>
              <option value="original">Como están escritas</option>
              <option value="metrico">Métrico</option>
              <option value="imperial">Imperial</option>
            </select>
          </label>
        </div>
        <ul className="ingredientes">
          {ingredientes.map((i, k) => <li key={k}>{lineaIngrediente(i)}</li>)}
        </ul>
        <button className="sec" onClick={aCompras}>Añadir a la lista de compras</button>
        {aviso && <p className="aviso" role="status">{aviso} <a href="#/compras">Ver lista</a></p>}
      </section>

      <section>
        <h3>Preparación</h3>
        <ol className="pasos">{(r.pasos || []).map((s, k) => <li key={k}>{s}</li>)}</ol>
      </section>

      {r.notas && (<section><h3>Notas</h3><p className="notas">{r.notas}</p></section>)}

      <button className="peligro" onClick={borrar}>Eliminar receta</button>
    </article>
  );
}
