(function () {
  'use strict';

  var EMAIL = 'viphandymanconstruction26@gmail.com';

  // Header: fondo sólido al hacer scroll
  var header = document.querySelector('.header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menú móvil
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Link activo según la sección visible
  var links = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });

    // Animación de aparición
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Carrusel de clientes: duplicar logos para bucle infinito
  var track = document.querySelector('.marquee__track');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (img) {
      var clone = img.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.alt = '';
      track.appendChild(clone);
    });
  }

  // Horario: abierto / cerrado (hora de Puerto Rico, 8:00 am – 6:00 pm)
  var status = document.getElementById('hoursStatus');
  if (status) {
    try {
      var hour = Number(new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', hour12: false, timeZone: 'America/Puerto_Rico'
      }).format(new Date()));
      var open = hour >= 8 && hour < 18;
      status.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
      status.classList.toggle('is-closed', !open);
    } catch (e) { /* deja el texto por defecto */ }
  }

  // Año del footer
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Formulario: envía el mensaje por FormSubmit al correo de la empresa.
  // Si el servicio falla, abre el cliente de correo con el mensaje listo.
  var form = document.getElementById('contactForm');
  var error = document.getElementById('formError');
  var success = document.getElementById('formSuccess');
  var submitBtn = document.getElementById('formSubmit');

  function openMailto(subject, body) {
    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = form.nombre.value.trim();
    var email = form.email.value.trim();
    var mensaje = form.mensaje.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = 'Por favor, introduce un correo electrónico válido.';
      form.email.focus();
      return;
    }
    if (form._honey.value) return; // bot

    error.textContent = '';
    success.hidden = true;
    var subject = 'Nuevo mensaje del sitio web' + (nombre ? ' - ' + nombre : '');
    var body = 'Nombre: ' + nombre + '\nCorreo: ' + email + '\n\n' + mensaje;

    if (!window.fetch) { openMailto(subject, body); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    fetch('https://formsubmit.co/ajax/' + EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        Nombre: nombre || '(sin nombre)',
        email: email,
        Mensaje: mensaje || '(sin mensaje)',
        _subject: subject,
        _replyto: email,
        _template: 'table',
        _captcha: 'false'
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (String(data.success) !== 'true') throw new Error(data.message || 'Error');
        form.reset();
        success.hidden = false;
      })
      .catch(function () {
        error.textContent = 'No pudimos enviar el mensaje. Se abrirá tu correo para enviarlo directamente.';
        openMailto(subject, body);
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar';
      });
  });

  // Aviso de cookies
  var cookies = document.getElementById('cookies');
  var accepted = false;
  try { accepted = localStorage.getItem('vip-cookies') === '1'; } catch (e) {}
  if (!accepted) cookies.hidden = false;
  document.getElementById('cookiesAccept').addEventListener('click', function () {
    try { localStorage.setItem('vip-cookies', '1'); } catch (e) {}
    cookies.hidden = true;
  });
})();
