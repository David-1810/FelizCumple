const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const contador = document.getElementById('contador');
const portada = document.getElementById('portada-inicio');
const musicaFondo = document.getElementById('musica-fondo');
const notaVoz = document.getElementById('nota-voz');
const playAudioBtn = document.getElementById('playAudioBtn');

let currentIndex = 0;
let presentacionComenzada = false;

// Variable para rastrear si el ticket fue desbloqueado
let ticketDesbloqueado = false;

// CARGA Y VERIFICACIÓN DE MODO GRABACIÓN
window.addEventListener('load', () => {
    const pc = document.getElementById('pantalla-carga');
    const urlParams = new URLSearchParams(window.location.search);
    
    // Ocultar pantalla de carga
    setTimeout(() => { 
        pc.style.opacity = '0'; 
        setTimeout(() => { pc.style.display = 'none'; }, 800); 
    }, 1200);

    // Si se accede con ?grabar=true en la URL
    if (urlParams.get('grabar') === 'true') {
        document.body.classList.add('modo-cine');
        
        // Dar tiempo a que desaparezca la pantalla de carga y abrir regalo
        setTimeout(() => {
            comenzarPresentacion();
            
            // Avanzar tocando la pantalla a tu propio ritmo
            document.body.addEventListener('click', (e) => {
                // Evita que cambie de diapositiva si tocas el botón de la nota de voz final o el botón flotante
                if (e.target.id === 'playAudioBtn' || e.target.closest('#playAudioBtn') || e.target.id === 'btn-abrir-ticket' || e.target.closest('#btn-abrir-ticket')) return;
                
                // Solo avanza si la presentación ya empezó y no estamos en la última foto
                if (presentacionComenzada && currentIndex < slides.length - 1) {
                    showSlide(currentIndex + 1);
                }
            });
            
        }, 2200);
    }
});

function lanzarConfeti() {
    const emojis = ['🎉', '✨', '🌴', '🐚', '🌊', '🎈', '💖', '⭐'];
    for (let i = 0; i < 60; i++) {
        const e = document.createElement('div');
        e.className = 'confeti';
        e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        e.style.left = Math.random() * 100 + 'vw';
        e.style.setProperty('--desviacion-x', (Math.random() * 200 - 100) + 'px');
        e.style.setProperty('--rotacion-final', (Math.random() * 720) + 'deg');
        e.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
        e.style.animationDelay = (Math.random() * 0.8) + 's';
        e.style.animationDuration = (Math.random() * 1.5 + 2) + 's';
        document.body.appendChild(e);
        setTimeout(() => { e.remove(); }, 3800);
    }
}

// Nueva función para reproducir correctamente los videos visibles
function playCurrentMedia() {
    const currentSlide = slides[currentIndex];
    const videos = currentSlide.querySelectorAll('video');
    videos.forEach(v => {
        // Solo reproduce el video si NO está oculto por el CSS
        if (window.getComputedStyle(v).display !== 'none') {
            v.currentTime = 0;
            v.muted = true;
            v.play();
        }
    });
}

function comenzarPresentacion() {
    if (presentacionComenzada) return;
    presentacionComenzada = true;
    if (musicaFondo) {
        musicaFondo.currentTime = 15;
        musicaFondo.volume = 0;
        musicaFondo.play().then(() => {
            let subir = setInterval(() => {
                if (musicaFondo.volume < 0.9) musicaFondo.volume += 0.05;
                else { musicaFondo.volume = 1; clearInterval(subir); }
            }, 150);
        });
    }
    lanzarConfeti();
    portada.style.opacity = '0';
    setTimeout(() => {
        portada.style.display = 'none';
        playCurrentMedia(); // Reproducir medio correcto inicial
    }, 600);
}

function toggleNotaVoz() {
    if (notaVoz.paused) {
        let bajar = setInterval(() => {
            if (musicaFondo.volume > 0.15) musicaFondo.volume -= 0.1;
            else { musicaFondo.volume = 0.05; clearInterval(bajar); }
        }, 50);
        notaVoz.play();
        playAudioBtn.textContent = "⏸️";
        playAudioBtn.classList.add('reproduciendo');
    } else { pausarNotaVoz(); }
}

