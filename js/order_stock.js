(function () {
  async function registrarPedido(nombre, total, items, datos) {
    const { data, error } = await db.rpc('crear_pedido', {
      p_nombre_cliente: nombre,
      p_total: total,
      p_items: items,
      p_estado: 'Pendiente',
      p_datos: datos || {}
    });
    if (error) throw error;
    return data;
  }

  async function finalizar(nombre, form) {
    if (!cart.length) return alert('Tu carrito está vacío.');
    const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const items = cart.map(item => ({ id: item.id, nombre: item.nombre, precio: item.precio, cantidad: item.cantidad }));
    const datos = form ? Object.fromEntries(new FormData(form).entries()) : { nombre };

    try {
      await registrarPedido(nombre || 'Cliente', total, items, datos);
    } catch (error) {
      console.error('Error registrando pedido:', error);
      alert(error.message?.includes('Stock insuficiente') ? 'Uno de los productos ya no tiene stock suficiente.' : 'No se pudo registrar el pedido. Intenta nuevamente.');
      return;
    }

    const text = `Hola, soy ${nombre || 'Cliente'}. Quiero registrar mi pedido:\n\n${items.map(item => `• ${item.cantidad} x ${item.nombre} = ${money(item.precio * item.cantidad)}`).join('\n')}\n\nTeléfono: ${datos.telefono || '-'}\nCiudad: ${datos.ciudad || '-'}\nDirección/agencia: ${datos.direccion || '-'}\nEnvío: ${datos.envio || '-'}\nPago: ${datos.pago || '-'}${datos.notas ? `\nNotas: ${datos.notas}` : ''}\n\nTotal: ${money(total)}`;
    cart = [];
    saveCart();
    if (form) form.reset();
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
  }

  const pedidoButton = document.getElementById('btnPedir');
  if (pedidoButton) pedidoButton.onclick = () => { location.hash = '#checkout'; document.getElementById('btnCerrar')?.click(); };

  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.id !== 'formCheckout') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const data = new FormData(form);
    finalizar(data.get('nombre'), form);
  }, true);
})();
