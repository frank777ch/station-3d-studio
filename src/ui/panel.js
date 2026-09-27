import GUI from 'lil-gui';
import { FINISHES, MOUTHPIECE_STYLES, BUTTON_SIDES, TEXTURE_MODES, IMAGE_FITS, LABEL_TEMPLATES, SCREEN_TEMPLATES } from '../models/_schema.js';

/**
 * Panel lil-gui. Edita el config en vivo; cada cambio llama a onChange().
 *
 * @param {object} opts
 * @param {Record<string,string>} opts.modelOptions   { nombre -> id }
 * @param {string} opts.initialId
 * @param {() => object} opts.getConfig               config actual (mutable)
 * @param {(id:string)=>void} opts.onSelect
 * @param {()=>void} opts.onChange
 * @param {object} opts.view                          { autoRotate, exposure, envIntensity }
 * @param {()=>void} opts.onViewChange
 * @param {object} opts.actions                       { exportGLB, exportJSON, importJSON, reset }
 */
export function createPanel({ modelOptions, initialId, getConfig, onSelect, onChange, view, onViewChange, actions }) {
  const gui = new GUI({ title: 'Vape 3D Studio' });
  const state = { model: initialId };
  let folders = [];

  const modelCtrl = gui.add(state, 'model', modelOptions).name('Modelo').onChange((id) => onSelect(id));

  const actionsFolder = gui.addFolder('Acciones');
  actionsFolder.add(actions, 'exportGLB').name('⬇ Exportar .glb');
  actionsFolder.add(actions, 'exportJSON').name('⬇ Descargar config JSON');
  actionsFolder.add(actions, 'importJSON').name('⬆ Importar config JSON');
  actionsFolder.add(actions, 'reset').name('↺ Restablecer modelo');

  const viewFolder = gui.addFolder('Vista');
  viewFolder.add(view, 'autoRotate').name('Auto-rotar');
  viewFolder.add(view, 'exposure', 0.3, 2.5, 0.05).name('Exposición');
  viewFolder.add(view, 'envIntensity', 0, 3, 0.05).name('Luz de entorno');
  viewFolder.close();

  gui.onChange(({ controller }) => {
    if (controller === modelCtrl) return;
    if (controller.parent === viewFolder) return onViewChange();
    if (controller.parent === actionsFolder) return;
    onChange();
  });

  function buildFolders() {
    folders.forEach((f) => f.destroy());
    folders = [];
    const cfg = getConfig();

    const f = (title, open = false) => {
      const folder = gui.addFolder(title);
      if (!open) folder.close();
      folders.push(folder);
      return folder;
    };

    const body = f('Cuerpo', true);
    body.add(cfg.body, 'width', 14, 60, 0.5).name('Ancho (mm)');
    body.add(cfg.body, 'depth', 8, 35, 0.5).name('Grosor (mm)');
    body.add(cfg.body, 'height', 40, 140, 1).name('Alto (mm)');
    body.add(cfg.body, 'cornerRadius', 0.5, 15, 0.1).name('Radio esquinas');
    body.add(cfg.body, 'edgeRadius', 0, 6, 0.1).name('Radio cantos');
    body.addColor(cfg.body, 'color').name('Color');
    body.add(cfg.body, 'finish', FINISHES).name('Acabado');
    body.add(cfg.body, 'topSlope', 0, 20, 0.5).name('Boca inclinada (mm)');

    const cav = f('Cavidad (batería)');
    cav.add(cfg.cavity, 'enabled').name('Cuerpo hueco');
    cav.add(cfg.cavity, 'wall', 0.5, 5, 0.1).name('Pared (mm)');
    cav.add(cfg.cavity, 'floorY', 0.5, 40, 0.5).name('Fondo (mm)');
    cav.addColor(cfg.cavity, 'color').name('Color interior');

    const led = f('Logo LED');
    led.add(cfg.ledLogo, 'enabled').name('Visible');
    led.addColor(cfg.ledLogo, 'color').name('Color');
    led.add(cfg.ledLogo, 'length', 5, 60, 0.5).name('Tamaño (mm)');
    led.add(cfg.ledLogo, 'offsetX', -20, 20, 0.5).name('Posición X');
    led.add(cfg.ledLogo, 'offsetY', 0, 120, 0.5).name('Posición Y');
    led.add(cfg.ledLogo, 'rotation', -180, 180, 5).name('Rotación');
    led.add(cfg.ledLogo, 'emissiveIntensity', 0, 6, 0.1).name('Brillo');
    const ledImg = { image: cfg.ledLogo.image ?? '' };
    led.add(ledImg, 'image').name('PNG (public/)').onChange((v) => { cfg.ledLogo.image = v.trim() || null; });

    const fs = f('Pantalla frontal');
    fs.add(cfg.frontScreen, 'enabled').name('Visible');
    fs.add(cfg.frontScreen, 'template', SCREEN_TEMPLATES).name('Plantilla');
    fs.add(cfg.frontScreen, 'width', 3, 45, 0.5).name('Ancho (mm)');
    fs.add(cfg.frontScreen, 'height', 2, 70, 0.5).name('Alto (mm)');
    fs.add(cfg.frontScreen, 'cornerRadius', 0, 8, 0.1).name('Radio');
    fs.add(cfg.frontScreen, 'offsetX', -25, 25, 0.5).name('Posición X');
    fs.add(cfg.frontScreen, 'offsetY', 0, 120, 0.5).name('Posición Y');
    fs.add(cfg.frontScreen.data, 'battery', 0, 100, 1).name('Batería %');
    fs.add(cfg.frontScreen.data, 'liquid', 0, 100, 1).name('Líquido %');
    fs.add(cfg.frontScreen.data, 'level', 0, 5, 1).name('Nivel frío');
    fs.add(cfg.frontScreen.data, 'boost').name('Boost');
    fs.add(cfg.frontScreen.data, 'flavor').name('Sabor en pantalla');
    fs.addColor(cfg.frontScreen.data, 'accent').name('Color acento');
    fs.add(cfg.frontScreen, 'emissiveIntensity', 0, 5, 0.1).name('Brillo');

    const label = f('Etiqueta', true);
    label.add(cfg.label, 'enabled').name('Visible');
    label.add(cfg.label, 'template', LABEL_TEMPLATES).name('Plantilla').onChange(() => queueMicrotask(buildFolders));
    label.add(cfg.label, 'mode', TEXTURE_MODES).name('Modo');
    label.add(cfg.label, 'brand').name('Marca');
    label.add(cfg.label, 'line').name('Línea');
    label.add(cfg.label, 'flavor').name('Sabor');
    if (cfg.label.template === 'wave') {
      label.add(cfg.label, 'puffs').name('Puffs');
      label.add(cfg.label, 'puffsLabel').name('Texto puffs');
      label.add(cfg.label, 'metallic').name('Acabado foil');
      const col = label.addFolder('Colores');
      col.addColor(cfg.label.colors, 'top').name('Zona superior');
      col.addColor(cfg.label.colors, 'main').name('Zona central');
      col.addColor(cfg.label.colors, 'bottom').name('Zona inferior');
      col.addColor(cfg.label.colors, 'brand').name('Logo');
      col.addColor(cfg.label.colors, 'flavorText').name('Texto sabor');
      col.addColor(cfg.label.colors, 'puffsText').name('Texto puffs');
      col.addColor(cfg.label.colors, 'outline').name('Filete');
    } else {
      label.addColor(cfg.label, 'textColor').name('Color texto');
      label.add(cfg.label, 'gradientAngle', 0, 360, 1).name('Ángulo degradado');
    }
    if (cfg.label.template === 'vertical') {
      const vf = label.addFolder('Texto vertical');
      vf.add(cfg.label.vertical, 'brandSize', 0.05, 0.6, 0.01).name('Tamaño marca');
      vf.add(cfg.label.vertical, 'brandX', -0.5, 0.5, 0.01).name('Marca X');
      vf.add(cfg.label.vertical, 'lineX', -0.5, 0.5, 0.01).name('Línea X');
      vf.add(cfg.label.vertical, 'flavorX', -0.5, 0.5, 0.01).name('Sabor X');
      vf.add(cfg.label.vertical, 'grooves', 0, 8, 1).name('Ranuras');
      vf.add(cfg.label.vertical, 'stripWidth', 0, 0.6, 0.01).name('Franja izq.');
      vf.addColor(cfg.label.vertical, 'stripColor').name('Color franja');
    }
    if (cfg.label.template === 'brush') {
      const bf = label.addFolder('Brochazos');
      bf.addColor(cfg.label.brush, 'background').name('Fondo');
      cfg.label.brush.colors.forEach((_, i) => bf.addColor(cfg.label.brush.colors, i).name(`Brochazo ${i + 1}`));
      bf.add(cfg.label.brush, 'angle', 0, 180, 1).name('Ángulo');
      bf.add(cfg.label.brush, 'strokes', 1, 8, 1).name('Cantidad');
      bf.add(cfg.label.brush, 'brandX', -0.5, 0.5, 0.01).name('Marca X');
      bf.add(cfg.label.brush, 'brandSize', 0.05, 0.4, 0.01).name('Tamaño marca');
      bf.add(cfg.label.brush, 'stripWidth', 0, 0.5, 0.01).name('Franja der.');
      bf.addColor(cfg.label.brush, 'stripColor').name('Color franja');
    }
    if (cfg.label.template === 'one') {
      const of = label.addFolder('Placa');
      of.add(cfg.label.one, 'glyphOpacity', 0, 1, 0.01).name('Relieve glifo');
      of.add(cfg.label.one, 'glyphSize', 0.05, 0.6, 0.01).name('Tamaño glifo');
      of.add(cfg.label.one, 'splitLeft', 0, 0.8, 0.01).name('Corte izq.');
      of.add(cfg.label.one, 'splitRight', 0, 0.8, 0.01).name('Corte der.');
      of.addColor(cfg.label.one, 'bottomColor').name('Zona inferior');
      of.add(cfg.label, 'metallic').name('Acabado metálico');
    }
    if (cfg.label.template === 'twoTone') {
      const tf = label.addFolder('Dos tonos');
      tf.addColor(cfg.label.twoTone, 'bottomColor').name('Color inferior');
      tf.add(cfg.label.twoTone, 'splitLeft', 0, 0.8, 0.01).name('Corte izq.');
      tf.add(cfg.label.twoTone, 'splitRight', 0, 0.8, 0.01).name('Corte der.');
      tf.add(cfg.label.twoTone, 'speckle', 0, 1, 0.01).name('Moteado');
    }
    if (cfg.label.template === 'pill') {
      const pf = label.addFolder('Píldora');
      pf.addColor(cfg.label.pill, 'background').name('Fondo');
      pf.add(cfg.label.pill, 'tag').name('Texto superior');
      pf.addColor(cfg.label.pill, 'tagColor').name('Color texto sup.');
      pf.add(cfg.label.pill, 'width', 0.05, 0.6, 0.01).name('Ancho');
      pf.add(cfg.label.pill, 'top', 0, 0.9, 0.01).name('Inicio');
      pf.add(cfg.label.pill, 'bottom', 0.1, 1, 0.01).name('Fin');
    }
    const logoImg = { image: cfg.label.logoImage ?? '' };
    label.add(logoImg, 'image').name('Logo PNG (public/)').onChange((v) => { cfg.label.logoImage = v.trim() || null; });
    const glyphImg = { image: cfg.label.glyphImage ?? '' };
    label.add(glyphImg, 'image').name('Símbolo PNG (public/)').onChange((v) => { cfg.label.glyphImage = v.trim() || null; });
    label.add(cfg.label, 'coverage', 0.1, 1, 0.01).name('Cobertura');
    label.add(cfg.label, 'offsetY', 0, 0.6, 0.01).name('Desplazamiento');
    label.add(cfg.label, 'resolution', [512, 1024, 2048]).name('Resolución');
    const labelImg = { image: cfg.label.image ?? '' };
    label.add(labelImg, 'image').name('Imagen (public/)').onChange((v) => { cfg.label.image = v.trim() || null; });
    label.add(cfg.label, 'imageFit', IMAGE_FITS).name('Ajuste imagen');

    const grad = cfg.label.template !== 'wave' ? label.addFolder('Degradado') : null;
    const rebuildGradient = () => {
      if (!grad) return;
      [...grad.controllers].forEach((c) => c.destroy());
      cfg.label.gradient.forEach((_, i) => grad.addColor(cfg.label.gradient, i).name(`Color ${i + 1}`));
      grad.add({ add: () => { cfg.label.gradient.push('#ffffff'); rebuildGradient(); onChange(); } }, 'add').name('+ Añadir color');
      grad.add({ del: () => { if (cfg.label.gradient.length > 1) { cfg.label.gradient.pop(); rebuildGradient(); onChange(); } } }, 'del').name('− Quitar último');
    };
    rebuildGradient();

    const base = f('Base');
    base.add(cfg.base, 'enabled').name('Visible');
    base.add(cfg.base, 'height', 0.5, 10, 0.1).name('Alto (mm)');
    base.add(cfg.base, 'inset', 0, 4, 0.1).name('Inset (mm)');
    base.addColor(cfg.base, 'color').name('Color');

    const ring = f('Aro cromado');
    ring.add(cfg.frameRing, 'enabled').name('Visible');
    ring.add(cfg.frameRing, 'height', 0.5, 8, 0.1).name('Alto (mm)');
    ring.add(cfg.frameRing, 'inset', -1, 2, 0.05).name('Saliente');
    ring.addColor(cfg.frameRing, 'color').name('Color');
    ring.add(cfg.frameRing, 'metalness', 0, 1, 0.01).name('Metalness');
    ring.add(cfg.frameRing, 'roughness', 0, 1, 0.01).name('Roughness');

    const mod = f('Módulo pantalla');
    mod.add(cfg.screenModule, 'enabled').name('Visible');
    mod.add(cfg.screenModule, 'height', 8, 40, 0.5).name('Alto módulo (mm)');
    mod.addColor(cfg.screenModule, 'color').name('Color módulo');
    const s = cfg.screenModule.screen;
    mod.add(s, 'template', SCREEN_TEMPLATES).name('Plantilla');
    mod.add(s, 'width', 6, 30, 0.5).name('Ancho pantalla');
    mod.add(s, 'height', 4, 30, 0.5).name('Alto pantalla');
    mod.add(s, 'cornerRadius', 0, 6, 0.1).name('Radio pantalla');
    mod.add(s, 'offsetY', -10, 10, 0.1).name('Desplazamiento Y');
    mod.add(s, 'emissiveIntensity', 0, 5, 0.05).name('Brillo');
    mod.add(s, 'mode', TEXTURE_MODES).name('Modo');
    const screenImg = { image: s.image ?? '' };
    mod.add(screenImg, 'image').name('Imagen (public/)').onChange((v) => { s.image = v.trim() || null; });
    mod.add(s.data, 'battery', 0, 100, 1).name('Batería %');
    mod.add(s.data, 'boost').name('Boost');
    mod.add(s.data, 'iceBoost').name('Ice boost');
    mod.addColor(s.data, 'accent').name('Color acento');

    const mp = f('Boquilla');
    mp.add(cfg.mouthpiece, 'enabled').name('Visible');
    mp.add(cfg.mouthpiece, 'style', MOUTHPIECE_STYLES).name('Estilo');
    mp.add(cfg.mouthpiece, 'height', 3, 25, 0.5).name('Alto (mm)');
    mp.add(cfg.mouthpiece, 'width', 6, 40, 0.5).name('Ancho (mm)');
    mp.add(cfg.mouthpiece, 'depth', 4, 30, 0.5).name('Grosor (mm)');
    mp.add(cfg.mouthpiece, 'offsetX', -20, 20, 0.5).name('Posición X');
    mp.add(cfg.mouthpiece, 'offsetZ', -15, 15, 0.5).name('Posición Z');
    mp.add(cfg.mouthpiece, 'offsetY', -10, 5, 0.1).name('Posición Y');
    mp.addColor(cfg.mouthpiece, 'color').name('Color');
    mp.add(cfg.mouthpiece, 'translucent').name('Translúcida');
    mp.add(cfg.mouthpiece, 'transmission', 0, 1, 0.01).name('Transmisión');
    mp.add(cfg.mouthpiece, 'opacity', 0, 1, 0.01).name('Opacidad');
    mp.add(cfg.mouthpiece, 'thickness', 0.1, 6, 0.1).name('Espesor (mm)');
    mp.add(cfg.mouthpiece, 'domeTopX', 0.05, 1, 0.01).name('Domo: meseta ancho');
    mp.add(cfg.mouthpiece, 'domeTopZ', 0.05, 1, 0.01).name('Domo: cresta grosor');
    mp.add(cfg.mouthpiece, 'domePinch', 0, 1, 0.01).name('Domo: hundido');
    mp.add(cfg.mouthpiece, 'domeBendHeight', 0.1, 0.8, 0.01).name('Domo: altura curva');

    const band = f('Banda inferior');
    band.add(cfg.band, 'enabled').name('Visible');
    band.add(cfg.band, 'height', 1, 20, 0.5).name('Alto (mm)');
    band.addColor(cfg.band, 'color').name('Color');
    band.add(cfg.band, 'roughness', 0, 1, 0.01).name('Roughness');

    const btn = f('Botón');
    btn.add(cfg.button, 'enabled').name('Visible');
    btn.add(cfg.button, 'side', BUTTON_SIDES).name('Lado');
    btn.add(cfg.button, 'width', 2, 15, 0.5).name('Ancho (mm)');
    btn.add(cfg.button, 'height', 2, 30, 0.5).name('Alto (mm)');
    btn.add(cfg.button, 'offsetY', 0, 120, 0.5).name('Altura (mm)');
    btn.addColor(cfg.button, 'color').name('Color');
  }

  buildFolders();

  return {
    gui,
    /** Reconstruye las carpetas (tras cambiar de modelo o importar un JSON). */
    refresh(id) {
      if (id) {
        state.model = id;
        modelCtrl.updateDisplay();
      }
      buildFolders();
    },
  };
}
