// Panel del dueño. Usa el cliente `db` y las constantes de config.js
const sb = db;
const $ = i => document.getElementById(i);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => `${MONEDA} ${Number(n || 0).toFixed(2)}`;
const fecha = d => d ? new Date(d).toLocaleString('es-PE', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : '';
const ESTADOS = ['Pendiente', 'Confirmado', 'En camino', 'Entregado', 'Cancelado'];
const VENDIDO = ['Confirmado', 'En camino', 'Entregado'];
let editId = null, cur = {}, cache = {};
// [campo, etiqueta, tipo, obligatorio]
const FORMS = {
  categorias: [['nombre','Nombre','text',1],['descripcion','Descripción','textarea']],
  tipos: [['nombre','Nombre','text',1],['descripcion','Descripción','textarea']],
  variedades: [['tipo_id','Categoría › Tipo','select',1],['nombre','Nombre','text',1],['descripcion','Descripción','textarea'],['precio','Precio','number',1],['stock','Stock','number',1],['luz','Luz','text'],['riego','Riego','text'],['altura','Altura','text'],['dificultad','Dificultad','dif'],['visible','Visible en la tienda','check'],['destacado','Más vendida (aparece en el inicio)','check']]
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
function form(tbl, vals = {}, opts = {}, extra = {}) {
  cur = {tbl, opts, extra};
  const f = $('formulario'); f.hidden = false;
  f.innerHTML = `<h3>${editId ? 'Editar' : 'Agregar'} registro</h3>${FORMS[tbl].map(c => campo(c, vals, opts)).join('')}<label>Foto (se guarda en 4080 × 3060 px)<input type="file" name="foto" accept="image/*"></label>${vals.imagen_url ? `<img class="mini" src="${esc(vals.imagen_url)}" alt="">` : ''}<div class="acciones"><button type="submit">${editId ? 'Guardar cambios' : 'Agregar'}</button>${editId ? '<button type="button" class="btn-secundario" data-act="cancel">Cancelar</button>' : ''}</div><p id="msgForm" class="error"></p>`;
}
function cab(t, a, m = '') { editId = null; $('titulo').textContent = t; $('ayuda').textContent = a; $('migas').innerHTML = m; $('formulario').hidden = true; $('lista').innerHTML = ''; }
function filas(tbl, rows, info, extra = () => '') {
  cache[tbl] = {}; rows.forEach(r => cache[tbl][r.id] = r);
  $('lista').innerHTML = rows.length ? rows.map(r => `<div class="fila">${r.imagen_url ? `<img class="mini" src="${esc(r.imagen_url)}" alt="">` : '<span class="mini">🌱</span>'}<div class="fila-info">${info(r)}</div><div class="fila-botones">${extra(r)}<button class="btn-secundario" data-act="edit" data-t="${tbl}" data-id="${r.id}">Editar</button><button class="btn-peligro" data-act="del" data-t="${tbl}" data-id="${r.id}">Borrar</button></div></div>`).join('') : '<p class="ayuda">Aún no hay nada aquí. Agrega el primero con el formulario.</p>';
}
async function stats() {
  const [p, v] = await Promise.all([sb.from('pedidos').select('total,estado,creado'), sb.from('variedades').select('stock,visible')]);
  const ped = p.error ? [] : p.data, vs = v.data || [], hoy = new Date().toDateString(), mes = new Date().getMonth(), anio = new Date().getFullYear();
  const ok = ped.filter(x => VENDIDO.includes(x.estado)), suma = a => a.reduce((s, x) => s + Number(x.total), 0);
  const pend = ped.filter(x => x.estado === 'Pendiente').length;
  $('count-ventas-dia').textContent = money(suma(ok.filter(x => new Date(x.creado).toDateString() === hoy)));
  $('count-ventas-mes').textContent = money(suma(ok.filter(x => { const d = new Date(x.creado); return d.getMonth() === mes && d.getFullYear() === anio; })));
  $('count-pendientes').textContent = pend; $('notif').textContent = pend;
  $('count-productos').textContent = vs.filter(x => x.visible && x.stock > 0).length;
  $('count-stock').textContent = vs.filter(x => x.stock <= 3).length;
}
async function subir(file) {
  const bmp = await createImageBitmap(file), targetWidth = 4080, targetHeight = 3060, scale = Math.max(targetWidth / bmp.width, targetHeight / bmp.height), c = document.createElement('canvas');
  c.width = targetWidth; c.height = targetHeight;
  const drawWidth = bmp.width * scale, drawHeight = bmp.height * scale;
  c.getContext('2d').drawImage(bmp, (targetWidth - drawWidth) / 2, (targetHeight - drawHeight) / 2, drawWidth, drawHeight);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .82)), p = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
  const {error} = await sb.storage.from('imagenes').upload(p, blob, {contentType: 'image/jpeg'}); if (error) throw error;
  return sb.storage.from('imagenes').getPublicUrl(p).data.publicUrl;
}
const tablaPedidos = (r, editable) => r.length ? `<div class="tabla-wrap"><table class="tabla"><tr><th>N°</th><th>Cliente</th>${editable ? '<th>Detalle</th>' : ''}<th>Total</th><th>Fecha</th><th>Estado</th></tr>${r.map(p => `<tr><td>#${String(p.id).padStart(6, '0')}</td><td>${esc(p.nombre_cliente)}</td>${editable ? `<td>${(p.items || []).map(i => `${esc(i.cantidad)}× ${esc(i.nombre)}`).join(', ')}</td>` : ''}<td>${money(p.total)}</td><td>${fecha(p.creado)}</td><td>${editable ? `<select data-act="estado" data-id="${p.id}">${ESTADOS.map(e => `<option ${e === p.estado ? 'selected' : ''}>${e}</option>`).join('')}</select>` : esc(p.estado)}</td></tr>`).join('')}</table></div>` : '<p class="ayuda">Aún no hay pedidos.</p>';
function normalizarPedidos(rows) {
  return (rows || []).map(p => {
    if (p.items && !Array.isArray(p.items) && Array.isArray(p.items.productos)) {
      const c = p.items.cliente || {};
      const contacto = [c.telefono, c.ciudad, c.direccion, c.envio, c.pago].filter(Boolean).join(' · ');
      p.nombre_cliente = contacto ? `${p.nombre_cliente} (${contacto})` : p.nombre_cliente;
      p.items = p.items.productos;
    }
    return p;
  });
}
const V = {
  async dashboard() {
    cab('Resumen general', 'Ventas (pedidos confirmados), productos más vendidos y alertas de inventario.');
    const [pr, low] = await Promise.all([sb.from('pedidos').select('*').order('creado', {ascending: false}).limit(500), get('variedades', q => q.lte('stock', 3).order('stock').limit(6))]);
    const ped = pr.error ? [] : normalizarPedidos(pr.data), ok = ped.filter(p => VENDIDO.includes(p.estado));
    const dias = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
    const tot = dias.map(d => ok.filter(p => new Date(p.creado).toDateString() === d.toDateString()).reduce((s, p) => s + Number(p.total), 0)), mx = Math.max(1, ...tot);
    const top = {}; ok.forEach(p => (p.items || []).forEach(i => top[i.nombre] = (top[i.nombre] || 0) + Number(i.cantidad || 0)));
    const tp = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 4), tm = tp[0]?.[1] || 1;
    const dashboardVisual = `<section class="dashboard-visual wide">
      <div class="dashboard-garden"><div><small class="eyebrow">Amazonia Verde</small><h2>Un panel que crece contigo</h2><p>Cuida tu catálogo, tus pedidos y el inventario desde un solo lugar.</p></div></div>
      <div class="dashboard-banners"><a href="#productos"><img src="img/11_banner_productos.jpg" alt="Productos de la mejor calidad"></a><a href="#inventario"><img src="img/02_banner_envios_peru.jpg" alt="Envíos a todo el Perú"></a></div>
      <div class="dashboard-quick"><a href="#productos"><img src="img/12_icono_monstera.jpg" alt=""><span><b>Productos</b><small>Gestiona tus plantas</small></span></a><a href="#pedidos"><img src="img/13_icono_caja_envio.jpg" alt=""><span><b>Pedidos</b><small>Revisa tus envíos</small></span></a><a href="#inventario"><img src="img/14_icono_calendario.jpg" alt=""><span><b>Actividad</b><small>Organiza tu día</small></span></a></div>
    </section>`;
    $('lista').innerHTML = `${pr.error ? '<p class="error">Falta la tabla de pedidos: ejecuta sql/03-pedidos-y-ajustes.sql en Supabase.</p>' : ''}${dashboardVisual}<div class="dash">
    <section class="av-card"><h3>Ventas por día (7 días)</h3><div class="av-bars">${tot.map((t, i) => `<div title="${money(t)}"><i style="height:${Math.round(t / mx * 100)}%"></i>${['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][dias[i].getDay()]}</div>`).join('')}</div></section>
    <section class="av-card av-top"><h3>Productos más vendidos</h3>${tp.length ? tp.map(([n, c]) => `<div><b>${esc(n)}</b> · ${c} uds.<i style="width:${Math.round(c / tm * 100)}%"></i></div>`).join('') : '<p class="ayuda">Aún sin ventas confirmadas.</p>'}</section>
    <section class="av-card"><h3>⚠ Alertas de inventario</h3>${low.length ? low.map(v => `<p><b>${esc(v.nombre)}</b> <span class="bajo">Stock bajo (${v.stock} uds.)</span></p>`).join('') + '<a class="btn-link" href="#inventario">Ver inventario →</a>' : '<p class="ayuda">Todo el stock está en orden 🌿</p>'}</section>
    <section class="av-card wide"><h3>Pedidos recientes</h3>${tablaPedidos(ped.slice(0, 5), false)}<p><a class="btn-link" href="#pedidos">Ver todos →</a></p></section></div>`;
  },
  async pedidos() {
    cab('Pedidos', 'Pedidos enviados desde el carrito. Cambia el estado según avances.');
    const r = normalizarPedidos(await get('pedidos', q => q.order('creado', {ascending: false}).limit(200)));
    $('lista').innerHTML = tablaPedidos(r, true);
  },
  async categorias() {
    cab('Categorías', 'Crea las categorías (Carnívoras, Orquídeas…). Entra a una para crear sus tipos.');
    form('categorias');
    filas('categorias', await get('categorias', q => q.order('nombre')), r => `<strong>${esc(r.nombre)}</strong><br><small>${esc(r.descripcion || '')}</small>`, r => `<a class="btn-link" href="#tipos:${r.id}">Tipos ›</a>`);
  },
  async tipos(cid) {
    const [c] = await get('categorias', q => q.eq('id', cid));
    cab('Tipos de ' + (c?.nombre || ''), 'Ej.: Venus, Sarracenias. Entra a un tipo para crear sus variedades.', `<a href="#categorias">Categorías</a> › <strong>${esc(c?.nombre || '')}</strong>`);
    form('tipos', {}, {}, {categoria_id: +cid});
    filas('tipos', await get('tipos', q => q.eq('categoria_id', cid).order('nombre')), r => `<strong>${esc(r.nombre)}</strong><br><small>${esc(r.descripcion || '')}</small>`, r => `<a class="btn-link" href="#productos:${r.id}">Variedades ›</a>`);
  },
  async productos(tid) {
    cab('Productos', 'Variedades vendibles: precio, stock, fotos y visibilidad.', tid ? '<a href="#productos">Todos los productos</a>' : '');
    const [cs, ts] = await Promise.all([get('categorias'), get('tipos', q => q.order('nombre'))]);
    if (!ts.length) { $('ayuda').textContent = 'Primero crea una categoría y dentro un tipo.'; return; }
    const tn = Object.fromEntries(ts.map(t => [t.id, `${cs.find(c => c.id == t.categoria_id)?.nombre || ''} › ${t.nombre}`]));
    form('variedades', tid ? {tipo_id: +tid} : {}, {tipos: ts.map(t => ({id: t.id, nombre: tn[t.id]}))});
    filas('variedades', await get('variedades', q => (tid ? q.eq('tipo_id', tid) : q).order('nombre')), r => `<strong>${esc(r.nombre)}</strong>${r.destacado ? ' ⭐' : ''}<br><small>${esc(tn[r.tipo_id] || '')} · ${money(r.precio)} · Stock: <span class="${r.stock <= 3 ? 'bajo' : ''}">${r.stock}</span>${r.visible ? '' : ' · 🙈 Oculta'}</small>`, r => `<button class="btn-secundario" data-act="vis" data-id="${r.id}">${r.visible ? 'Ocultar' : 'Mostrar'}</button>`);
  },
  async inventario() {
    cab('Inventario', 'Ajusta el stock de cada planta.');
    const r = await get('variedades', q => q.order('stock'));
    $('lista').innerHTML = r.map(v => `<div class="fila"><div class="fila-info"><strong>${esc(v.nombre)}</strong><br><small class="${v.stock <= 3 ? 'bajo' : ''}">${v.stock <= 3 ? 'Stock bajo' : 'En stock'}</small></div><div class="fila-botones"><input type="number" min="0" value="${v.stock}" id="s${v.id}" style="width:90px"><button data-act="stock" data-id="${v.id}">Guardar</button></div></div>`).join('') || '<p class="ayuda">Aún no hay productos.</p>';
  }
};
async function vista() {
  const [h, id] = (location.hash.slice(1) || 'dashboard').split(':'), f = V[h] || V.dashboard;
  document.querySelectorAll('.admin-sidebar nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href').slice(1) === (h === 'tipos' ? 'categorias' : (V[h] ? h : 'dashboard'))));
  try { await f(id); stats(); } catch (e) { console.error(e); $('lista').innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}
$('formulario').addEventListener('submit', async e => {
  e.preventDefault();
  const f = $('formulario'), fd = new FormData(f), msg = $('msgForm'), o = {...cur.extra};
  msg.textContent = 'Guardando…';
  try {
    for (const [k,, t] of FORMS[cur.tbl]) o[k] = t === 'check' ? fd.has(k) : (t === 'number' || k === 'tipo_id') ? Number(fd.get(k) || 0) : (fd.get(k) || '').trim() || null;
    const file = fd.get('foto'); if (file && file.size) o.imagen_url = await subir(file);
    const {error} = editId ? await sb.from(cur.tbl).update(o).eq('id', editId) : await sb.from(cur.tbl).insert(o);
    if (error) throw error;
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
  if (act === 'stock') r = await sb.from('variedades').update({stock: Math.max(0, +$('s' + id).value || 0)}).eq('id', id);
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
