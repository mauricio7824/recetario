// Cantidades, unidades y escalado de ingredientes.

const UNIDADES = {
  g: 'g', gr: 'g', kg: 'kg', ml: 'ml', l: 'l', lt: 'l', lts: 'l',
  taza: 'taza', tazas: 'taza',
  cda: 'cda', cdas: 'cda', cucharada: 'cda', cucharadas: 'cda',
  cdta: 'cdta', cdtas: 'cdta', cucharadita: 'cdta', cucharaditas: 'cdta',
  oz: 'oz', lb: 'lb', libra: 'lb', libras: 'lb',
  pizca: 'pizca', pizcas: 'pizca'
};

export function parseCantidad(s) {
  s = String(s).trim().replace(',', '.');
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[1] + +m[2] / +m[3];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[1] / +m[2];
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

// "1 1/2 tazas de harina" -> { cantidad: 1.5, unidad: 'taza', nombre: 'harina' }
export function parseIngrediente(linea) {
  const m = linea.trim().match(/^((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+(?:[.,]\d+)?))?\s*(.*)$/);
  let cantidad = m && m[1] ? parseCantidad(m[1]) : null;
  let resto = (m ? m[2] : linea).trim();
  let unidad = '';
  if (cantidad != null) {
    const w = resto.match(/^([a-záéíóúñ]+)\.?\s*(.*)$/i);
    if (w && UNIDADES[w[1].toLowerCase()]) {
      unidad = UNIDADES[w[1].toLowerCase()];
      resto = w[2].replace(/^de\s+/i, '');
    }
  }
  return { cantidad, unidad, nombre: resto };
}

export const parseIngredientes = (texto) =>
  texto.split('\n').map((l) => l.trim()).filter(Boolean).map(parseIngrediente);

const num = (n) => String(Math.round(n * 100) / 100);
export const ingredienteATexto = (i) =>
  [i.cantidad != null ? num(i.cantidad) : '', i.unidad, i.nombre].filter(Boolean).join(' ');

const FR = [[0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'],
  [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'], [1, '']];

// Formato para mostrar: 1.5 -> "1½"
export function fmt(n) {
  if (n == null) return '';
  if (n >= 20) return num(n);
  const w = Math.floor(n);
  const f = n - w;
  for (const [v, s] of FR) {
    if (Math.abs(f - v) < 0.03) {
      const entero = v === 1 ? w + 1 : w;
      return `${entero || ''}${s}` || '0';
    }
  }
  return num(n);
}

export const escalar = (ing, factor) => ({
  ...ing,
  cantidad: ing.cantidad != null ? ing.cantidad * factor : null
});

const A_IMPERIAL = { g: ['oz', 1 / 28.3495], kg: ['lb', 2.20462], ml: ['fl oz', 1 / 29.5735], l: ['fl oz', 33.814] };
const A_METRICO = { oz: ['g', 28.3495], lb: ['g', 453.592], 'fl oz': ['ml', 29.5735] };

// modo: 'original' | 'metrico' | 'imperial'
export function convertir(ing, modo) {
  if (ing.cantidad == null || modo === 'original') return ing;
  const t = (modo === 'imperial' ? A_IMPERIAL : A_METRICO)[ing.unidad];
  if (!t) return ing;
  const cantidad = ing.cantidad * t[1];
  return { ...ing, cantidad: modo === 'metrico' ? Math.round(cantidad) : cantidad, unidad: t[0] };
}

const PLURAL = { taza: 'tazas', cda: 'cdas', cdta: 'cdtas', pizca: 'pizcas' };
const unidadVisible = (i) => (i.cantidad > 1 && PLURAL[i.unidad]) || i.unidad;

export const lineaIngrediente = (i) =>
  [i.cantidad != null ? fmt(i.cantidad) : '', unidadVisible(i), i.nombre].filter(Boolean).join(' ');
