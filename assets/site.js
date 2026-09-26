(function () {
  function showMessage(el, text, ok) {
    el.textContent = text;
    el.style.color = ok ? '#4A7050' : '#C97A5F';
  }

  function initDownloadForms() {
    document.querySelectorAll('.js-download-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = form.querySelector('input[type="email"]').value.trim();
        var button = form.querySelector('button');
        var message = form.nextElementSibling;
        var originalLabel = button.textContent;
        button.disabled = true;
        button.textContent = 'Bezig...';
        if (message) message.textContent = '';

        fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        })
          .then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
              return { ok: res.ok, data: data };
            });
          })
          .then(function (result) {
            if (result.ok) {
              if (message) showMessage(message, 'Bedankt! De checklist wordt nu gedownload.', true);
              form.reset();
              var link = document.createElement('a');
              link.href = '/downloads/voedingstips-gezonde-spijsvertering.pdf';
              link.download = 'Mint - Voedingstips voor een gezonde spijsvertering.pdf';
              document.body.appendChild(link);
              link.click();
              link.remove();
            } else {
              if (message) showMessage(message, (result.data && result.data.error) || 'Er ging iets mis, probeer het later opnieuw.', false);
            }
          })
          .catch(function () {
            if (message) showMessage(message, 'Er ging iets mis, probeer het later opnieuw.', false);
          })
          .finally(function () {
            button.disabled = false;
            button.textContent = originalLabel;
          });
      });
    });
  }

  function initContactForm() {
    var form = document.querySelector('.js-contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var message = form.querySelector('.js-form-message');
      var originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = 'Bezig...';
      if (message) message.textContent = '';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (res.ok) {
            if (message) showMessage(message, 'Bedankt, je bericht is verstuurd! Ik reageer zo snel mogelijk.', true);
            form.reset();
          } else {
            if (message) showMessage(message, 'Er ging iets mis, probeer het later opnieuw.', false);
          }
        })
        .catch(function () {
          if (message) showMessage(message, 'Er ging iets mis, probeer het later opnieuw.', false);
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = originalLabel;
        });
    });
  }

  function initBlogFilters() {
    var pills = document.querySelectorAll('.filter-pill');
    if (!pills.length) return;
    var cards = document.querySelectorAll('.blog-card');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var filter = pill.getAttribute('data-filter');
        cards.forEach(function (card) {
          var categories = (card.getAttribute('data-category') || '').split(' ');
          var matches = filter === 'all' || categories.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !matches);
        });
      });
    });
  }

  function initMobileNav() {
    var btn = document.querySelector('.mobile-menu-btn');
    var nav = document.querySelector('.site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDownloadForms();
    initContactForm();
    initBlogFilters();
    initMobileNav();
  });
})();
