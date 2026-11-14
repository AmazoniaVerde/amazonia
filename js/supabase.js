let catalog=DEMO_PRODUCTS.slice();
let categories=DEMO_CATEGORIES.slice();
async function loadCatalog(){
  if(typeof db==='undefined'||!db||!SUPABASE_URL||SUPABASE_URL.includes('ejemplo')) return;
  try{
    const [cats,items]=await Promise.all([
      db.from('categorias').select('id,nombre,descripcion,imagen_path,orden').eq('activo',true).order('orden'),
      db.from('variedades').select('id,nombre,descripcion,precio,precio_anterior,stock,etiqueta,rating,num_resenas,tipo_id,tipos(id,nombre,categoria_id,riego,luz,temperatura,categorias(id,nombre))').eq('activo',true).order('creado',{ascending:false})
    ]);
    if(!cats.error&&cats.data?.length) categories=cats.data.map(x=>({...x,icon:'🌿'}));
    if(!items.error&&items.data?.length) catalog=items.data.map(x=>({id:x.id,nombre:x.nombre,descripcion:x.descripcion||'',precio:Number(x.precio),stock:x.stock||0,etiqueta:x.etiqueta||'',rating:x.rating,num_resenas:x.num_resenas,tipo:x.tipos?.nombre||'',categoria_id:x.tipos?.categorias?.id,tipo_id:x.tipo_id,riego:x.tipos?.riego||'',luz:x.tipos?.luz||'',temperatura:x.tipos?.temperatura||'',icon:'🌿'}));
  }catch(error){console.warn('Usando catálogo de respaldo',error)}
}
