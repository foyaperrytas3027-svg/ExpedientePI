const amantesIniciales = [
    { nombre: "Ambar", detalle: "Registro en expediente" },
    { nombre: "Andrea", detalle: "\"La que canta tiempo\"" },
    { nombre: "Angela", detalle: "misma carrera (Psicología - UPC)" },
    { nombre: "Brenda", detalle: "\"La que le gusta rascarse\"" },
    { nombre: "Brutanica", detalle: "Del Británico" },
    { nombre: "Fabiana Ortiz", detalle: "Registro en expediente" },
    { nombre: "Fabiana Sanchez", detalle: "promo de colegio" },
    { nombre: "Gabriela Rimari", detalle: "promo de colegio" },
    { nombre: "Lucia", detalle: "promo de colegio" },
    { nombre: "Marta", detalle: "Española del Smart Fit" },
    { nombre: "Yara", detalle: "\"La del Cuidado\" — Del Británico" }
];

const trampasIniciales = [
    {
        titulo: "Expuesto 01 — Salida descubierta del Británico",
        descripcion: "Dijo que estaba en clase de inglés sin poder usar el celular, pero fue descubierto saliendo acompañado de chicas del Británico fuera de horario."
    },
    {
        titulo: "Expuesto 02 — Descubierto en el Smart Fit",
        descripcion: "Aseguró estar entrenando solo en el gimnasio y terminó siendo expuesto entrenando y coqueteando con la española del Smart Fit."
    },
    {
        titulo: "Expuesto 03 — Reunión oculta con las de la promo y UPC",
        descripcion: "Negó haber visto a nadie ese fin de semana, hasta que salieron a la luz pruebas de su encuentro y quedó completamente expuesto."
    }
];

function obtenerDatos(clave, respaldo) {
    const guardado = localStorage.getItem(clave);
    if (guardado) {
        try {
            return JSON.parse(guardado);
        } catch (e) {
            return [...respaldo];
        }
    }
    return [...respaldo];
}

function renderizarAmantes() {
    const lista = document.getElementById("lista-amantes-ul");
    if (!lista) return;

    const amantes = obtenerDatos("perico_amantes_v2", amantesIniciales);
    amantes.sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

    lista.innerHTML = "";
    amantes.forEach((item) => {
        const li = document.createElement("li");
        const textoDetalle = item.detalle ? ` — ${item.detalle}` : "";
        li.innerHTML = `<strong>${escaparHTML(item.nombre)}</strong>${escaparHTML(textoDetalle)}`;
        lista.appendChild(li);
    });
}

function agregarAmante(evento) {
    evento.preventDefault();
    const inputNombre = document.getElementById("nuevo-nombre");
    const inputDetalle = document.getElementById("nuevo-detalle");

    const nombre = inputNombre.value.trim();
    const detalle = inputDetalle.value.trim();
    if (!nombre) return;

    const amantes = obtenerDatos("perico_amantes_v2", amantesIniciales);
    amantes.push({ nombre, detalle });
    localStorage.setItem("perico_amantes_v2", JSON.stringify(amantes));

    inputNombre.value = "";
    inputDetalle.value = "";
    renderizarAmantes();
}

function renderizarTrampas() {
    const contenedor = document.getElementById("lista-trampas-contenedor");
    if (!contenedor) return;

    const trampas = obtenerDatos("perico_trampas_v2", trampasIniciales);
    contenedor.innerHTML = "";

    trampas.forEach((item, indice) => {
        const div = document.createElement("div");
        const direccion = indice % 2 === 0 ? "reveal-left" : "reveal-right";
        div.className = `documento reveal-scroll ${direccion}`;
        div.innerHTML = `
            <h3>${escaparHTML(item.titulo)}</h3>
            <p>${escaparHTML(item.descripcion)}</p>
        `;
        contenedor.appendChild(div);
    });

    observarElementosScroll();
}

function agregarTrampa(evento) {
    evento.preventDefault();
    const inputTitulo = document.getElementById("trampa-titulo");
    const inputDesc = document.getElementById("trampa-desc");

    const titulo = inputTitulo.value.trim();
    const descripcion = inputDesc.value.trim();
    if (!titulo || !descripcion) return;

    const trampas = obtenerDatos("perico_trampas_v2", trampasIniciales);
    trampas.unshift({ titulo, descripcion });
    localStorage.setItem("perico_trampas_v2", JSON.stringify(trampas));

    inputTitulo.value = "";
    inputDesc.value = "";
    renderizarTrampas();
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function mostrarSeccion(idSeccion, boton) {
    const secciones = document.querySelectorAll(".seccion");
    secciones.forEach((seccion) => {
        seccion.classList.remove("activa");
    });

    const botones = document.querySelectorAll(".nav-btn, .home-corner-btn");
    botones.forEach((btn) => {
        btn.classList.remove("active");
    });

    const seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
        seccionActiva.classList.add("activa");
    }

    if (boton) {
        boton.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    observarElementosScroll();
    actualizarBarraProgreso();
}

let observadorScroll = null;

function crearObservadorScroll() {
    if (!("IntersectionObserver" in window)) return null;

    return new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("is-visible");
            } else {
                // Desaparece al salir de pantalla (subiendo o bajando)
                entrada.target.classList.remove("is-visible");
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: "0px 0px -30px 0px"
    });
}

