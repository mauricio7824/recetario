import { db, uid } from './db.js';

const clave = (i) => (i.nombre || '').toLowerCase().trim() + '|' + (i.unidad || '');

// Agrega ingredientes a la lista; suma cantidades si ya existe el mismo ingrediente pendiente.
export async function agregarACompras(ingredientes) {
  await db.transaction('rw', db.compras, async () => {
    const actuales = (await db.compras.toArray()).filter((a) => !a.hecho);
    for (const i of ingredientes) {
      const ex = actuales.find((a) => clave(a) === clave(i));
      if (ex) {
        if (ex.cantidad != null && i.cantidad != null) {
          ex.cantidad += i.cantidad;
          await db.compras.update(ex.id, { cantidad: ex.cantidad });
        }
      } else {
        const nuevo = { id: uid(), cantidad: i.cantidad, unidad: i.unidad, nombre: i.nombre, hecho: 0 };
        await db.compras.add(nuevo);
        actuales.push(nuevo);
      }
    }
  });
}
