// ====== Registro de usuario (AJAX con fetch) ======
const form = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");
const btnEnviar = document.getElementById("btnEnviar");
const campos = ["nombre", "apellidoPaterno", "apellidoMaterno", "correo", "usuario", "password", "fechaNacimiento"];

// Mostrar / ocultar contraseña
document.getElementById("verPassword").addEventListener("click", function () {
    const input = document.getElementById("password");
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    this.innerHTML = visible ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
});

function marcarError(id, texto) {
    const input = document.getElementById(id);
    input.classList.add("is-invalid");
    input.parentElement.querySelector(".invalid-feedback").textContent = texto;
}

function limpiarErrores() {
    campos.forEach(id => document.getElementById(id).classList.remove("is-invalid"));
    mensaje.classList.add("d-none");
}

function mostrarMensaje(texto, tipo) {
    const icono = tipo === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill";
    mensaje.className = `alert alert-${tipo} d-flex align-items-center gap-2`;
    mensaje.innerHTML = `<i class="bi ${icono}"></i><span></span>`;
    mensaje.querySelector("span").textContent = texto;
}

// Validaciones del lado del cliente (el backend vuelve a validar todo)
function validar(d) {
    let ok = true;
    campos.forEach(id => {
        if (!d[id] || !d[id].trim()) {
            marcarError(id, "Este campo es obligatorio.");
            ok = false;
        }
    });
    if (!ok) return false;

    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(d.correo.trim())) {
        marcarError("correo", "El correo electrónico no tiene un formato válido.");
        ok = false;
    }
    if (d.usuario.trim().length < 5) {
        marcarError("usuario", "El usuario debe tener al menos 5 caracteres.");
        ok = false;
    }
    if (d.password.length < 8) {
        marcarError("password", "La contraseña debe tener al menos 8 caracteres.");
        ok = false;
    }
    const fecha = new Date(d.fechaNacimiento + "T00:00:00");
    if (isNaN(fecha) || fecha > new Date()) {
        marcarError("fechaNacimiento", "La fecha de nacimiento no es válida.");
        ok = false;
    }
    return ok;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();

    const datos = {};
    campos.forEach(id => datos[id] = document.getElementById(id).value);

    if (!validar(datos)) {
        mostrarMensaje("Revisa los campos marcados en rojo.", "danger");
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

    try {
        const res = await fetch(CONFIG.API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        const json = await res.json();

        if (res.ok) {
            mostrarMensaje("Usuario registrado correctamente.", "success");
            form.reset();
        } else {
            const texto = json.mensaje || "No se pudo registrar el usuario.";
            mostrarMensaje(texto, "danger");
            // Si el error es de correo o usuario repetido, marcamos ese campo
            if (/correo/i.test(texto)) marcarError("correo", texto);
            else if (/usuario/i.test(texto)) marcarError("usuario", texto);
        }
    } catch (err) {
        mostrarMensaje("No hay conexión con el servidor. Intenta de nuevo en unos segundos.", "danger");
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Crear cuenta";
    }
});
