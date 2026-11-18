// Catálogo de la tienda: lee Supabase con las columnas REALES (sin plantas de ejemplo).
let catalog = [];
let categories = [];
let catalogError = null;

async function loadCatalog() {
  if (typeof db === 'undefined' || !db) { catalogError = new Error('Supabase no configurado'); return; }
  try {
    const [cats, items] = await Promise.all([
      db.from('categorias').select('id,nombre,descripcion,imagen_url').order('nombre'),
      db.from('variedades').select('*,tipos(id,nombre,categoria_id,categorias(id,nombre))').eq('visible', true).order('creado', { ascending: false })
    ]);
    if (cats.error || items.error) throw (cats.error || items.error);
    categories = cats.data.map(x => ({ ...x, icon: '🌿' }));
    catalog = items.data.map(x => ({
      id: x.id, nombre: x.nombre, descripcion: x.descripcion || '', precio: Number(x.precio), stock: x.stock || 0,
      etiqueta: x.destacado ? 'Más vendido' : x.stock <= 0 ? 'Agotado' : x.stock <= 3 ? '¡Últimas unidades!' : '',
      destacado: !!x.destacado, tipo: x.tipos?.nombre || '', tipo_id: x.tipo_id,
      categoria_id: x.tipos?.categorias?.id, categoria: x.tipos?.categorias?.nombre || '',
      riego: x.riego || '', luz: x.luz || '', altura: x.altura || '', dificultad: x.dificultad || '',
      imagen_url: x.imagen_url || '', icon: '🌿'
    }));
  } catch (error) { catalogError = error; console.error('No se pudo cargar el catálogo', error); }
}
// El número de WhatsApp sale solo de config.js
document.querySelector('.whatsapp-float')?.setAttribute('href', `https://wa.me/${WHATSAPP}`);
