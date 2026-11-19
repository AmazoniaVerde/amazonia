function cartPage() {
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  layout(`<section class="cart-page section container"><h1>Tu carrito</h1>${cart.length ? `<div class="cart-page-table-wrap"><table class="cart-page-table"><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead><tbody>${cart.map(item => `<tr><td><div class="cart-page-product"><div class="cart-page-thumb">${image(item.imagen_url, item.nombre)}</div><strong>${esc(item.nombre)}</strong></div></td><td>${money(item.precio)}</td><td><input class="cart-page-qty" type="number" min="1" max="${item.stock || 99}" value="${item.cantidad}" data-cart-input="${item.id}" aria-label="Cantidad de ${esc(item.nombre)}"></td><td>${money(item.precio * item.cantidad)}</td><td><button class="cart-page-remove" data-remove="${item.id}">Quitar</button></td></tr>`).join('')}</tbody></table></div><div class="cart-page-actions"><button class="button button-light" id="cartContinueShopping">Continuar comprando</button><button class="button button-primary" id="finalizarCompra">Continuar compra →</button></div><div class="cart-page-bottom"><strong>Total: ${money(total)}</strong></div>` : '<div class="cart-page-empty"><h2>Tu carrito está vacío</h2><p>Agrega una planta para verla aquí.</p><a class="button button-primary" href="#catalogo">Ver catálogo</a></div>'}</section>`);
}

function cartCheckoutView() {
  if (!cart.length) { location.hash = '#catalogo'; return; }
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  layout(`<section class="section container"><div class="checkout-grid"><form id="formCheckout" class="admin-card"><h1>Finalizar compra</h1><p class="form-help"><b>*</b> Campo obligatorio. Los campos marcados como opcionales pueden dejarse vacíos.</p><label>Nombre completo *<input name="nombre" autocomplete="name" required></label><label>DNI (8 dígitos) *<input name="dni" type="text" inputmode="numeric" pattern="[0-9]{8}" minlength="8" maxlength="8" autocomplete="off" title="Ingresa los 8 dígitos de tu DNI" required></label><label>Teléfono / WhatsApp *<input name="telefono" type="tel" autocomplete="tel" required></label><label>Correo (opcional)<input name="correo" type="email" autocomplete="email"></label><label>Ciudad *<input name="ciudad" required></label><label>Dirección de entrega o agencia de referencia *<textarea name="direccion" required></textarea></label><div class="checkout-options"><label>Método de envío<select name="envio"><option>Shalom</option><option>Indrive</option><option>Olva (coordinar por WhatsApp)</option><option>Otro (coordinar por WhatsApp)</option></select></label><label>Método de pago<select name="pago"><option>Yape</option><option>Plin</option><option>Transferencia</option></select></label></div><label>Notas adicionales (opcional)<textarea name="notas"></textarea></label><button type="submit" class="button button-whatsapp" style="width:100%">Registrar pedido y continuar por WhatsApp →</button><p class="form-note">Al continuar, tu pedido se guardará y serás dirigido a WhatsApp para confirmar el pago y coordinar la entrega.</p></form><aside class="admin-card"><h2>Resumen del pedido</h2>${cart.map(item => `<p>${item.cantidad}× ${esc(item.nombre)} <span style="float:right">${money(item.precio * item.cantidad)}</span></p>`).join('')}<hr><h3>Total <span style="float:right">${money(total)}</span></h3></aside></div></section>`);
}

document.addEventListener('click', event => {
  if (event.target.id === 'actualizarCarrito') {
    document.querySelectorAll('[data-cart-input]').forEach(input => {
      const item = cart.find(x => x.id == Number(input.dataset.cartInput));
      if (item) item.cantidad = Math.max(1, Math.min(item.stock || 99, Number(input.value) || 1));
    });
    saveCart();
    cartPage();
  }
  if (event.target.id === 'cartContinueShopping') location.hash = '#catalogo';
  if (event.target.id === 'finalizarCompra') location.hash = '#checkout';
});

document.getElementById('btnCarrito')?.addEventListener('click', () => {
  document.getElementById('panelCarrito')?.classList.remove('open');
  document.getElementById('drawerBackdrop')?.classList.remove('open');
  location.hash = '#carrito';
});
