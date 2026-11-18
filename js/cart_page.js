(function () {
  const cartButton = document.getElementById('btnCarrito');
  if (cartButton) cartButton.onclick = () => {
    document.getElementById('panelCarrito')?.classList.remove('open');
    document.getElementById('drawerBackdrop')?.classList.remove('open');
    location.hash = '#carrito';
  };

  document.addEventListener('click', event => {
    if (event.target.id !== 'actualizarCarrito') return;
    document.querySelectorAll('[data-cart-input]').forEach(input => {
      const item = cart.find(x => x.id == Number(input.dataset.cartInput));
      if (item) item.cantidad = Math.max(1, Math.min(item.stock || 99, Number(input.value) || 1));
    });
    saveCart();
    cartPage();
  });
})();
