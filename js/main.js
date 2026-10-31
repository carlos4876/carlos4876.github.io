/* ==========================================================================
   SUMAKI - FUNCIONES GENERALES (MENÚ, RECETA INTERACTIVA Y CONTACTO)
   ========================================================================== */

function $(id) {
  return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", function () {
  // Configuración del año actual en el pie de página
  if ($("yr")) {
    $("yr").textContent = new Date().getFullYear();
  }

  // Configuración del menú móvil (compatible con ambos IDs de tus plantillas)
  var menuBtn = $("menu") || $("menuToggle");
  var navMenu = $("nav") || $("mainNav");

  if (menuBtn && navMenu) {
    menuBtn.onclick = function () {
      navMenu.classList.toggle("open");
      navMenu.classList.toggle("active");
    };

    navMenu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navMenu.classList.remove("open");
        navMenu.classList.remove("active");
      }
    });
  }

  // Inicializar listas de verificación de las 3 recetas tradicionales
  renderRecipeChecklist("checklist-charquekan", typeof INGREDIENTES_CHARQUEKAN !== 'undefined' ? INGREDIENTES_CHARQUEKAN : []);
  renderRecipeChecklist("checklist-charque-mote", typeof INGREDIENTES_CHARQUE_MOTE !== 'undefined' ? INGREDIENTES_CHARQUE_MOTE : []);
  renderRecipeChecklist("checklist-chairo", typeof INGREDIENTES_CHAIRO !== 'undefined' ? INGREDIENTES_CHAIRO : []);

  // Mantener compatibilidad con contenedores antiguos si existieran
  renderRecipeChecklist("ing", typeof INGREDIENTES_CHARQUEKAN !== 'undefined' ? INGREDIENTES_CHARQUEKAN : []);
  renderRecipeChecklist("checklist-ingredientes", typeof INGREDIENTES_CHARQUEKAN !== 'undefined' ? INGREDIENTES_CHARQUEKAN : []);

  // Formulario de contacto general por WhatsApp
  var contactForm = $("cf") || $("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameField = $("cn") || $("contact-name");
      var phoneField = $("ct") || $("contact-phone");
      var msgField = $("cx") || $("contact-msg");

      var name = nameField ? nameField.value.trim() : "";
      var phone = phoneField ? phoneField.value.trim() : "";
      var msg = msgField ? msgField.value.trim() : "";

      var text = "Hola SUMAKI, deseo información sobre sus productos de carne de llama.\n\n" +
                 "Mi nombre es " + name + " (Tel: " + phone + "). " + msg;

      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank");
    });
  }
});

function renderRecipeChecklist(elementId, ingredientsArray) {
  var listContainer = $(elementId);
  if (!listContainer || !ingredientsArray || ingredientsArray.length === 0) return;

  listContainer.innerHTML = "";
  ingredientsArray.forEach(function (ing) {
    var isChecked = false;
    try { isChecked = localStorage.getItem(ing.id) === 'true'; } catch (e) {}
    var li = document.createElement("li");
    li.className = "flex items-center space-x-2 cursor-pointer my-1";
    li.innerHTML = `
      <label class="cursor-pointer flex items-center space-x-2 w-full">
        <input type="checkbox" id="${ing.id}" ${isChecked ? 'checked' : ''} class="w-4 h-4 text-red-600 rounded border-stone-300 focus:ring-red-500">
        <span class="text-xs transition ${isChecked ? 'line-through text-stone-400' : 'text-stone-700 font-medium'}">${ing.name}</span>
      </label>
    `;

    li.querySelector('input').addEventListener("change", function (e) {
      try { localStorage.setItem(ing.id, e.target.checked); } catch (x) {}
      renderRecipeChecklist(elementId, ingredientsArray);
    });

    listContainer.appendChild(li);
  });
}

/* ---------- Imagen de respaldo con identidad SUMAKI ----------
   Si una foto no existe, se muestra un emoji sobre fondo cálido con franja andina. */
function placeholderSVG(emoji, label) {
  var t = String(label || "SUMAKI").replace(/[<>&"']/g, "").slice(0, 34);
  var cols = ["#d41920", "#ffc400", "#7b4a2a"], bands = "";
  for (var i = 0; i < 12; i++) bands += '<rect x="' + (i * 50) + '" y="372" width="50" height="28" fill="' + cols[i % 3] + '"/>';
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#fbf3e4"/><stop offset="1" stop-color="#efc98f"/></linearGradient></defs>' +
    '<rect width="600" height="400" fill="url(#g)"/>' + bands +
    '<text x="300" y="210" font-size="140" text-anchor="middle">' + emoji + '</text>' +
    '<text x="300" y="325" font-size="24" font-weight="bold" font-family="Arial,sans-serif" fill="#7a0f14" text-anchor="middle">' + t + '</text></svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function applyFallback(img) {
  if (!img || img.dataset.fb === "1" || img.src.indexOf("data:") === 0) return;
  img.dataset.fb = "1";
  img.src = placeholderSVG(img.dataset.emoji || "🦙", img.alt);
}
document.addEventListener("error", function (e) {
  if (e.target && e.target.tagName === "IMG") applyFallback(e.target);
}, true);
window.addEventListener("load", function () {
  document.querySelectorAll("img").forEach(function (im) { if (im.complete && im.naturalWidth === 0) applyFallback(im); });
});
