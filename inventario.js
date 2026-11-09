// ==========================================
// LÓGICA DEL CARRITO DE COMPRAS
// ==========================================

let carrito = JSON.parse(localStorage.getItem("ferrominasCarrito")) || [];

function guardarCarrito() {
    localStorage.setItem("ferrominasCarrito", JSON.stringify(carrito));
}

function toggleCarrito() {
    const modal = document.getElementById("modalCarrito");
    modal.classList.toggle("activo");
}

function agregarAlCarrito(nombre, precio) {
    let item = carrito.find(i => i.nombre === nombre);

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }

    guardarCarrito();
    actualizarCarritoUI();
    alert(`"${nombre}" se añadió al carrito.`);
}

function cambiarCantidadCarrito(nombre, cambio) {
    let item = carrito.find(i => i.nombre === nombre);
    if (!item) return;

    item.cantidad += cambio;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.nombre !== nombre);
    }

    guardarCarrito();
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const cartCount = document.getElementById("cartCount");
    const listaCarrito = document.getElementById("listaCarrito");
    const totalPrecio = document.getElementById("totalPrecioCarrito");

    let totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    let totalPagar = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    if (cartCount) cartCount.textContent = totalItems;
    if (totalPrecio) totalPrecio.textContent = `$ ${totalPagar.toLocaleString("es-CO")}`;

    if (!listaCarrito) return;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p style='text-align:center; color:#737c82;'>El carrito está vacío.</p>";
        return;
    }

    listaCarrito.innerHTML = "";
    carrito.forEach(item => {
        listaCarrito.innerHTML += `
            <div class="item-carrito">
                <div class="item-info">
                    <h4>${escapar(item.nombre)}</h4>
                    <span>$ ${item.precio.toLocaleString("es-CO")} x ${item.cantidad} = $ ${(item.precio * item.cantidad).toLocaleString("es-CO")}</span>
                </div>
                <div class="item-controles">
                    <button onclick="cambiarCantidadCarrito('${item.nombre}', -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidadCarrito('${item.nombre}', 1)">+</button>
                </div>
            </div>
        `;
    });
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let mensaje = "Hola, me gustaría realizar el siguiente pedido en Ferrominas Cantón:\n\n";
    let total = 0;

    carrito.forEach(item => {
        let subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `• ${item.nombre} x${item.cantidad} - $${subtotal.toLocaleString("es-CO")}\n`;
    });

    mensaje += `\n*Total a pagar:* $${total.toLocaleString("es-CO")}`;

    let numeroWhatsApp = "573000000000"; // Reemplaza con tu número real con código de país
    let url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
}

// Inicializar la vista del carrito al cargar la página
actualizarCarritoUI();