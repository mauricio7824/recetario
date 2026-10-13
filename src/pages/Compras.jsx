import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db, uid } from '../lib/db.js';
import { parseIngrediente, lineaIngrediente } from '../lib/units.js';

export default function Compras() {
  const items = useLiveQuery(() => db.compras.toArray());
  const [nuevo, setNuevo] = useState('');
  if (!items) return <p className="vacio">Cargando…</p>;

  const pendientes = items.filter((i) => !i.hecho);
  const hechos = items.filter((i) => i.hecho);

  const agregar = async (e) => {
    e.preventDefault();
    if (!nuevo.trim()) return;
    await db.compras.add({ id: uid(), ...parseIngrediente(nuevo), hecho: 0 });
    setNuevo('');
  };

  const Item = ({ i }) => (
    <li>
      <label className={'item' + (i.hecho ? ' hecho' : '')}>
        <input type="checkbox" checked={!!i.hecho} onChange={() => db.compras.update(i.id, { hecho: i.hecho ? 0 : 1 })} />
        <span>{lineaIngrediente(i)}</span>
      </label>
    </li>
  );

  return (
    <section>
      <h2>Lista de compras</h2>
      <form className="agregar" onSubmit={agregar}>
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Añadir: 2 kg papa" aria-label="Añadir producto" />
        <button type="submit">Añadir</button>
      </form>
      {items.length === 0 && <p className="vacio">Tu lista está vacía. Añade ingredientes desde cualquier receta.</p>}
      <ul className="compras">{pendientes.map((i) => <Item key={i.id} i={i} />)}</ul>
      {hechos.length > 0 && (
        <>
          <h3>En el carrito</h3>
          <ul className="compras">{hechos.map((i) => <Item key={i.id} i={i} />)}</ul>
          <button className="sec" onClick={() => db.compras.bulkDelete(hechos.map((i) => i.id))}>Quitar los marcados</button>
        </>
      )}
    </section>
  );
}
