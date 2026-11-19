// Catálogo de la tienda: categorías > familias > plantas con sus tamaños y precios.
let catalog = [];
let categories = [];
let tipos = [];
let catalogError = null;
const TAMANOS = ['Pequeño', 'Mediano', 'Grande'];

async function loadCatalog() {
  if (typeof db === 'undefined' || !db) { catalogError = new Error('Supabase no configurado'); return; }
  try {
    const [c, t, v, p] = await Promise.all([
      db.from('categorias').select('id,nombre,descripcion,imagen_url').order('nombre'),
      db.from('tipos').select('id,nombre,categoria_id,imagen_url').order('nombre'),
      db.from('variedades').select('*').eq('visible', true).order('nombre'),
      db.from('presentaciones').select('*').order('orden')
    ]);
    const err = c.error || t.error || v.error || p.error;
    if (err) throw err;
    categories = c.data.map(x => ({ ...x, icon: '🌿' }));
    tipos = t.data;
    catalog = v.data.map(x => {
      const tp = t.data.find(y => y.id === x.tipo_id) || {}, ct = c.data.find(y => y.id === tp.categoria_id) || {};
      const tamanos = TAMANOS.map(n => {
        const r = p.data.find(y => y.variedad_id === x.id && y.tamano === n);
        return r ? { id: r.id, tamano: n, precio: r.precio == null ? null : Number(r.precio), stock: r.stock == null ? null : r.stock, detalle: r.detalle || '' } : null;
      }).filter(Boolean);
      const precios = tamanos.filter(s => s.precio != null).map(s => s.precio);
      return {
        id: x.id, nombre: x.nombre, descripcion: x.descripcion || '', descripcion_larga: x.descripcion_larga || '', imagen_url: x.imagen_url || '',
        fotos: Array.isArray(x.fotos) ? [...new Set([x.imagen_url, ...x.fotos].filter(Boolean))] : (x.imagen_url ? [x.imagen_url] : []),
        tipo: tp.nombre || '', tipo_id: x.tipo_id, categoria_id: tp.categoria_id, categoria: ct.nombre || '',
        riego: x.riego || '', luz: x.luz || '', altura: x.altura || '', dificultad: x.dificultad || '',
        destacado: !!x.destacado, etiqueta: x.destacado ? 'Más vendido' : '',
        tamanos, precio: precios.length ? Math.min(...precios) : 0,
        stock: tamanos.filter(s => s.precio != null && s.stock !== 0).length
      };
    });
  } catch (error) { catalogError = error; console.error('No se pudo cargar el catálogo', error); }
}
// El número de WhatsApp sale solo de config.js
document.querySelector('.whatsapp-float')?.setAttribute('href', `https://wa.me/${WHATSAPP}`);
