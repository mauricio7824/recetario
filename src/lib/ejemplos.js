import { parseIngredientes } from './units.js';
import { uid, hoy } from './db.js';

const crear = (titulo, porciones, tiempoMin, etiquetas, ingredientes, pasos, notas = '') => ({
  id: uid(), titulo, porciones, tiempoMin, etiquetas,
  ingredientes: parseIngredientes(ingredientes), pasos, foto: null, notas, favorita: 0, creada: hoy()
});

export const ejemplos = () => [
  crear('Sopa de maní', 6, 90, ['sopa', 'bolivia'],
    `250 g maní tostado y molido
1 cebolla
2 dientes de ajo
2 papas grandes
1 zanahoria
100 g fideo cortado
1.5 l caldo de res
sal
perejil picado`,
    [
      'Sofríe la cebolla y el ajo picados hasta que estén transparentes.',
      'Agrega el maní molido y mezcla un minuto, sin que se queme.',
      'Vierte el caldo caliente y añade la zanahoria y las papas en cubos. Cocina a fuego medio 30 minutos.',
      'Incorpora el fideo y cocina hasta que esté tierno. Rectifica la sal.',
      'Sirve con perejil por encima.'
    ],
    'Receta de ejemplo: ajústala a tu gusto.'),
  crear('Arroz con leche', 6, 45, ['postre'],
    `1 taza arroz
4 tazas leche
1 taza agua
3/4 taza azúcar
1 rama de canela
1 pizca sal`,
    [
      'Hierve el arroz con el agua y la canela hasta que absorba el líquido.',
      'Agrega la leche, la sal y el azúcar. Cocina a fuego bajo moviendo seguido.',
      'Retira cuando espese a tu gusto; seguirá espesando al enfriar.'
    ],
    'Receta de ejemplo.')
];
