import { parseIngrediente } from './units.js';
import { uid, hoy } from './db.js';
import { blobADataUrl, dataUrlABlob } from './imagen.js';

// ---------- Copia de seguridad (JSON propio) ----------
export async function exportarTodo(recetas) {
  const salida = [];
  for (const r of recetas) {
    salida.push({ ...r, foto: r.foto ? await blobADataUrl(r.foto) : null });
  }
  return JSON.stringify({ app: 'recetario', version: 1, recetas: salida }, null, 2);
}

export async function leerCopia(texto) {
  const d = JSON.parse(texto);
  if (d.app !== 'recetario' || !Array.isArray(d.recetas)) throw new Error('El archivo no es una copia de Recetario.');
  return Promise.all(d.recetas.map(async (r) => ({
    ...r,
    foto: r.foto ? await dataUrlABlob(r.foto) : null
  })));
}

// ---------- schema.org/Recipe (JSON-LD) ----------
function buscarReceta(nodo) {
  if (!nodo || typeof nodo !== 'object') return null;
  if (Array.isArray(nodo)) {
    for (const n of nodo) { const r = buscarReceta(n); if (r) return r; }
    return null;
  }
  const tipo = nodo['@type'];
  if (tipo === 'Recipe' || (Array.isArray(tipo) && tipo.includes('Recipe'))) return nodo;
  return buscarReceta(nodo['@graph']);
}

function minutosISO(s) {
  const m = /^P(?:T)?(?:(\d+)H)?(?:(\d+)M)?/i.exec(s || '') || /^PT(?:(\d+)H)?(?:(\d+)M)?/i.exec(s || '');
  return m ? (+m[1] || 0) * 60 + (+m[2] || 0) : 0;
}

function pasos(inst) {
  if (!inst) return [];
  if (typeof inst === 'string') return inst.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(inst)) return inst.flatMap(pasos);
  if (inst.itemListElement) return pasos(inst.itemListElement);
  return inst.text ? [String(inst.text).trim()] : [];
}

const limpiar = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

export function recetaDesdeTexto(texto) {
  let candidatos = [];
  const bloques = [...texto.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  if (bloques.length) candidatos = bloques.map((b) => b[1]);
  else candidatos = [texto];
  let fuente = null;
  for (const c of candidatos) {
    try { fuente = buscarReceta(JSON.parse(c)); } catch { /* siguiente */ }
    if (fuente) break;
  }
  if (!fuente) throw new Error('No encontré una receta (schema.org/Recipe) en ese contenido.');
  const rendimiento = parseInt(Array.isArray(fuente.recipeYield) ? fuente.recipeYield[0] : fuente.recipeYield, 10);
  const etiquetas = (Array.isArray(fuente.keywords) ? fuente.keywords : String(fuente.keywords || '').split(','))
    .map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 8);
  return {
    id: uid(),
    titulo: limpiar(fuente.name || 'Receta importada'),
    porciones: rendimiento || 4,
    tiempoMin: minutosISO(fuente.totalTime) || minutosISO(fuente.cookTime),
    etiquetas,
    ingredientes: (fuente.recipeIngredient || []).map((l) => parseIngrediente(limpiar(l))),
    pasos: pasos(fuente.recipeInstructions).map(limpiar),
    foto: null,
    notas: fuente.url ? `Fuente: ${fuente.url}` : '',
    favorita: 0,
    creada: hoy()
  };
}

export async function recetaDesdeUrl(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('No se pudo descargar la página.');
  return recetaDesdeTexto(await resp.text());
}
