/* ==========================================================================
   SUMAKI - LÓGICA DE CATÁLOGO Y CARRITO
   ========================================================================== */

var cart = [];
var currentProduct = null;
var currentQuantity = 1;
var deliveryType = "recojo";
var hasLlajua = false;

document.addEventListener("DOMContentLoaded", function () {
  renderCatalog("todos");
  updateUI();
  setupListeners();
});

function renderCatalog(category) {
  var container = document.getElementById("productsContainer");
  if (!container) return;
  container.innerHTML = "";

  var filtered = (category === "todos" || category === "all") 
    ? PRODUCTOS 
    : PRODUCTOS.filter(function (p) { return p.c === category; });

  if (filtered.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No hay productos en esta categoría.</p>';
    return;
  }

  filtered.forEach(function (p) {
    var card = document.createElement("div");
    card.className = "product-card";
    card.onclick = function () {
      openModal(p);
    };

    card.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${p.img}" alt="${p.n}" data-emoji="${p.e}" loading="lazy">
        <span class="price-tag">Bs ${p.p.toFixed(2)}</span>
      </div>
      <div>
        <div class="product-category">${p.cLabel || p.c}</div>
        <h3 class="product-title">${p.n}</h3>
        <p class="product-desc">${p.d}</p>
      </div>
      <button class="btn-card-add" type="button">
        <span>Ver y Pedir</span>
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    `;
    container.appendChild(card);
  });
}

function filterProducts(category, btn) {
  document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
  if (btn) btn.classList.add("active");
  renderCatalog(category);
}

function openModal(product) {
  currentProduct = product;
  currentQuantity = 1;

  var mImg = document.getElementById("mImg");
  mImg.dataset.fb = "";
  mImg.dataset.emoji = product.e;
  mImg.alt = product.n;
  mImg.src = product.img;
  document.getElementById("mTitle").innerText = product.n;
  document.getElementById("mWeight").innerText = product.weight;

  // GESTIÓN DE LA DESCRIPCIÓN Y DATOS DETALLADOS CON BOTÓN VER MÁS / VER MENOS
  var descEl = document.getElementById("mDesc");
  var toggleBtn = document.getElementById("toggleDescBtn");
  
  if (descEl) {
    var detailedContent = product.d;
    if (product.tipoCarne) detailedContent += "<br><br><strong>Tipo de carne:</strong> " + product.tipoCarne;
    if (product.valorNutricional) detailedContent += "<br><br><strong>Valor nutricional:</strong> " + product.valorNutricional;
    if (product.coccion) detailedContent += "<br><br><strong>Cocción:</strong> " + product.coccion;
    if (product.refrigeracion) detailedContent += "<br><br><strong>Refrigerado:</strong> " + product.refrigeracion;
    if (product.vidaUtil) detailedContent += "<br><br><strong>Vida útil:</strong> " + product.vidaUtil;

    descEl.innerHTML = detailedContent;
    descEl.style.display = "-webkit-box";
    descEl.style.webkitLineClamp = "3";
    descEl.style.webkitBoxOrient = "vertical";
    descEl.style.overflow = "hidden";
    
    if (toggleBtn) {
      toggleBtn.innerText = "VER MÁS";
      var newToggleBtn = toggleBtn.cloneNode(true);
      toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
      
      newToggleBtn.onclick = function() {
        if (descEl.style.overflow === "hidden") {
          descEl.style.display = "block";
          descEl.style.webkitLineClamp = "unset";
          descEl.style.overflow = "visible";
          newToggleBtn.innerText = "VER MENOS";
        } else {
          descEl.style.display = "-webkit-box";
          descEl.style.webkitLineClamp = "3";
          descEl.style.webkitBoxOrient = "vertical";
          descEl.style.overflow = "hidden";
          newToggleBtn.innerText = "VER MÁS";
        }
      };
    }
  }

  document.getElementById("mPriceLabel").innerText = "PRECIO BS " + product.p.toFixed(1) + " / " + product.u.toUpperCase();
  document.getElementById("qtyValue").innerText = currentQuantity;
  document.getElementById("qtyUnit").innerText = product.u === 'kg' ? 'KILOS' : 'PAQUETES';

  document.getElementById("productModal").classList.add("active");

  // Activar efecto de zoom interactivo
  setupZoomEffect();
}

// EFECTO ZOOM INTERACTIVO AL MOVER EL MOUSE SOBRE LA IMAGEN
function setupZoomEffect() {
  var container = document.getElementById("zoomContainer");
  var img = document.getElementById("mImg");

  if (!container || !img) return;

  container.onmousemove = function(e) {
    var rect = container.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var xPercent = (x / container.offsetWidth) * 100;
    var yPercent = (y / container.offsetHeight) * 100;

    img.style.transformOrigin = xPercent + "% " + yPercent + "%";
    img.style.transform = "scale(2.3)";
  };

  container.onmouseleave = function() {
    img.style.transformOrigin = "center center";
    img.style.transform = "scale(1)";
  };
}

function setupListeners() {
  var closeProdModal = document.getElementById("closeProductModalBtn");
  if (closeProdModal) {
    closeProdModal.onclick = function () {
      document.getElementById("productModal").classList.remove("active");
    };
  }

  var btnPlus = document.getElementById("qtyPlus");
  if (btnPlus) {
    btnPlus.onclick = function () {
      if (!currentProduct) return;
      currentQuantity = Math.round((currentQuantity + stepOf(currentProduct)) * 10) / 10;
      document.getElementById("qtyValue").innerText = qtyText(currentQuantity);
    };
  }

  var btnMinus = document.getElementById("qtyMinus");
  if (btnMinus) {
    btnMinus.onclick = function () {
      if (currentProduct && currentQuantity - stepOf(currentProduct) >= stepOf(currentProduct)) {
        currentQuantity = Math.round((currentQuantity - stepOf(currentProduct)) * 10) / 10;
        document.getElementById("qtyValue").innerText = qtyText(currentQuantity);
      }
    };
  }

  var btnAddModal = document.getElementById("addToCartModalBtn");
  if (btnAddModal) {
    btnAddModal.onclick = function () {
      if (!currentProduct) return;
      if (currentProduct.id === 14) resetLlajua();
      var index = cart.findIndex(function (item) { return item.id === currentProduct.id; });
      if (index > -1) {
        cart[index].quantity = Math.round((cart[index].quantity + currentQuantity) * 10) / 10;
      } else {
        cart.push({
          id: currentProduct.id,
          name: currentProduct.n,
          price: currentProduct.p,
          unit: currentProduct.u,
          img: currentProduct.img,
          e: currentProduct.e,
          quantity: currentQuantity
        });
      }
      document.getElementById("productModal").classList.remove("active");
      updateUI();
    };
  }

  var openCartBtn = document.getElementById("openCartBtn");
  if (openCartBtn) {
    openCartBtn.onclick = function () {
      openCheckoutDrawer();
    };
  }

  var floatingCheckoutBtn = document.getElementById("floatingCheckoutBtn");
  if (floatingCheckoutBtn) {
    floatingCheckoutBtn.onclick = function () {
      openCheckoutDrawer();
    };
  }

  var closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
  if (closeCheckoutBtn) {
    closeCheckoutBtn.onclick = function () {
      document.getElementById("checkoutDrawer").classList.remove("active");
    };
  }

  // BOTÓN LLAJUA CON CLASE TOGGLE
  var chimiBtn = document.getElementById("chimiBtn");
  if (chimiBtn) {
    chimiBtn.onclick = function () {
      hasLlajua = !hasLlajua;
      if (hasLlajua) {
        chimiBtn.innerText = "✓ Añadido";
        chimiBtn.classList.add("added");
      } else {
        chimiBtn.innerText = "+ Bs 25.0";
        chimiBtn.classList.remove("added");
      }
      updateUI();
    };
  }

  var sendWhatsAppBtn = document.getElementById("sendWhatsAppBtn");
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.onclick = function () {
      if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }
      var nameInput = document.getElementById("customerName");
      var customerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Cliente SUMAKI";

      var total = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
      if (hasLlajua) total += 25.00;

      var message = "*¡NUEVO PEDIDO SUMAKI!*\n\n";
      message += "👤 *Cliente:* " + customerName + "\n";
      message += "🚚 *Tipo de Entrega:* " + deliveryType.toUpperCase() + "\n\n";
      message += "*Productos:*\n";

      cart.forEach(function (item) {
        var unitLabel = unitText(item);
        message += "• " + qtyText(item.quantity) + " " + unitLabel + " de " + item.name + " (Bs " + (item.price * item.quantity).toFixed(2) + ")\n";
      });

      if (hasLlajua) {
        message += "• 1x Llajua Tradicional SUMAKI (Bs 25.00)\n";
      }

      message += "\n💰 *TOTAL APROXIMADO: Bs " + total.toFixed(2) + "*\n\n¡Quedo atento a la confirmación de mi pedido!";

      var whatsappUrl = "https://wa.me/" + WA + "?text=" + encodeURIComponent(message);
      window.open(whatsappUrl, '_blank');
    };
  }
}

function selectDelivery(type) {
  deliveryType = type;
  var optRecojo = document.getElementById("optRecojo");
  var optDelivery = document.getElementById("optDelivery");
  if (optRecojo && optDelivery) {
    optRecojo.classList.toggle("active", type === "recojo");
    optDelivery.classList.toggle("active", type === "delivery");
  }
}

function updateUI() {
  var totalItems = cart.length; // número de productos distintos
  var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
  if (hasLlajua) subtotal += 25.00;

  var cartBadgeCount = document.getElementById("cartBadgeCount");
  if (cartBadgeCount) cartBadgeCount.innerText = totalItems;

  var floatingBar = document.getElementById("floatingBar");
  if (floatingBar) {
    if (totalItems > 0) {
      floatingBar.classList.add("active");
      document.getElementById("floatingBadge").innerText = totalItems;
      document.getElementById("floatingAmount").innerText = subtotal.toFixed(2);
    } else {
      floatingBar.classList.remove("active");
    }
  }

  var cartItemsList = document.getElementById("cartItemsList");
  if (cartItemsList) {
    cartItemsList.innerHTML = "";
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Tu carrito está vacío.</p>';
    } else {
      cart.forEach(function (item, index) {
        var div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <div class="cart-item-left">
            <img src="${item.img}" class="cart-item-img" alt="${item.name}" data-emoji="${item.e || '🦙'}">
            <div>
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-sub">${qtyText(item.quantity)} ${unitText(item)} X Bs ${item.price.toFixed(1)}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="cart-item-price">Bs ${(item.price * item.quantity).toFixed(1)}</span>
            <button class="cart-item-remove" onclick="removeItem(${index})" type="button" title="Eliminar">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
        cartItemsList.appendChild(div);
      });
    }
  }

  var sugg = document.querySelector(".suggestion-box");
  if (sugg) sugg.style.display = cart.some(function (i) { return i.id === 14; }) ? "none" : "flex";

  var checkoutTotalAmount = document.getElementById("checkoutTotalAmount");
  if (checkoutTotalAmount) checkoutTotalAmount.innerText = subtotal.toFixed(2);
}

function openCheckoutDrawer() {
  updateUI();
  var drawer = document.getElementById("checkoutDrawer");
  if (drawer) drawer.classList.add("active");
}

function removeItem(index) {
  cart.splice(index, 1);
  updateUI();
}

/* ---------- Utilidades ---------- */
function stepOf(p) { return p && p.u === "kg" ? 0.5 : 1; }
function qtyText(n) { return String(n).replace(".", ","); }
function unitText(item) {
  if (item.unit === "kg") return "kg";
  return item.quantity > 1 ? item.unit + "s" : item.unit;
}
function resetLlajua() {
  hasLlajua = false;
  var b = document.getElementById("chimiBtn");
  if (b) { b.innerText = "+ Bs 25.0"; b.classList.remove("added"); }
}

/* Cerrar ventanas con clic fuera o Escape, y bloquear el scroll del fondo */
document.addEventListener("DOMContentLoaded", function () {
  var ids = ["productModal", "checkoutDrawer"];
  function lock() {
    var open = ids.some(function (id) { var el = document.getElementById(id); return el && el.classList.contains("active"); });
    document.body.style.overflow = open ? "hidden" : "";
  }
  ids.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function (e) { if (e.target === el) el.classList.remove("active"); });
    new MutationObserver(lock).observe(el, { attributes: true, attributeFilter: ["class"] });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") ids.forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.remove("active"); });
  });
});
