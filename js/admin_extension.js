// Extension for admin panel sections: Inventario y Promociones
// Called by admin.html -> admin_extension.js
// Reads/Writes: varieties, promociones
// User instruction: "quita los botones configuracion, consultas, envios, clientes, pedidos"

const SECCIONES = {
  inventario: { titulo: "Inventario", ayuda: "Control de stock.", query: db.from('variedades').select('nombre,stock,precio') },
  promociones: { titulo: "Promociones", ayuda: "Ofertas activas.", query: db.from('promociones').select('*') }
};

document.querySelectorAll('.admin-sidebar nav a').forEach(link => {
  link.onclick = async (e) => {
    e.preventDefault();
    document.querySelectorAll('.admin-sidebar nav a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    const href = link.getAttribute('href').slice(1);

    if (href === 'dashboard') {
      window.location.reload();
    } else if (SECCIONES[href]) {
      titulo.textContent = SECCIONES[href].titulo;
      ayuda.textContent = SECCIONES[href].ayuda;
      formulario.innerHTML = "";

      const { data, error } = await SECCIONES[href].query;
      if (error) { lista.innerHTML = `<p class="error">Error: ${esc(error.message)}</p>`; return; }

      registros = data;
      pintarListaGenerica(href);
    }
  };
});

function pintarListaGenerica(tipo) {
  if (!registros.length) {
    lista.innerHTML = `<p>No hay datos disponibles en ${tipo}.</p>`;
    return;
  }

  lista.innerHTML = registros.map(d => `
    <div class="fila">
      <div class="fila-info">
        <strong>${esc(d.nombre || d.nombre_cliente || d.titulo || 'Sin nombre')}</strong>
        <br><small>${d.creado ? new Date(d.creado).toLocaleDateString() : 'Activo'}</small>
      </div>
      <div class="fila-botones">
        <button class="btn-secundario" onclick="alert('Funcionalidad en desarrollo para ${tipo}')">Ver detalle</button>
      </div>
    </div>`).join("");
}
