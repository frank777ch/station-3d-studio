# Vape 3D Studio

Generador y visor **data-driven** de modelos 3D de vapes con Three.js + Vite.
Cada vape es un archivo de configuración; un único constructor (`buildVape`) arma la malla.
Un vape nuevo es un archivo nuevo, no código nuevo.

## Correr

```bash
npm install
npm run setup:hdr   # opcional: descarga public/hdr/studio.hdr (Poly Haven, CC0)
npm run dev         # abre http://localhost:5173
```

Sin el HDR el studio funciona igual con `RoomEnvironment` como entorno de respaldo.

## Uso

- **Modelo**: dropdown arriba del panel. Cambia entre los configs registrados en `src/models/index.js`.
- **Carpetas**: editan el config en vivo y reconstruyen el modelo.
- **Exportar .glb**: descarga el modelo actual en metros (1 mm = 0.001 m). Abre a escala real en Blender.
- **Descargar config JSON**: guarda el ajuste actual para convertirlo en un modelo del catálogo.
- **Importar config JSON**: carga un JSON guardado sin tocar código.

## Catálogo: una carpeta por producto

```
products/
  lifepod-eco-ii-refill/
    NOTES.md          medidas estimadas, qué muestra cada foto
    references/       fotos de referencia (no se sirven en la web)
    base.js           config base del producto
    flavors/          una variante por sabor
      watermelon-ice.js
      tobacco-virginia.js
      capuccino.js
    index.js          exporta el array de variantes
  lifepod-eco-iii/
    base.js, flavors/, index.js
```

Un sabor solo sobreescribe lo que cambia respecto a `base.js`:

```js
// products/lifepod-eco-ii-refill/flavors/capuccino.js
import { defineVariant } from '../../../src/models/_schema.js';
import base from '../base.js';

export default defineVariant(base, {
  id: 'lifepod-eco-ii-refill-capuccino',
  name: 'Life Pod Eco II Refill · Capuccino',
  label: { flavor: 'CAPUCCINO', colors: { top: '#b8734a', main: '#0f6b3a', bottom: '#9a5a36', brand: '#1f9a4f' } },
});
```

### Añadir un sabor

1. Elige el producto en el panel, ajusta colores y textos, y pulsa **Descargar config JSON**.
2. Crea `products/<producto>/flavors/<sabor>.js` con `defineVariant(base, {...})` y copia solo los campos que cambian.
3. Añádelo al `index.js` del producto. Aparece en el selector.

### Añadir un producto

1. Crea `products/<producto>/` con `references/` (fotos), `base.js`, `flavors/` e `index.js`.
2. Importa el `index.js` del producto en `src/models/index.js`.
3. Si el producto necesita una pieza que no existe, se añade en `src/builder/parts/` y queda disponible para todos.

## Esquema del config

Todas las medidas en **milímetros**. Ver `src/models/_schema.js` para los valores por defecto y el typedef.

| Sección | Campos |
| --- | --- |
| `body` | `width`, `depth`, `height`, `cornerRadius`, `edgeRadius`, `color`, `finish` (`glossy` / `mate`) |
| `frameRing` | `enabled`, `height`, `inset`, `color`, `metalness`, `roughness` |
| `screenModule` | `enabled`, `height`, `color`, `screen.{width, height, cornerRadius, offsetY, mode, image, emissiveIntensity, data.{battery, boost, iceBoost, accent}}` |
| `mouthpiece` | `style` (`flat` / `duckbill` / `round` / `dome`), `height`, `width`, `depth`, `color`, `translucent`, `transmission`, `opacity`, `thickness` |
| `band` | `enabled`, `height`, `color`, `roughness` |
| `button` | `enabled`, `side` (`left` / `right` / `front`), `width`, `height`, `offsetY`, `color` |
| `base` | `enabled`, `height`, `inset`, `color` (placa inferior, refills) |
| `label` | `enabled`, `template` (`gradient` / `wave`), `mode`, `image`, `imageFit` (`front` / `wrap`), `logoImage`, `brand`, `line`, `flavor`, `puffs`, `puffsLabel`, `gradient[]`, `gradientAngle`, `textColor`, `colors.{top, main, bottom, brand, flavorText, puffsText, outline}`, `metallic`, `coverage`, `offsetY`, `resolution` |

## Plantillas de etiqueta

- `gradient`: degradado de N colores con marca, línea y sabor. Para dispositivos como el Eco III.
- `wave`: tres zonas con borde ondulado y filete plateado, logo arriba, sabor al centro, burbuja `10k PUFFS` abajo, acabado foil opcional. Para los refills Eco II.

## Etiqueta y pantalla: procedural o imagen

- **Procedural** (`mode: 'procedural'`): canvas con degradado, marca, línea y sabor. Ideal para iterar sabores.
- **Imagen** (`mode: 'image'`): pon un PNG en `public/textures/` y escribe la ruta relativa, por ejemplo `textures/lifepod-logo.png`.
  - `imageFit: 'front'`: mantiene el degradado y centra el logo en la cara frontal.
  - `imageFit: 'wrap'`: la imagen cubre toda la manga de la etiqueta (u = perímetro, centro frontal en 0.5).
  - En la pantalla la imagen reemplaza la textura procedural completa.

## Estructura

```
src/
  main.js                 escena, cámara, loop, estado y wiring del panel
  core/                   renderer (ACES + sRGB), entorno HDR/PMREM, OrbitControls
  builder/
    buildVape.js          config -> THREE.Group (único punto de armado)
    layout.js             medidas -> posiciones Y de cada parte
    materials.js          fábrica de MeshPhysicalMaterial
    parts/                body, frameRing, screenModule, mouthpiece, band, label, button
    textures/             makeLabel, makeScreen (canvas), loadImage
    utils/                roundedBox (prisma redondeado, domo, manga con UVs, plano), dispose
  models/                 _schema.js (DEFAULTS, merge, defineVariant, validate), index.js (catálogo)
products/                 una carpeta por producto: referencias, base.js, flavors/
  ui/panel.js             lil-gui
  export/                 exportGLB, exportConfig (descarga / importa JSON)
public/
  hdr/studio.hdr          entorno de estudio (no versionado; `npm run setup:hdr`)
  textures/               logos o arte de etiqueta
```

El archivo `.env` (claves de API) está en `.gitignore` y no se usa en la app.

## Render

- `MeshPhysicalMaterial` con envMap PMREM del HDR de estudio.
- Tone mapping ACESFilmic, salida sRGB.
- Cuerpo glossy con clearcoat, aro cromado metálico, boquilla con `transmission`, pantalla emisiva por `emissiveMap` de canvas.
