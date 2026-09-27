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

- **Catálogo**: panel izquierdo con buscador, agrupado por producto. La URL guarda el modelo (`#id`).
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
    flavors.js        tabla de sabores: una línea por sabor (50 sabores)
    index.js          exporta el array de variantes
  lifepod-eco-ii-battery/
    base.js, NOTES.md, references/, index.js
  lifepod-eco-iii/
    base.js, flavors/, index.js
  lifepod-eco-iii-refill/   12 sabores, plantilla 'pill'
  lifepod-one-40000/        Carbon (5) y Gold (3), plantilla 'one' + pantalla 'boostRow'
  hqd-ez-bar-1500/          10 sabores, plantilla 'vertical'
  elfbar-bc15000/           8 sabores, plantilla 'vertical'
  elfbar-iceking-40000/     14 sabores, plantilla 'brush' + pantalla 'ice'
  rifbar-mixpro-40k/        8 sabores, plantilla 'twoTone' + pantalla 'mixpro'
  voopoo-zest-40000/        5 sabores, plantilla 'vertical' con franja lateral
```

Todos los productos salen del catálogo de [Vape Station Perú](https://vapestation.pe/c/desechables/);
cada carpeta guarda en `NOTES.md` las medidas estimadas y una foto por sabor en `references/`.
Quedan sin modelar el Life Pod SK 15000 (tanque transparente) y el Voopoo Max 16000 (kit + pods).

Un sabor del refill es una línea en `flavors.js` con la zona superior y la central; el resto se deriva
(logo del color de la zona central, zona inferior aclarada, textos en blanco):

```js
['capuccino', 'Capuccino', '#b8734a', '#0f6b3a', { src: 'foto' }],
```

27 sabores tienen colores tomados de las fotos oficiales (`src: 'foto'`) y 23 del catálogo oficial
sin foto tienen colores estimados por el nombre (`src: 'estimado'`).

### Añadir un sabor

1. Elige el refill en el panel, ajusta los colores y pulsa **Descargar config JSON** si quieres guardarlos.
2. Añade una línea a `products/lifepod-eco-ii-refill/flavors.js`. Aparece en el selector.

### Añadir un producto

1. Crea `products/<producto>/` con `references/` (fotos), `base.js`, `flavors/` e `index.js`.
2. Importa el `index.js` del producto en `src/models/index.js`.
3. Si el producto necesita una pieza que no existe, se añade en `src/builder/parts/` y queda disponible para todos.

## Esquema del config

Todas las medidas en **milímetros**. Ver `src/models/_schema.js` para los valores por defecto y el typedef.

| Sección | Campos |
| --- | --- |
| `body` | `width`, `depth`, `height`, `cornerRadius`, `edgeRadius`, `color`, `finish` (`glossy` / `mate`), `topSlope`; silueta: `profile`, `topRound`, `topChamfer`, `bottomRound`, `bottomChamfer`, `topRoundDepth`, `loft`, `topColor`, `bottomColor` |
| `frameRing` | `enabled`, `height`, `inset`, `color`, `metalness`, `roughness` |
| `screenModule` | `enabled`, `height`, `color`, `screen.{width, height, cornerRadius, offsetY, mode, image, emissiveIntensity, data.{battery, boost, iceBoost, accent}}` |
| `mouthpiece` | `style` (`flat` / `duckbill` / `round` / `dome` / `loft`), `height`, `width`, `depth`, `offsetX`, `offsetY`, `offsetZ`, `color`, `translucent`, `transmission`, `opacity`, `thickness`, `slot`, `slotWidth`, `slotDepth`; con `loft`: `profile`, `cornerRadius`, `edgeRadius`, `topRound`, `topRoundDepth` |
| `band` | `enabled`, `height`, `color`, `roughness` |
| `button` | `enabled`, `side` (`left` / `right` / `front`), `width`, `height`, `offsetY`, `color` |
| `base` | `enabled`, `height`, `inset`, `color` (placa inferior, refills) |
| `cavity` | `enabled`, `wall`, `floorY`, `color` (cuerpo hueco abierto arriba; con `body.topSlope` la boca queda inclinada) |
| `ledLogo` | `enabled`, `image`, `color`, `length`, `offsetX`, `offsetY`, `rotation`, `emissiveIntensity` (logo iluminado en la cara frontal) |
| `frontScreen` | `enabled`, `template` (`boost` / `percent` / `ice` / `boostRow` / `mixpro`), `width`, `height`, `cornerRadius`, `offsetX`, `offsetY`, `data.{battery, liquid, level, boost, accent, flavor}`, `emissiveIntensity` |
| `extras` | lista de piezas: `{ type: 'box' / 'cylinder' / 'screen', x, y, z, rotation, material, color, ... }` (módulos, diales, perillas, botones, puertos) |
| `label` | `enabled`, `template` (`gradient` / `wave` / `vertical` / `brush` / `one` / `twoTone` / `pill`), `mode`, `image`, `imageFit` (`front` / `wrap`), `logoImage`, `brand`, `line`, `flavor`, `puffs`, `puffsLabel`, `gradient[]`, `gradientAngle`, `textColor`, `colors.{top, main, bottom, brand, flavorText, puffsText, outline}`, `metallic`, `vertical.{…}`, `brush.{…}`, `one.{…}`, `twoTone.{…}`, `pill.{…}`, `coverage`, `offsetY`, `resolution` |

## Silueta y etiqueta impresa

Si el cuerpo define alguna clave de silueta (`profile`, `topRound`, `topChamfer`, `bottomRound`,
`bottomChamfer`, `topRoundDepth` o `loft: true`), se construye como un sólido por secciones y la etiqueta
se imprime directamente sobre él, cubriendo todo el alto. Así salen hombros redondeados (ElfBar BC),
siluetas octogonales (Rifbar) o placas planas (Life Pod One). Sin esas claves se usa el prisma con manga de
siempre, y los productos anteriores no cambian.

`profile` es una lista `[[t, sx, sz], ...]`: a la altura relativa `t` (0 base, 1 tope) el ancho y el grosor
se escalan por `sx` y `sz`. La boquilla con `style: 'loft'` acepta las mismas claves.

## Plantillas de etiqueta

- `gradient`: degradado de N colores con marca, línea y sabor. Para dispositivos como el Eco III.
- `wave`: tres zonas con borde ondulado y filete plateado, logo arriba, sabor al centro, burbuja `10k PUFFS` abajo, acabado foil opcional. Para los refills Eco II.
- `vertical`: degradado con marca, línea y sabor girados 90° (`readUp` para leer de abajo hacia arriba), con posición, tamaño, peso y espaciado de cada texto; tapa en V (`cap`), franja lateral y carcasa trasera con arcos opcionales. HQD Ez Bar, ElfBar BC15000, Voopoo Zest.
- `brush`: fondo claro con brochazos de pincel seco, marca girada con el símbolo encima y franja de color hacia el costado; `style: 'waves'` dibuja bandas onduladas con espuma. ElfBar Ice King.
- `one`: placa lisa o metálica (`metallic`) con logo girado, glifo grande en relieve tono sobre tono, sabor sobre el corte y zona inferior negra en diagonal. Life Pod One.
- `twoTone`: dos colores con corte inclinado y moteado; los textos van en la pantalla. Rifbar MixPro.
- `pill`: fondo oscuro, texto superior girado y arco vertical degradado que se ensancha en la base, con contorno y el sabor girado. Refill Eco III.

## Plantillas de pantalla

- `boost` (módulo de pantalla): batería, porcentaje y píldoras BOOST / ICE.
- `percent`: porcentaje grande con tres barritas (batería Eco II, BC15000, Zest).
- `ice`: columna vertical con TURBO y cinco cubitos según `data.level` (Ice King).
- `boostRow`: fila con rayo, porcentaje, píldora BOOST y copos (Life Pod One).
- `mixpro`: marca y `data.flavor` girados, panel violeta con `data.liquid` / `data.battery` y tiles NIC / ICE BOOST (Rifbar).
- `dial`: dial redondo con anillo de segmentos y porcentaje, o `data.icon: 'N'` (Voopoo Zest).
- `snowflake`: cubo esmerilado con copo de nieve (perilla del Ice King).
- `levels`: columna TURBO / 25-100 % (costado del BC15000).
- `digits`: solo un texto grande (`data.text`).

Las pantallas también pueden ir en `extras` (`type: 'screen'`) para ponerlas en costados o sobre otras piezas.
La pantalla frontal admite `chamfer` (esquinas achaflanadas), `bezel` y `bezelDepth` (marco en relieve).

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

## Publicar en GitHub Pages

El flujo `.github/workflows/pages.yml` compila y publica `dist/` en cada push a `main` (o a mano desde
la pestaña **Actions**). Solo hay que activarlo una vez en el repo: **Settings → Pages → Source:
GitHub Actions**. La web queda en `https://<usuario>.github.io/station-3d-studio/`.

## Publicar en el VPS

```bash
npm run deploy
```

Compila y sube `dist/` por rsync a `/var/www/vape-studio` en el host `rendo-vps` (definido en `~/.ssh/config`).
Caddy lo sirve en `http://108.175.12.132/`. Para cambiarlo a un dominio con HTTPS basta con
sustituir el bloque `http://108.175.12.132` del Caddyfile por el nombre del dominio.

## Render

- `MeshPhysicalMaterial` con envMap PMREM del HDR de estudio.
- Tone mapping Neutral (Khronos PBR Neutral, pensado para fotos de producto: conserva tono y saturación), salida sRGB.
- Fuentes de las marcas desde Google Fonts (Montserrat, Quicksand, Rajdhani) con respaldo del sistema.
- Cuerpo glossy con clearcoat, aro cromado metálico, boquilla con `transmission`, pantalla emisiva por `emissiveMap` de canvas.
