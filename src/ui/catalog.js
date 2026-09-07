/**
 * Catálogo lateral con buscador: modelos agrupados por producto, con muestra de color.
 * Escribe para filtrar; Enter selecciona el primer resultado; Esc limpia.
 */
export function createCatalog({ models, initialId, onSelect }) {
  const root = document.createElement('aside');
  root.id = 'catalog';
  root.innerHTML = `
    <div class="cat-head">
      <input id="cat-search" type="search" placeholder="Buscar modelo o sabor…" autocomplete="off" spellcheck="false" />
      <div class="cat-count"></div>
    </div>
    <div class="cat-list"></div>
  `;
  document.body.appendChild(root);

  const input = root.querySelector('#cat-search');
  const list = root.querySelector('.cat-list');
  const count = root.querySelector('.cat-count');
  let currentId = initialId;
  const collapsed = new Set();

  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function swatch(m) {
    const l = m.label ?? {};
    if (!l.enabled) return `linear-gradient(135deg, ${m.body?.color ?? '#222'}, #444)`;
    if (l.template === 'wave' && l.colors) return `linear-gradient(180deg, ${l.colors.top} 0 40%, ${l.colors.main} 40% 85%, ${l.colors.bottom} 85%)`;
    const g = l.gradient?.length ? l.gradient : ['#444', '#999'];
    return `linear-gradient(180deg, ${g.join(', ')})`;
  }

  function shortName(m) {
    const p = m.product || '';
    return m.name.startsWith(p) ? m.name.slice(p.length).replace(/^\s*[·\-–]\s*/, '') || m.name : m.name;
  }

  function render() {
    const q = norm(input.value.trim());
    const groups = new Map();
    let shown = 0;
    for (const m of models) {
      if (q && !norm(`${m.name} ${m.product} ${m.id} ${m.label?.flavor}`).includes(q)) continue;
      const key = m.product || 'Otros';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
      shown++;
    }
    count.textContent = q ? `${shown} de ${models.length}` : `${models.length} modelos`;
    list.innerHTML = '';
    for (const [product, items] of groups) {
      const isCollapsed = !q && collapsed.has(product);
      const g = document.createElement('div');
      g.className = 'cat-group';
      g.innerHTML = `<button class="cat-group-title" type="button"><span class="chev">${isCollapsed ? '▸' : '▾'}</span>${product}<span class="n">${items.length}</span></button>`;
      g.querySelector('.cat-group-title').addEventListener('click', () => {
        if (collapsed.has(product)) collapsed.delete(product); else collapsed.add(product);
        render();
      });
      if (!isCollapsed) {
        for (const m of items) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'cat-item' + (m.id === currentId ? ' active' : '');
          b.dataset.id = m.id;
          b.innerHTML = `<span class="sw" style="background:${swatch(m)}"></span><span class="nm">${shortName(m)}</span>${m.notes?.includes('estimad') ? '<span class="tag" title="colores estimados, sin foto">est.</span>' : ''}`;
          b.addEventListener('click', () => select(m.id));
          g.appendChild(b);
        }
      }
      list.appendChild(g);
    }
  }

  function select(id) {
    currentId = id;
    render();
    list.querySelector('.cat-item.active')?.scrollIntoView({ block: 'nearest' });
    onSelect(id);
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = list.querySelector('.cat-item');
      if (first) select(first.dataset.id);
    } else if (e.key === 'Escape') {
      input.value = '';
      render();
    }
  });
  // atajo: "/" enfoca el buscador
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !/input|textarea/i.test(document.activeElement?.tagName || '')) {
      e.preventDefault();
      input.focus();
    }
  });

  render();
  return {
    /** Marca el modelo activo (cuando se cambia desde otro sitio). */
    setActive(id) {
      currentId = id;
      render();
    },
  };
}
