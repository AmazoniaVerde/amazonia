// Panel del dueño. Usa el cliente `db` y las constantes de config.js
const sb = db;
const $ = i => document.getElementById(i);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => `${MONEDA} ${Number(n || 0).toFixed(2)}`;
const fecha = d => d ? new Date(d).toLocaleString('es-PE', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : '';
const ESTADOS = ['Pendiente', 'Confirmado', 'En camino', 'Entregado', 'Cancelado'];
const VENDIDO = ['Confirmado', 'En camino', 'Entregado'];
const TAM = ['Pequeño', 'Mediano', 'Grande'];
let editId = null, cur = {}, cache = {}, PRES = {};
// [campo, etiqueta, tipo, obligatorio]
const FORMS = {
  categorias: [['nombre','Nombre','text',1],['descripcion','Descripción','textarea']],
  tipos: [['nombre','Nombre de la familia','text',1],['descripcion','Descripción','textarea']],
  variedades: [['tipo_id','Categoría › Familia','select',1],['nombre','Nombre de la planta','text',1],['descripcion','Descripción','textarea'],['luz','Luz','text'],['riego','Riego','text'],['altura','Altura','text'],['dificultad','Dificultad','dif'],['visible','Visible en la tienda (desmarca = solo admin)','check'],['destacado','Más vendida (aparece en el inicio)','check']]
};
const get = async (t, f = q => q) => { const r = await f(sb.from(t).select('*')); if (r.error) throw r.error; return r.data; };

function campo([k, l, t, req], v, o) {
  const val = v[k] ?? '';
  if (t === 'textarea') return `<label>${l}<textarea name="${k}" rows="2">${esc(val)}</textarea></label>`;
  if (t === 'select') return `<label>${l}<select name="${k}" required>${o.tipos.map(x => `<option value="${x.id}" ${x.id == val ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></label>`;
  if (t === 'dif') return `<label>${l}<select name="${k}">${['Fácil','Media','Avanzada'].map(x => `<option ${x == (val || 'Media') ? 'selected' : ''}>${x}</option>`).join('')}</select></label>`;
  if (t === 'check') return `<label class="check"><input type="checkbox" name="${k}" ${('id' in v ? val : k === 'visible') ? 'checked' : ''}> ${l}</label>`;
  return `<label>${l}<input name="${k}" type="${t}" ${t === 'number' ? 'step="any" min="0"' : ''} value="${esc(val)}" ${req ? 'required' : ''}></label>`;
}
const tamBlock = v => `<div class="tam-box"><h4>Tamaños y precios <small>(precio vacío = «Pronto» · stock vacío = sin límite)</small></h4>${TAM.map((n, i) => { const r = (PRES[v.id] || []).find(x => x.tamano === n) || {}; return `<div class="tam-row"><b>${n}</b><input name="precio_${i}" type="number" step="any" min="0" placeholder="Precio (Pronto)" value="${r.precio ?? ''}"><input name="stock_${i}" type="number" min="0" placeholder="Stock (sin límite)" value="${r.stock ?? ''}"><input name="detalle_${i}" placeholder="Nota (ej. Cormo)" value="${esc(r.detalle || '')}"></div>`; }).join('')}</div>`;
function form(tbl, vals = {}, opts = {}, extra = {}) {
  cur = {tbl, opts, extra};
  const f = $('formulario'); f.hidden = false;
  f.innerHTML = `<h3>${editId ? 'Editar' : 'Agregar'} registro</h3>${FORMS[tbl].map(c => campo(c, vals, opts)).join('')}${tbl === 'variedades' ? tamBlock(vals) : ''}<label>Foto (se reduce a 1000 px)<input type="file" name="foto" accept="image/*"></label>${vals.imagen_url ? `<img class="mini" src="${esc(vals.imagen_url)}" alt="">` : ''}<div class="acciones"><button type="submit">${editId ? 'Guardar cambios' : 'Agregar'}</button>${editId ? '<button type="button" class="btn-secundario" data-act="cancel">Cancelar</button>' : ''}</div><p id="msgForm" class="error"></p>`;
}
function cab(t, a, m = '') { editId = null; $('titulo').textContent = t; $('ayuda').textContent = a; $('migas').innerHTML = m; $('formulario').hidden = true; $('lista').innerHTML = ''; }
function filas(tbl, rows, info, extra = () => '', dest = 'lista') {
  cache[tbl] = {}; rows.forEach(r => cache[tbl][r.id] = r);
  $(dest).innerHTML = rows.length ? rows.map(r => `<div class="fila">${r.imagen_url ? `<img class="mini" src="${esc(r.imagen_url)}" alt="">` : '<span class="mini">🌱</span>'}<div class="fila-info">${info(r)}</div><div class="fila-botones">${extra(r)}<button class="btn-secundario" data-act="edit" data-t="${tbl}" data-id="${r.id}">Editar</button><button class="btn-peligro" data-act="del" data-t="${tbl}" data-id="${r.id}">Borrar</button></div></div>`).join('') : '<p class="ayuda">No hay registros con ese filtro.</p>';
}
async function stats() {
  const [p, v, pr] = await Promise.all([sb.from('pedidos').select('total,estado,creado'), sb.from('variedades').select('id,visible'), sb.from('presentaciones').select('variedad_id,precio,stock')]);
  const ped = p.error ? [] : p.data, vs = v.data || [], ps = pr.data || [], hoy = new Date().toDateString(), mes = new Date().getMonth(), anio = new Date().getFullYear();
  const ok = ped.filter(x => VENDIDO.includes(x.estado)), suma = a => a.reduce((s, x) => s + Number(x.total), 0), pend = ped.filter(x => x.estado === 'Pendiente').length;
  $('count-ventas-dia').textContent = money(suma(ok.filter(x => new Date(x.creado).toDateString() === hoy)));
  $('count-ventas-mes').textContent = money(suma(ok.filter(x => { const d = new Date(x.creado); return d.getMonth() === mes && d.getFullYear() === anio; })));
  $('count-pendientes').textContent = pend; $('notif').textContent = pend;
  $('count-productos').textContent = vs.filter(x => x.visible && ps.some(y => y.variedad_id === x.id && y.precio != null && y.stock !== 0)).length;
  $('count-stock').textContent = ps.filter(y => y.precio != null && y.stock != null && y.stock <= 3).length;
}
async function subir(file) {
  const bmp = await createImageBitmap(file), k = Math.min(1, 1000 / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .82)), p = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
  const {error} = await sb.storage.from('imagenes').upload(p, blob, {contentType: 'image/jpeg'}); if (error) throw error;
  return sb.storage.from('imagenes').getPublicUrl(p).data.publicUrl;
}
function itemsDe(p) {
  let it = p.items;
  if (typeof it === 'string') { try { it = JSON.parse(it); } catch { return []; } }
  if (Array.isArray(it)) return it;
  if (it && typeof it === 'object') {
    if (Array.isArray(it.productos)) return it.productos;
    if (Array.isArray(it.items)) return it.items;
  }
  return [];
}
const tablaPedidos = (r, editable) => r.length ? `<div class="tabla-wrap"><table class="tabla"><tr><th>N°</th><th>Cliente</th>${editable ? '<th>Detalle</th>' : ''}<th>Total</th><th>Fecha</th><th>Estado</th></tr>${r.map(p => `<tr><td>#${String(p.id).padStart(6, '0')}</td><td>${esc(p.nombre_cliente)}</td>${editable ? `<td>${itemsDe(p).map(i => `${esc(i.cantidad)}× ${esc(i.nombre)}`).join(', ')}</td>` : ''}<td>${money(p.total)}</td><td>${fecha(p.creado)}</td><td>${editable ? `<select data-act="estado" data-id="${p.id}">${ESTADOS.map(e => `<option ${e === p.estado ? 'selected' : ''}>${e}</option>`).join('')}</select>` : esc(p.estado)}</td></tr>`).join('')}</table></div>` : '<p class="ayuda">Aún no hay pedidos.</p>';
const resumen = id => (PRES[id] || []).map(x => `${x.tamano[0]} ${x.precio == null ? 'Pronto' : money(x.precio)}`).join(' · ');
const V = {
  async dashboard() {
    cab('Resumen general', 'Ventas (pedidos confirmados), productos más vendidos y alertas de inventario.');
    const [pr, low] = await Promise.all([sb.from('pedidos').select('*').order('creado', {ascending: false}).limit(500), sb.from('presentaciones').select('id,tamano,stock,variedades(nombre)').not('precio', 'is', null).not('stock', 'is', null).lte('stock', 3).order('stock').limit(6)]);
    const ped = pr.error ? [] : pr.data, ok = ped.filter(p => VENDIDO.includes(p.estado)), bajos = low.data || [];
    const dias = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
    const tot = dias.map(d => ok.filter(p => new Date(p.creado).toDateString() === d.toDateString()).reduce((s, p) => s + Number(p.total), 0)), mx = Math.max(1, ...tot);
    const top = {}; ok.forEach(p => itemsDe(p).forEach(i => top[i.nombre] = (top[i.nombre] || 0) + Number(i.cantidad || 0)));
    const tp = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 4), tm = tp[0]?.[1] || 1;
    $('lista').innerHTML = `${pr.error ? '<p class="error">Falta la tabla de pedidos: ejecuta sql/00-supabase-completo.sql en Supabase.</p>' : ''}<div class="dash">
    <section class="av-card"><h3>Ventas por día (7 días)</h3><div class="av-bars">${tot.map((t, i) => `<div title="${money(t)}"><i style="height:${Math.round(t / mx * 100)}%"></i>${['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][dias[i].getDay()]}</div>`).join('')}</div></section>
    <section class="av-card av-top"><h3>Productos más vendidos</h3>${tp.length ? tp.map(([n, c]) => `<div><b>${esc(n)}</b> · ${c} uds.<i style="width:${Math.round(c / tm * 100)}%"></i></div>`).join('') : '<p class="ayuda">Aún sin ventas confirmadas.</p>'}</section>
    <section class="av-card"><h3>⚠ Alertas de inventario</h3>${bajos.length ? bajos.map(v => `<p><b>${esc(v.variedades?.nombre)}</b> (${v.tamano}) <span class="bajo">Stock bajo (${v.stock} uds.)</span></p>`).join('') + '<a class="btn-link" href="#inventario">Ver inventario →</a>' : '<p class="ayuda">Sin alertas: solo se vigilan los tamaños donde indicas stock.</p>'}</section>
    <section class="av-card wide"><h3>Pedidos recientes</h3>${tablaPedidos(ped.slice(0, 5), false)}<p><a class="btn-link" href="#pedidos">Ver todos →</a></p></section></div>`;
  },
  async pedidos() {
    cab('Pedidos', 'Pedidos enviados desde el carrito. Cambia el estado según avances.');
    $('lista').innerHTML = tablaPedidos(await get('pedidos', q => q.order('creado', {ascending: false}).limit(200)), true);
  },
  async categorias() {
    cab('Categorías', 'Carnívoras, Ornamentales… Entra a una para ver sus familias.');
    form('categorias');
    filas('categorias', await get('categorias', q => q.order('nombre')), r => `<strong>${esc(r.nombre)}</strong><br><small>${esc(r.descripcion || '')}</small>`, r => `<a class="btn-link" href="#tipos:${r.id}">Familias ›</a>`);
  },
  async tipos(cid) {
    const [c] = await get('categorias', q => q.eq('id', cid));
    cab('Familias de ' + (c?.nombre || ''), 'Dioneas, Sarracenias, Alocasias… Entra a una para ver sus plantas.', `<a href="#categorias">Categorías</a> › <strong>${esc(c?.nombre || '')}</strong>`);
    form('tipos', {}, {}, {categoria_id: +cid});
    filas('tipos', await get('tipos', q => q.eq('categoria_id', cid).order('nombre')), r => `<strong>${esc(r.nombre)}</strong><br><small>${esc(r.descripcion || '')}</small>`, r => `<a class="btn-link" href="#productos:${r.id}">Plantas ›</a>`);
  },
  async productos(tid) {
    cab('Productos', 'Cada planta con sus tamaños, precios y fotos. Las ocultas solo las ves tú.', tid ? '<a href="#productos">Todos los productos</a>' : '');
    const [cs, ts] = await Promise.all([get('categorias'), get('tipos', q => q.order('nombre'))]);
    if (!ts.length) { $('ayuda').textContent = 'Primero crea una categoría y dentro una familia.'; return; }
    const [vs, ps] = await Promise.all([get('variedades', q => (tid ? q.eq('tipo_id', tid) : q).order('nombre')), get('presentaciones')]);
    PRES = {}; ps.forEach(p => (PRES[p.variedad_id] = PRES[p.variedad_id] || []).push(p));
    Object.values(PRES).forEach(a => a.sort((x, y) => x.orden - y.orden));
    const tn = Object.fromEntries(ts.map(t => [t.id, `${cs.find(c => c.id == t.categoria_id)?.nombre || ''} › ${t.nombre}`]));
    form('variedades', tid ? {tipo_id: +tid} : {}, {tipos: ts.map(t => ({id: t.id, nombre: tn[t.id]}))});
    const nv = vs.filter(v => v.visible).length;
    $('lista').innerHTML = `<div class="barra"><input id="buscaProd" type="search" placeholder="Buscar planta o familia…"><select id="filtroProd"><option value="">Todas (${vs.length})</option><option value="vis">Visibles en la web (${nv})</option><option value="oc">Solo admin / ocultas (${vs.length - nv})</option><option value="nofoto">Sin foto (${vs.filter(v => !v.imagen_url).length})</option></select></div><div id="filas"></div>`;
    const pintar = () => {
      const q = $('buscaProd').value.toLowerCase(), f = $('filtroProd').value;
      filas('variedades', vs.filter(v => (!q || `${v.nombre} ${tn[v.tipo_id] || ''}`.toLowerCase().includes(q)) && (!f || (f === 'vis' ? v.visible : f === 'oc' ? !v.visible : !v.imagen_url))),
        v => `<strong>${esc(v.nombre)}</strong>${v.destacado ? ' ⭐' : ''}<br><small>${esc(tn[v.tipo_id] || '')} · ${resumen(v.id)}${v.visible ? '' : ' · 🙈 Solo admin'}${v.imagen_url ? '' : ' · 📷 Sin foto'}</small>`,
        v => `<button class="btn-secundario" data-act="vis" data-id="${v.id}">${v.visible ? 'Ocultar' : 'Mostrar'}</button>`, 'filas');
    };
    $('buscaProd').oninput = $('filtroProd').onchange = pintar; pintar();
  },
  async inventario() {
    cab('Inventario', 'Stock por tamaño. Vacío = sin límite; 0 = agotado. Solo aparecen tamaños con precio.');
    const r = await sb.from('presentaciones').select('id,tamano,stock,precio,variedades(nombre)').not('precio', 'is', null);
    if (r.error) throw r.error;
    const rows = r.data.sort((a, b) => (a.stock ?? 1e9) - (b.stock ?? 1e9) || (a.variedades?.nombre || '').localeCompare(b.variedades?.nombre || ''));
    $('lista').innerHTML = `<div class="barra"><input id="buscaInv" type="search" placeholder="Buscar planta…"></div><div id="filas"></div>`;
    const pintar = () => { const q = $('buscaInv').value.toLowerCase(); $('filas').innerHTML = rows.filter(x => !q || (x.variedades?.nombre || '').toLowerCase().includes(q)).map(x => `<div class="fila"><div class="fila-info"><strong>${esc(x.variedades?.nombre)}</strong> · ${x.tamano}<br><small>${money(x.precio)}${x.stock != null && x.stock <= 3 ? ' · <span class="bajo">Stock bajo</span>' : ''}</small></div><div class="fila-botones"><input type="number" min="0" placeholder="Sin límite" value="${x.stock ?? ''}" id="s${x.id}" style="width:110px"><button data-act="stock" data-id="${x.id}">Guardar</button></div></div>`).join('') || '<p class="ayuda">Sin resultados.</p>'; };
    $('buscaInv').oninput = pintar; pintar();
  }
};
async function vista() {
  const [h, id] = (location.hash.slice(1) || 'dashboard').split(':'), f = V[h] || V.dashboard;
  document.querySelectorAll('.admin-sidebar nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href').slice(1) === (h === 'tipos' ? 'categorias' : (V[h] ? h : 'dashboard'))));
  try { await f(id); stats(); } catch (e) { console.error(e); $('lista').innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}
$('formulario').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData($('formulario')), msg = $('msgForm'), o = {...cur.extra};
  msg.textContent = 'Guardando…';
  try {
    for (const [k,, t] of FORMS[cur.tbl]) o[k] = t === 'check' ? fd.has(k) : k === 'tipo_id' ? Number(fd.get(k) || 0) : (fd.get(k) || '').trim() || null;
    const file = fd.get('foto'); if (file && file.size) o.imagen_url = await subir(file);
    let pres = null;
    if (cur.tbl === 'variedades') {
      pres = TAM.map((n, i) => ({tamano: n, orden: i + 1, precio: fd.get('precio_' + i) === '' ? null : Number(fd.get('precio_' + i)), stock: fd.get('stock_' + i) === '' ? null : Number(fd.get('stock_' + i)), detalle: (fd.get('detalle_' + i) || '').trim() || null}));
      const pv = pres.map(x => x.precio).filter(x => x != null); o.precio = pv.length ? Math.min(...pv) : 0; o.stock = 0;
    }
    const q = editId ? sb.from(cur.tbl).update(o).eq('id', editId) : sb.from(cur.tbl).insert(o);
    const {data, error} = await q.select('id').single(); if (error) throw error;
    if (pres) { const r2 = await sb.from('presentaciones').upsert(pres.map(x => ({...x, variedad_id: data.id})), {onConflict: 'variedad_id,tamano'}); if (r2.error) throw r2.error; }
    vista();
  } catch (err) { msg.textContent = /row-level/i.test(err.message) ? 'Sin permiso: inicia sesión con el correo del dueño.' : 'Error: ' + err.message; }
});
document.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const {act, t, id} = b.dataset;
  if (act === 'cancel') return vista();
  if (act === 'edit') { editId = id; form(cur.tbl, cache[t][id], cur.opts, cur.extra); return $('formulario').scrollIntoView({behavior: 'smooth'}); }
  let r;
  if (act === 'del') { if (!confirm(`¿Borrar «${cache[t][id].nombre}»?${t === 'variedades' ? '' : '\n\n⚠️ También se borrará todo lo que contiene.'}`)) return; r = await sb.from(t).delete().eq('id', id); }
  if (act === 'vis') r = await sb.from('variedades').update({visible: !cache.variedades[id].visible}).eq('id', id);
  if (act === 'stock') { const v = $('s' + id).value; r = await sb.from('presentaciones').update({stock: v === '' ? null : Math.max(0, +v)}).eq('id', id); }
  if (r?.error) return alert('Error: ' + r.error.message);
  vista();
});
document.addEventListener('change', async e => {
  const s = e.target.closest('select[data-act="estado"]'); if (!s) return;
  const {error} = await sb.from('pedidos').update({estado: s.value}).eq('id', s.dataset.id);
  if (error) alert('Error: ' + error.message); else stats();
});
function mostrar(ok) { $('login').classList.toggle('oculto', ok); $('panel').classList.toggle('oculto', !ok); $('btnSalir').classList.toggle('oculto', !ok); if (ok) vista(); }
$('formLogin').addEventListener('submit', async e => {
  e.preventDefault(); $('msgLogin').textContent = 'Entrando…';
  const {error} = await sb.auth.signInWithPassword({email: $('email').value.trim(), password: $('password').value});
  if (error) $('msgLogin').textContent = 'Correo o contraseña incorrectos.'; else { $('msgLogin').textContent = ''; mostrar(true); }
});
$('btnSalir').onclick = async () => { await sb.auth.signOut(); mostrar(false); };
addEventListener('hashchange', () => $('panel').classList.contains('oculto') || vista());
sb.auth.getSession().then(({data}) => mostrar(!!data.session));
