import Dexie from 'dexie';

export const db = new Dexie('recetario');
db.version(1).stores({
  recetas: 'id, titulo, favorita, creada, *etiquetas',
  compras: 'id, hecho'
});

export const uid = () => crypto.randomUUID();
export const hoy = () => new Date().toISOString().slice(0, 10);