function pausarNotaVoz() {
    notaVoz.pause();
    playAudioBtn.textContent = "🎤";
    playAudioBtn.classList.remove('reproduciendo');
    let subir = setInterval(() => {
        if (musicaFondo.volume < 0.9) musicaFondo.volume += 0.1;
        else { musicaFondo.volume = 1; clearInterval(subir); }
    }, 50);
}

// FUNCIÓN PARA ABRIR EL TICKET
function abrirTicket() {
    const overlayTicket = document.getElementById('overlay-ticket');
    if (overlayTicket) {
        overlayTicket.style.display = 'flex';
        setTimeout(() => {
            overlayTicket.style.opacity = '1';
        }, 50);
        lanzarConfeti();
    }
}

// LÓGICA AL TERMINAR LA NOTA DE VOZ
if (notaVoz) {
    notaVoz.addEventListener('ended', () => { 
        pausarNotaVoz(); 
        
        // El ticket queda desbloqueado
        ticketDesbloqueado = true;
        
        // Mostrar el botón flotante
        const btnTicket = document.getElementById('btn-abrir-ticket');
        if (btnTicket) {
            btnTicket.classList.add('visible');
        }
        
        // Abrir el ticket automáticamente la primera vez
        abrirTicket();
    });
}

function showSlide(index) {
    if (!presentacionComenzada) return;
    if (notaVoz && !notaVoz.paused) pausarNotaVoz();
    
    // Pausar TODOS los videos de la diapositiva actual y resetearlos para liberar memoria
    const currentVideos = slides[currentIndex].querySelectorAll('video');
    currentVideos.forEach(v => {
        v.pause();
        v.currentTime = 0; // Esto ayuda a limpiar la memoria caché del video anterior
    });
    
    slides[currentIndex].classList.remove('active');
    currentIndex = index;
    if (currentIndex >= slides.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = slides.length - 1;
    slides[currentIndex].classList.add('active');
    contador.textContent = `${currentIndex + 1} / ${slides.length}`;
    
    playCurrentMedia(); // Reproducir solo el medio visible de la nueva diapositiva

    // OCULTAR O MOSTRAR EL BOTÓN FLOTANTE
    const btnTicket = document.getElementById('btn-abrir-ticket');
    if (btnTicket) {
        // Solo se muestra si estamos en la última diapositiva (15) y ya desbloqueó el ticket
        if (currentIndex === slides.length - 1 && ticketDesbloqueado) {
            btnTicket.classList.add('visible');
        } else {
            btnTicket.classList.remove('visible');
        }
    }

    // =================================================================
    // TRUCO DE PRECARGA INTELIGENTE PARA LA SIGUIENTE DIAPOSITIVA
    // =================================================================
    let nextIndex = (currentIndex + 1) % slides.length;
    const nextVideos = slides[nextIndex].querySelectorAll('video');
    nextVideos.forEach(v => {
        // Si el video de la próxima diapo aún no está totalmente cargado, lo forzamos en segundo plano
        if (v.getAttribute('preload') !== 'auto') {
            v.setAttribute('preload', 'auto');
            v.load(); // El navegador empieza a descargarlo silenciosamente mientras el usuario ve la diapo actual
        }
    });
    // =================================================================
}

nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));

// SWIPE
let ts = 0;
const slider = document.getElementById('slider');
slider.addEventListener('touchstart', e => ts = e.changedTouches[0].screenX);
slider.addEventListener('touchend', e => {
    let te = e.changedTouches[0].screenX;
    if (te < ts - 40) showSlide(currentIndex + 1);
    if (te > ts + 40) showSlide(currentIndex - 1);
});

// FUNCIÓN PARA CERRAR EL TICKET POR SI QUIERE SEGUIR EXPLORANDO LA TARJETA
function cerrarTicket() {
    const overlayTicket = document.getElementById('overlay-ticket');
    if (overlayTicket) {
        overlayTicket.style.opacity = '0';
        setTimeout(() => {
            overlayTicket.style.display = 'none';
        }, 1200); // Espera a que termine la animación para ocultarlo por completo
    }
}