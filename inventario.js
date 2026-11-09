
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
