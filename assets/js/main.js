(function () {
  "use strict";

  var WHATSAPP = "51952684731";
  var waLink = function (msg) {
    return "https://wa.me/" + WHATSAPP + (msg ? "?text=" + encodeURIComponent(msg) : "");
  };

  /* ---------- Enlaces de WhatsApp con mensaje prearmado ---------- */
  document.querySelectorAll(".js-wa").forEach(function (a) {
    a.href = waLink(a.dataset.msg || "");
  });

  /* ---------- Carta ---------- */
  var CARTA = {
    cafes: [
      { n: "Espresso", p: 6, m: "30 ml", d: "Corto e intenso, con crema dorada.", img: "espresso" },
      { n: "Americano", p: 7, m: "240 ml", d: "Espresso alargado con agua caliente.", img: "americano" },
      { n: "Cappuccino", p: 10, m: "180 ml", d: "Espresso, leche vaporizada y espuma densa.", img: "cappuccino" },
      { n: "Latte", p: 11, m: "300 ml", d: "Suave y cremoso, con arte latte.", img: "latte" },
      { n: "Mocaccino", p: 12, m: "300 ml", d: "Espresso con chocolate y leche.", img: "mocaccino" }
    ],
    postres: [
      { n: "Cheesecake", p: 12, m: "Porción", d: "Base de galleta y queso crema horneado.", img: "cheesecake" },
      { n: "Brownie", p: 8, m: "Porción", d: "Chocolate al 60 %, húmedo por dentro.", img: "brownie" },
      { n: "Torta de chocolate", p: 11, m: "Porción", d: "Bizcocho de cacao con fudge.", img: "torta-chocolate" },
      { n: "Tres leches", p: 10, m: "Porción", d: "Bizcocho bañado y crema chantilly.", img: "tres-leches" }
    ],
    otros: [
      { n: "Croissant", p: 8, m: "Horneado hoy", d: "Hojaldre de mantequilla, crujiente.", img: "croissant" },
      { n: "Sándwich especial", p: 14, m: "Pan de molde artesanal", d: "Jamón, queso andino y vegetales, a la plancha.", img: "sandwich" },
      { n: "Jugo natural", p: 9, m: "400 ml", d: "Naranja, papaya o fresa, al momento.", img: "jugo" },
      { n: "Frappé", p: 13, m: "400 ml", d: "Café helado, crema y galleta. 2x1 los miércoles.", img: "frappe" }
    ]
  };

  var platos = document.getElementById("platos");
  var soles = function (v) { return "S/ " + v.toFixed(2); };

  function pintarCarta(cat) {
    platos.innerHTML = CARTA[cat].map(function (x, i) {
      return '<article class="plato" style="animation-delay:' + (i * 60) + 'ms">' +
        '<img src="assets/img/' + x.img + '.jpg" alt="' + x.n + '" loading="lazy" width="112" height="112">' +
        '<div class="plato-info">' +
          '<div class="plato-linea"><h3>' + x.n + '</h3><span class="precio">' + soles(x.p) + '</span></div>' +
          '<p>' + x.d + '</p>' +
          '<span class="plato-medida">' + x.m + '</span>' +
        '</div></article>';
    }).join("");
  }

  var pestanas = document.querySelectorAll(".pestana");
  pestanas.forEach(function (btn) {
    btn.addEventListener("click", function () {
      pestanas.forEach(function (b) { b.setAttribute("aria-selected", String(b === btn)); });
      platos.setAttribute("aria-labelledby", btn.id);
      pintarCarta(btn.dataset.cat);
    });
  });
  pintarCarta("cafes");

  /* ---------- Horario (hora de Tacna, UTC−5) ---------- */
  var HORARIO = { 0: [9, 20] }; // domingo
  for (var d = 1; d <= 6; d++) HORARIO[d] = [8, 22];

  function horaTacna() {
    var ahora = new Date();
    var utc = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
    return new Date(utc - 5 * 3600000);
  }
  function fmtHora(h, m) {
    var suf = h < 12 ? "a. m." : "p. m.";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + String(m || 0).padStart(2, "0") + " " + suf;
  }

  (function estado() {
    var t = horaTacna();
    var dia = t.getDay();
    var h = t.getHours() + t.getMinutes() / 60;
    var rango = HORARIO[dia];
    var abierto = h >= rango[0] && h < rango[1];
    var el = document.getElementById("estado");
    var txt = document.getElementById("estado-texto");
    document.getElementById("horario-hoy").textContent = fmtHora(rango[0]) + " – " + fmtHora(rango[1]);
    if (abierto) {
      txt.textContent = "Abierto ahora · hasta las " + fmtHora(rango[1]);
    } else {
      var sig = h < rango[0] ? rango : HORARIO[(dia + 1) % 7];
      el.classList.add("cerrado");
      txt.textContent = "Cerrado · abrimos " + (h < rango[0] ? "hoy" : "mañana") + " a las " + fmtHora(sig[0]);
    }
  })();

  /* ---------- Formulario de reservas ---------- */
  var form = document.getElementById("form-reserva");
  var fecha = document.getElementById("r-fecha");
  var hora = document.getElementById("r-hora");
  var msg = document.getElementById("form-mensaje");

  function isoLocal(dt) {
    return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
  }
  function llenarHoras() {
    var partes = fecha.value.split("-");
    var dia = partes.length === 3 ? new Date(+partes[0], +partes[1] - 1, +partes[2]).getDay() : 1;
    var r = HORARIO[dia];
    var previo = hora.value;
    var opciones = [];
    for (var h = r[0]; h < r[1] - 0.5; h += 0.5) {
      var hh = Math.floor(h), mm = h % 1 ? 30 : 0;
      var val = String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
      opciones.push('<option value="' + val + '">' + fmtHora(hh, mm) + "</option>");
    }
    hora.innerHTML = opciones.join("");
    if (previo && hora.querySelector('option[value="' + previo + '"]')) hora.value = previo;
    else if (hora.querySelector('option[value="16:00"]')) hora.value = "16:00";
  }
  var hoy = horaTacna();
  fecha.min = isoLocal(hoy);
  var manana = new Date(hoy.getTime() + 86400000);
  fecha.value = isoLocal(manana);
  fecha.addEventListener("change", llenarHoras);
  llenarHoras();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var datos = new FormData(form);
    var faltan = [];
    ["nombre", "telefono", "fecha", "hora"].forEach(function (k) {
      var campo = form.elements[k];
      var vacio = !String(datos.get(k) || "").trim();
      campo.setAttribute("aria-invalid", String(vacio));
      if (vacio) faltan.push(campo);
    });
    if (fecha.value && fecha.value < fecha.min) {
      fecha.setAttribute("aria-invalid", "true");
      faltan.push(fecha);
    }
    if (faltan.length) {
      msg.className = "form-mensaje error";
      msg.textContent = "Revisa los campos marcados: nombre, celular y una fecha desde hoy.";
      faltan[0].focus();
      return;
    }
    var p = fecha.value.split("-");
    var fechaTexto = new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
    var horaTexto = hora.options[hora.selectedIndex].text;
    var personas = form.elements.personas.options[form.elements.personas.selectedIndex].text;
    var lineas = [
      "Hola Café Nórdico, quisiera reservar una mesa:",
      "",
      "• Nombre: " + datos.get("nombre").trim(),
      "• Celular: " + datos.get("telefono").trim(),
      "• Fecha: " + fechaTexto,
      "• Hora: " + horaTexto,
      "• Personas: " + personas
    ];
    if (datos.get("ocasion")) lineas.push("• Ocasión: " + datos.get("ocasion"));
    if (String(datos.get("nota") || "").trim()) lineas.push("• Comentarios: " + datos.get("nota").trim());
    lineas.push("", "¡Gracias!");
    var url = waLink(lineas.join("\n"));

    msg.className = "form-mensaje ok";
    msg.innerHTML = 'Abriendo WhatsApp… Si no se abre, <a href="' + url + '" target="_blank" rel="noopener">toca aquí</a>. Recuerda presionar «Enviar» en WhatsApp.';
    var w = window.open(url, "_blank", "noopener");
    if (!w) { /* bloqueado: el enlace del mensaje queda disponible */ }
  });

  /* ---------- Menú móvil ---------- */
  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menu-boton");
  menuBtn.addEventListener("click", function () {
    var abierto = nav.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", String(abierto));
    menuBtn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("abierto");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Borde de cabecera al desplazar ---------- */
  var cabecera = document.getElementById("cabecera");
  var onScroll = function () { cabecera.classList.toggle("con-borde", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Animación al desplazar ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove("oculto"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    var alto = window.innerHeight;
    document.querySelectorAll(".revelar").forEach(function (el) {
      if (el.getBoundingClientRect().top > alto) { el.classList.add("oculto"); io.observe(el); }
    });
  }

  document.getElementById("anio").textContent = new Date().getFullYear();
})();
