import { useRef, useState } from 'react';
import { db } from '../lib/db.js';
import { ir } from '../lib/nav.js';
import { exportarTodo, leerCopia, recetaDesdeTexto, recetaDesdeUrl } from '../lib/importar.js';
import { ejemplos } from '../lib/ejemplos.js';

export default function Ajustes() {
  const archivo = useRef();
  const [msg, setMsg] = useState('');
  const [url, setUrl] = useState('');
  const [pegado, setPegado] = useState('');
  const [cargando, setCargando] = useState(false);

  const exportar = async () => {
    const recetas = await db.recetas.toArray();
    const blob = new Blob([await exportarTodo(recetas)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `recetario-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg(`Copia creada con ${recetas.length} recetas.`);
  };

  const importar = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const recetas = await leerCopia(await f.text());
      await db.recetas.bulkPut(recetas);
      setMsg(`Se importaron ${recetas.length} recetas.`);
    } catch (err) {
      setMsg(err.message || 'No se pudo leer el archivo.');
    }
    e.target.value = '';
  };

  const guardarImportada = async (r) => { await db.recetas.add(r); ir('editar/' + r.id); };

  const desdeUrl = async () => {
    setCargando(true); setMsg('');
    try { await guardarImportada(await recetaDesdeUrl(url.trim())); }
    catch {
      setMsg('Ese sitio no permite descargar la página desde el navegador. Abre la página de la receta, copia su código fuente y pégalo abajo.');
    }
    setCargando(false);
  };

  const desdePegado = async () => {
    try { await guardarImportada(recetaDesdeTexto(pegado)); }
    catch (err) { setMsg(err.message); }
  };

  return (
    <section className="ajustes">
      <h2>Ajustes</h2>

      <h3>Copia de seguridad</h3>
      <p>Tus recetas viven solo en este dispositivo. Descarga una copia para guardarlas o pasarlas a otro teléfono.</p>
      <div className="acciones">
        <button onClick={exportar}>Exportar recetas</button>
        <button className="sec" onClick={() => archivo.current.click()}>Importar copia</button>
        <input ref={archivo} type="file" accept="application/json,.json" hidden onChange={importar} />
      </div>

      <h3>Importar desde una página web</h3>
      <p>Funciona con páginas que incluyen datos estructurados de receta (schema.org).</p>
      <div className="agregar">
        <input type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Dirección de la receta" />
        <button onClick={desdeUrl} disabled={!url.trim() || cargando}>{cargando ? 'Buscando…' : 'Importar'}</button>
      </div>
      <label className="pegar">Pegar código fuente o JSON-LD
        <textarea rows="4" value={pegado} onChange={(e) => setPegado(e.target.value)} />
      </label>
      <button className="sec" onClick={desdePegado} disabled={!pegado.trim()}>Importar lo pegado</button>

      {msg && <p className="aviso" role="status">{msg}</p>}

      <h3>Datos de ejemplo</h3>
      <button className="sec" onClick={async () => { await db.recetas.bulkAdd(ejemplos()); setMsg('Se añadieron 2 recetas de ejemplo.'); }}>Añadir recetas de ejemplo</button>

      <h3>Acerca de</h3>
      <p>Recetario es software libre (licencia MIT). Sin cuentas, sin rastreo y sin servidores: todo se guarda en tu dispositivo.</p>
    </section>
  );
}
