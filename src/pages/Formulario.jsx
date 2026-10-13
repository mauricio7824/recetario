import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, uid, hoy } from '../lib/db.js';
import { ir } from '../lib/nav.js';
import { parseIngredientes, ingredienteATexto } from '../lib/units.js';
import { reducirImagen } from '../lib/imagen.js';
import { useObjectUrl } from '../lib/hooks.js';

function Campos({ inicial }) {
  const nueva = !inicial.id;
  const [titulo, setTitulo] = useState(inicial.titulo || '');
  const [porciones, setPorciones] = useState(inicial.porciones ?? 4);
  const [tiempo, setTiempo] = useState(inicial.tiempoMin || '');
  const [etiquetas, setEtiquetas] = useState((inicial.etiquetas || []).join(', '));
  const [ings, setIngs] = useState((inicial.ingredientes || []).map(ingredienteATexto).join('\n'));
  const [pasos, setPasos] = useState((inicial.pasos || []).join('\n'));
  const [notas, setNotas] = useState(inicial.notas || '');
  const [foto, setFoto] = useState(inicial.foto || null);
  const [error, setError] = useState('');
  const vista = useObjectUrl(foto);

  const elegirFoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setFoto(await reducirImagen(f)); } catch { setError('No se pudo leer la imagen.'); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) { setError('Escribe un título para la receta.'); return; }
    const id = inicial.id || uid();
    await db.recetas.put({
      id,
      titulo: titulo.trim(),
      porciones: Math.max(0, parseInt(porciones, 10) || 0),
      tiempoMin: Math.max(0, parseInt(tiempo, 10) || 0),
      etiquetas: etiquetas.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      ingredientes: parseIngredientes(ings),
      pasos: pasos.split('\n').map((s) => s.trim()).filter(Boolean),
      foto,
      notas: notas.trim(),
      favorita: inicial.favorita || 0,
      creada: inicial.creada || hoy()
    });
    ir('r/' + id);
  };

  return (
    <form className="form" onSubmit={guardar}>
      <h2>{nueva ? 'Nueva receta' : 'Editar receta'}</h2>
      <label>Título
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} autoFocus={nueva} />
      </label>
      <div className="dos">
        <label>Porciones
          <input type="number" inputMode="numeric" min="0" value={porciones} onChange={(e) => setPorciones(e.target.value)} />
        </label>
        <label>Tiempo (min)
          <input type="number" inputMode="numeric" min="0" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
        </label>
      </div>
      <label>Etiquetas, separadas por comas
        <input value={etiquetas} onChange={(e) => setEtiquetas(e.target.value)} placeholder="sopa, bolivia" />
      </label>
      <label>Ingredientes, uno por línea
        <textarea rows="7" value={ings} onChange={(e) => setIngs(e.target.value)}
          placeholder={'500 g carne molida\n1 1/2 tazas de arroz\n2 cebollas\nsal'} />
        <small>Escribe la cantidad primero (admite 1/2, 1 1/2 o 0,5) y la unidad si la hay. Así se podrá escalar.</small>
      </label>
      <label>Pasos, uno por línea
        <textarea rows="7" value={pasos} onChange={(e) => setPasos(e.target.value)} />
      </label>
      <label>Notas
        <textarea rows="3" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </label>
      <label>Foto
        <input type="file" accept="image/*" onChange={elegirFoto} />
      </label>
      {vista && (
        <div className="previa">
          <img src={vista} alt="Vista previa" />
          <button type="button" className="sec" onClick={() => setFoto(null)}>Quitar foto</button>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="acciones">
        <button type="submit">Guardar receta</button>
        <button type="button" className="sec" onClick={() => history.back()}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Formulario({ id }) {
  const r = useLiveQuery(async () => (id ? (await db.recetas.get(id)) ?? null : {}), [id]);
  if (r === undefined) return <p className="vacio">Cargando…</p>;
  if (r === null) return <p className="vacio">Esta receta no existe. <a href="#/">Volver</a></p>;
  return <Campos inicial={r} />;
}
