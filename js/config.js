// ====== Configuracion del frontend ======
// URL del backend (API REST). En local usa localhost, en Render usa la URL publica.
const CONFIG = {
    API: ["localhost", "127.0.0.1"].includes(location.hostname)
        ? "http://localhost:8080/api/v1/usuarios"
        : "https://usuarios-backend-glgt.onrender.com/api/v1/usuarios",

    // Cambiar por los datos del alumno
    ALUMNO: "Gloria Leticia González Troncoso",
    BOLETA: "2023670143",
    GRUPO: "7CM1"
};

// Pone el nombre del alumno en el pie de pagina
document.addEventListener("DOMContentLoaded", () => {
    const pie = document.getElementById("pie");
    if (pie) pie.textContent = `${CONFIG.ALUMNO} · ${CONFIG.BOLETA} · ${CONFIG.GRUPO} · UPIIZ-IPN`;
});
