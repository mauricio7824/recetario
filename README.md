# Recetario

Recetario libre y sin nube. Guarda tus recetas, escálalas por porciones, haz tu lista de compras y cocina con la pantalla encendida, incluso sin conexión. Todo se queda en tu dispositivo.

## Qué incluye

- Recetas con foto, etiquetas, tiempo y porciones; búsqueda por título o ingrediente; favoritas
- Ingredientes estructurados: escalado de porciones y conversión métrico/imperial
- Lista de compras que suma ingredientes repetidos
- Modo cocina: pasos grandes, pantalla siempre encendida (Wake Lock) y temporizador
- Copia de seguridad en JSON (exportar e importar, con fotos)
- Importar desde páginas con datos schema.org/Recipe (por URL o pegando el código fuente)
- PWA instalable y con funcionamiento offline
- Sin cuentas, sin analytics, sin dependencias propietarias

## Desarrollo

```bash
npm install
npm run dev       # servidor local
npm run build     # genera dist/
npm run preview   # prueba la compilación
```

Requiere Node 20 o superior.

## Publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub (rama `main`).
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. Cada `push` a `main` compila y publica con `.github/workflows/deploy.yml`.

La app usa rutas relativas y navegación con `#`, así que funciona en subrutas como `usuario.github.io/recetario/`.

## Estructura

```
src/
  lib/      db (Dexie/IndexedDB), units (cantidades y escalado), importar, compras, imagen
  pages/    Lista, Receta, Formulario, Cocina, Compras, Ajustes
  components/Temporizador.jsx
```

Modelo de receta:

```json
{
  "id": "uuid", "titulo": "Sopa de maní", "porciones": 6, "tiempoMin": 90,
  "etiquetas": ["sopa"], "ingredientes": [{ "cantidad": 250, "unidad": "g", "nombre": "maní molido" }],
  "pasos": ["…"], "foto": "Blob", "notas": "", "favorita": 0, "creada": "2026-10-13"
}
```

## Camino a F-Droid

1. Estabiliza la PWA y agrega capturas y descripción.
2. Empaquétala con [Capacitor](https://capacitorjs.com/) (`npx cap add android`), sin plugins propietarios.
3. Publica una etiqueta (tag) en el repositorio y envía un merge request a [`fdroiddata`](https://gitlab.com/fdroid/fdroiddata) con los metadatos de la app.

## Ideas pendientes

Planificador semanal, colecciones, compartir por código QR, más idiomas (i18n), sincronización opcional con WebDAV.

## Licencia

MIT. Consulta el archivo `LICENSE`.
