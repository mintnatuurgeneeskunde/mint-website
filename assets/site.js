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
              if (message) showMessage(message, 'Bedankt! Check je mailbox voor de checklist.', true);
              form.reset();
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

  document.addEventListener('DOMContentLoaded', function () {
    initDownloadForms();
    initContactForm();
  });
})();