function observarElementosScroll() {
    if (!observadorScroll) {
        observadorScroll = crearObservadorScroll();
    }

    const elementos = document.querySelectorAll(".seccion.activa .reveal-scroll");
    elementos.forEach((el, indice) => {
        el.style.setProperty("--reveal-delay", `${(indice % 4) * 75}ms`);
        if (observadorScroll) {
            el.classList.remove("is-visible");
            observadorScroll.unobserve(el);
            observadorScroll.observe(el);
        } else {
            el.classList.add("is-visible");
        }
    });
}

function actualizarBarraProgreso() {
    const barra = document.getElementById("scroll-progress");
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    document.documentElement.style.setProperty("--scroll-y", `${scrollTop}px`);

    if (!barra) return;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const porcentaje = alturaTotal > 0 ? Math.min(100, (scrollTop / alturaTotal) * 100) : 0;
    barra.style.width = `${porcentaje}%`;
}

function iniciarEfectoInteractivoTarjetas() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tarjetas = document.querySelectorAll(".evidencia-card");
    tarjetas.forEach((tarjeta) => {
        tarjeta.addEventListener("mousemove", (e) => {
            const rect = tarjeta.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rotX = (-y * 8).toFixed(2);
            const rotY = (x * 8).toFixed(2);
            tarjeta.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.02)`;
        });

        tarjeta.addEventListener("mouseleave", () => {
            tarjeta.style.transform = "";
        });
    });
}

let fotosVisorActual = [];
let indiceVisorActual = 0;

function obtenerFotosSeccionActiva() {
    const tarjetas = document.querySelectorAll(".seccion.activa .evidencia-card");
    return Array.from(tarjetas).map((tarjeta) => {
        const img = tarjeta.querySelector("img");
        const caption = tarjeta.querySelector("figcaption");
        return {
            src: img ? img.getAttribute("src") : "",
            caption: caption ? caption.textContent.trim() : ""
        };
    }).filter((item) => item.src);
}

function abrirVisor(rutaImagen, descripcion) {
    const modal = document.getElementById("visor-imagen");
    const img = document.getElementById("visor-img");
    const caption = document.getElementById("visor-caption");
    if (!modal || !img || !caption) return;

    fotosVisorActual = obtenerFotosSeccionActiva();
    indiceVisorActual = fotosVisorActual.findIndex((f) => f.src === rutaImagen);

    img.src = rutaImagen;
    caption.textContent = descripcion || "";
    modal.classList.add("abierto");
    modal.setAttribute("aria-hidden", "false");
}

function navegarVisor(direccion, evento) {
    if (evento) evento.stopPropagation();
    if (!fotosVisorActual.length) return;

    indiceVisorActual = (indiceVisorActual + direccion + fotosVisorActual.length) % fotosVisorActual.length;
    const foto = fotosVisorActual[indiceVisorActual];

    const img = document.getElementById("visor-img");
    const caption = document.getElementById("visor-caption");
    if (img) img.src = foto.src;
    if (caption) caption.textContent = foto.caption;
}

function cerrarVisor(evento) {
    const modal = document.getElementById("visor-imagen");
    if (!modal) return;

    if (!evento || evento.target === modal || evento.target.classList.contains("visor-cerrar")) {
        modal.classList.remove("abierto");
        modal.setAttribute("aria-hidden", "true");
    }
}

document.addEventListener("keydown", (evento) => {
    const modal = document.getElementById("visor-imagen");
    const estaAbierto = modal && modal.classList.contains("abierto");
    if (!estaAbierto) return;

    if (evento.key === "Escape") {
        cerrarVisor();
    } else if (evento.key === "ArrowLeft") {
        navegarVisor(-1);
    } else if (evento.key === "ArrowRight") {
        navegarVisor(1);
    }
});

window.addEventListener("scroll", actualizarBarraProgreso, { passive: true });
window.addEventListener("resize", actualizarBarraProgreso);

// Cambia aquí la contraseña del expediente cuando quieras
const CLAVE_ACCESO = "perico001";

function desbloquearExpediente() {
    document.body.classList.remove("bloqueado");
    const pantalla = document.getElementById("pantalla-acceso");
    if (pantalla) pantalla.classList.add("oculto");
    observarElementosScroll();
    actualizarBarraProgreso();
}

function verificarAccesoInicial() {
    if (sessionStorage.getItem("perico_acceso_ok") === "1") {
        desbloquearExpediente();
    }
}

function validarClave(evento) {
    evento.preventDefault();
    const input = document.getElementById("input-clave");
    const error = document.getElementById("error-clave");
    const tarjeta = document.querySelector(".tarjeta-acceso");
    if (!input) return;

    if (input.value === CLAVE_ACCESO) {
        sessionStorage.setItem("perico_acceso_ok", "1");
        if (error) error.textContent = "";
        desbloquearExpediente();
    } else {
        if (error) error.textContent = "Contraseña incorrecta. Acceso denegado.";
        if (tarjeta) {
            tarjeta.classList.remove("error-sacudida");
            void tarjeta.offsetWidth;
            tarjeta.classList.add("error-sacudida");
        }
        input.value = "";
        input.focus();
    }
}

function alternarVisibilidadClave() {
    const input = document.getElementById("input-clave");
    const boton = document.querySelector(".btn-ver-clave");
    if (!input || !boton) return;

    if (input.type === "password") {
        input.type = "text";
        boton.textContent = "Ocultar";
    } else {
        input.type = "password";
        boton.textContent = "Ver";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    verificarAccesoInicial();
    renderizarAmantes();
    renderizarTrampas();
    observarElementosScroll();
    actualizarBarraProgreso();
    iniciarEfectoInteractivoTarjetas();
});
