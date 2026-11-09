// ==========================================
// LÓGICA DEL CARRITO DE COMPRAS
// ==========================================

let productos = JSON.parse(localStorage.getItem("ferrominasInventario")) || [
    {id:1,nombre:"Manguera de succión",categoria:"Minería",cantidad:12,minimo:5},
    {id:2,nombre:"Malla electrosoldada",categoria:"Minería",cantidad:3,minimo:6},
    {id:3,nombre:"Bomba de agua",categoria:"Minería",cantidad:4,minimo:2},
    {id:4,nombre:"Guantes de seguridad",categoria:"Minería",cantidad:18,minimo:8},
    {id:5,nombre:"Tornillos",categoria:"Ferretería",cantidad:40,minimo:15},
    {id:6,nombre:"Discos de corte",categoria:"Ferretería",cantidad:5,minimo:10},
    {id:7,nombre:"Tubería PVC",categoria:"Ferretería",cantidad:20,minimo:8}
];

let filtroActual = "Todos";

const tabla = document.getElementById("tablaInventario");

function guardar() {
    localStorage.setItem(
        "ferrominasInventario",
        JSON.stringify(productos)
    );
}

function actualizar() {

    let totalUnidades = productos.reduce(
        (suma,p) => suma + p.cantidad,0
    );

    let bajos = productos.filter(
        p => p.cantidad <= p.minimo
    );

    document.getElementById("totalProductos").textContent =
        productos.length;

    document.getElementById("totalUnidades").textContent =
        totalUnidades;

    document.getElementById("productosBajos").textContent =
        bajos.length;

    let lista = productos.filter(p => {

        if(filtroActual === "Todos") return true;

        if(filtroActual === "Bajo")
            return p.cantidad <= p.minimo;

        return p.categoria === filtroActual;
    });

    tabla.innerHTML = "";

    if(lista.length === 0) {
        tabla.innerHTML = `
        <tr>
            <td colspan="6">No hay productos registrados.</td>
        </tr>`;
    }

    lista.forEach(p => {

        let estado = p.cantidad <= p.minimo
            ? '<span class="estado-bajo">Por reponer</span>'
            : '<span class="estado-ok">Disponible</span>';

        tabla.innerHTML += `
        <tr>
            <td>${escapar(p.nombre)}</td>
            <td>${p.categoria}</td>
            <td>${p.cantidad}</td>
            <td>${p.minimo}</td>
            <td>${estado}</td>
            <td class="acciones">
                <button onclick="editar(${p.id})">Editar</button>
                <button onclick="eliminar(${p.id})">Eliminar</button>
            </td>
        </tr>`;
    });
}

function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, c => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
    }[c]));
}

// AGREGAR PRODUCTOS

document.getElementById("formulario").addEventListener(
    "submit", function(e) {

    e.preventDefault();

    let nombre = document.getElementById("nombre").value.trim();
    let categoria = document.getElementById("categoria").value;
    let cantidad = Number(document.getElementById("cantidad").value);
    let minimo = Number(document.getElementById("minimo").value);

    if(!nombre || cantidad < 0 || minimo < 0) {
        alert("Verifica los datos del producto.");
        return;
    }

    productos.push({
        id:Date.now(),
        nombre,
        categoria,
        cantidad,
        minimo
    });

    guardar();
    actualizar();

    this.reset();

    document.getElementById("minimo").value = 5;

    alert("Producto agregado correctamente.");
});

// EDITAR PRODUCTOS

function editar(id) {

    let p = productos.find(x => x.id === id);

    if(!p) return;

    let nombre = prompt("Nombre del producto:",p.nombre);
    if(nombre === null) return;

    let cantidad = prompt("Cantidad disponible:",p.cantidad);
    if(cantidad === null) return;

    let minimo = prompt("Stock mínimo:",p.minimo);
    if(minimo === null) return;

    if(!nombre.trim() || cantidad.trim()==="" ||
       minimo.trim()==="" || Number(cantidad)<0 ||
       Number(minimo)<0 || !Number.isFinite(Number(cantidad)) ||
       !Number.isFinite(Number(minimo))) {
        alert("Datos inválidos.");
        return;
    }

    p.nombre = nombre.trim();
    p.cantidad = Number(cantidad);
    p.minimo = Number(minimo);

    guardar();
    actualizar();
}

// ELIMINAR PRODUCTOS

function eliminar(id) {

    if(confirm("¿Deseas eliminar este producto?")) {

        productos = productos.filter(p => p.id !== id);

        guardar();
        actualizar();
    }
}

// FILTRAR

function filtrar(tipo) {
    filtroActual = tipo;
    actualizar();
}

// EXPORTAR INVENTARIO

function exportarCSV() {

    let contenido = [
        ["Producto","Categoría","Existencias","Stock mínimo"],
        ...productos.map(p => [
            p.nombre,p.categoria,p.cantidad,p.minimo
        ])
    ];

    let csv = contenido.map(fila =>
        fila.map(valor =>
            `"${String(valor).replace(/"/g,'""')}"`
        ).join(",")
    ).join("\n");

    let archivo = new Blob(
        ["\uFEFF" + csv],
        {type:"text/csv;charset=utf-8;"}
    );

    let enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "inventario-ferrominas-canton.csv";
    enlace.click();

    URL.revokeObjectURL(enlace.href);
}

actualizar();

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
