// ====== Buscador de personas (AJAX con fetch) ======
const MINIMO = 3;
const inputQ = document.getElementById("q");
const aviso = document.getElementById("aviso");
const cargando = document.getElementById("cargando");
const total = document.getElementById("totalResultados");
const contenedor = document.getElementById("resultados");
let espera;

const escapar = (t) => String(t ?? "").replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function subrayar(texto, buscado) {
    const limpio = escapar(texto);
    const patron = new RegExp("(" + buscado.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return limpio.replace(patron, "<mark>$1</mark>");
}

function reiniciar() {
    aviso.classList.add("d-none");
    total.classList.add("d-none");
    contenedor.innerHTML = "";
}

function mostrarAviso(texto) {
    reiniciar();
    aviso.textContent = texto;
    aviso.classList.remove("d-none");
}

function pintar(lista, buscado) {
    reiniciar();
    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center vacio py-5">
                <i class="bi bi-emoji-frown d-block mb-2"></i>
                No encontramos a nadie con "${escapar(buscado)}"
            </div>`;
        return;
    }
    total.textContent = `${lista.length} resultado${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}`;
    total.classList.remove("d-none");

    contenedor.innerHTML = lista.map(p => {
        const iniciales = (p.nombre.charAt(0) + p.apellidoPaterno.charAt(0)).toUpperCase();
        const completo = `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`;
        return `
            <div class="col-sm-6 col-lg-4">
                <div class="persona">
                    <div class="avatar">${escapar(iniciales)}</div>
                    <div class="fw-semibold">${subrayar(completo, buscado)}</div>
                    <span class="arroba">@${subrayar(p.usuario, buscado)}</span>
                </div>
            </div>`;
    }).join("");
}

async function buscar() {
    const texto = inputQ.value.trim();

    // Con menos de 3 caracteres no se manda la peticion
    if (texto.length < MINIMO) {
        texto.length === 0 ? reiniciar() : mostrarAviso("La búsqueda debe contener al menos 3 caracteres.");
        return;
    }

    cargando.classList.remove("d-none");
    try {
        const res = await fetch(`${CONFIG.API}/buscar?texto=${encodeURIComponent(texto)}`);
        const json = await res.json();
        if (res.ok) {
            pintar(json, texto);
        } else {
            mostrarAviso(json.mensaje || "Ocurrió un error al buscar.");
        }
    } catch (err) {
        mostrarAviso("No hay conexión con el servidor.");
    } finally {
        cargando.classList.add("d-none");
    }
}

// Busca mientras escribes (espera 400 ms despues de la ultima tecla)
inputQ.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(buscar, 400);
});

document.getElementById("buscarForm").addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(espera);
    buscar();
});
