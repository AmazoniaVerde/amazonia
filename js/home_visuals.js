(function () {
  const app = document.getElementById('app');

  function addHomeVisuals() {
    if (!app || !location.hash.match(/^#?(inicio)?$/)) return;
    const features = app.querySelector('.features');
    if (!features || app.querySelector('.home-promos')) return;

    features.insertAdjacentHTML('afterend', `<section class="home-promos container" aria-label="Beneficios de Amazonia Verde">
      <div class="home-promo-main">
        <img src="img/11_banner_productos.jpg" alt="Productos de la mejor calidad">
        <div class="home-promo-copy"><small class="eyebrow">Colección seleccionada</small><h2>Productos de la mejor calidad</h2><p>Cuida, decora y vive con más naturaleza.</p><a class="button button-primary" href="#catalogo">Ver productos →</a></div>
      </div>
      <div class="home-promo-side">
        <img src="img/02_banner_envios_peru.jpg" alt="Envíos a todo el Perú">
        <div class="home-service-grid">
          <a href="#catalogo"><img src="img/12_icono_monstera.jpg" alt=""><span><b>Plantas seleccionadas</b><small>Calidad para tu hogar</small></span></a>
          <a href="#contacto"><img src="img/13_icono_caja_envio.jpg" alt=""><span><b>Envíos seguros</b><small>Recibe en todo el Perú</small></span></a>
          <a href="#cuidados"><img src="img/14_icono_calendario.jpg" alt=""><span><b>Cuidados simples</b><small>Guía para cada planta</small></span></a>
        </div>
      </div>
    </section>`);
  }

  if (app) {
    new MutationObserver(addHomeVisuals).observe(app, { childList: true, subtree: true });
    window.addEventListener('hashchange', addHomeVisuals);
    addHomeVisuals();
  }
})();
