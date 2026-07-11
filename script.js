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
    
    setTimeout(() => { 
        pc.style.opacity = '0'; 
        setTimeout(() => { pc.style.display = 'none'; }, 800); 
    }, 1200);

    if (urlParams.get('grabar') === 'true') {
        document.body.classList.add('modo-cine');
        
        setTimeout(() => {
            comenzarPresentacion();
            
            document.body.addEventListener('click', (e) => {
                if (e.target.id === 'playAudioBtn' || e.target.closest('#playAudioBtn') || e.target.id === 'btn-abrir-ticket' || e.target.closest('#btn-abrir-ticket')) return;
                
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

function playCurrentMedia() {
    const currentSlide = slides[currentIndex];
    const videos = currentSlide.querySelectorAll('video');
    videos.forEach(v => {
        if (window.getComputedStyle(v).display !== 'none') {
            v.currentTime = 0;
            v.muted = true;
            v.play();
        }
    });
}

// =========================================================
// NUEVA FUNCIÓN: Desactiva visualmente los botones en los límites
// =========================================================
function actualizarEstadoBotones() {
    if (currentIndex === 0) {
        prevBtn.style.opacity = '0.4';
        prevBtn.style.pointerEvents = 'none'; // Desactiva el clic
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto'; // Activa el clic
    }

    if (currentIndex === slides.length - 1) {
        nextBtn.style.opacity = '0.4';
        nextBtn.style.pointerEvents = 'none'; // Desactiva el clic
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto'; // Activa el clic
    }
}
// =========================================================

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
        playCurrentMedia();
        actualizarEstadoBotones(); // Asegura que el botón "Atrás" inicie apagado
    }, 600);
}

function toggleNotaVoz() {
    if (notaVoz.paused) {
        let bajar = setInterval(() => {
            if (musicaFondo.volume > 0.15) musicaFondo.volume -= 0.1;
            else { musicaFondo.volume = 0.09; clearInterval(bajar); }
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

if (notaVoz) {
    notaVoz.addEventListener('ended', () => { 
        pausarNotaVoz(); 
        ticketDesbloqueado = true;
        const btnTicket = document.getElementById('btn-abrir-ticket');
        if (btnTicket) {
            btnTicket.classList.add('visible');
        }
        abrirTicket();
    });
}

function showSlide(index) {
    if (!presentacionComenzada) return;
    
    // =========================================================
    // NUEVO: Bloquea el intento de pasar de la diapositiva 1 a la 16 y viceversa
    // =========================================================
    if (index < 0 || index >= slides.length) return;

    if (notaVoz && !notaVoz.paused) pausarNotaVoz();
    
    const currentVideos = slides[currentIndex].querySelectorAll('video');
    currentVideos.forEach(v => {
        v.pause();
        v.currentTime = 0;
    });
    
    slides[currentIndex].classList.remove('active');
    
    // El índice se actualiza de forma normal
    currentIndex = index;
    
    slides[currentIndex].classList.add('active');
    contador.textContent = `${currentIndex + 1} / ${slides.length}`;
    
    playCurrentMedia(); 
    
    // Actualizamos el estado visual de los botones "Atrás" y "Siguiente"
    actualizarEstadoBotones();

    const btnTicket = document.getElementById('btn-abrir-ticket');
    if (btnTicket) {
        if (currentIndex === slides.length - 1 && ticketDesbloqueado) {
            btnTicket.classList.add('visible');
        } else {
            btnTicket.classList.remove('visible');
        }
    }

    let nextIndex = (currentIndex + 1) % slides.length;
    const nextVideos = slides[nextIndex].querySelectorAll('video');
    nextVideos.forEach(v => {
        if (v.getAttribute('preload') !== 'auto') {
            v.setAttribute('preload', 'auto');
            v.load(); 
        }
    });
}

nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));

// SWIPE (deslizar con el dedo)
let ts = 0;
const slider = document.getElementById('slider');
slider.addEventListener('touchstart', e => ts = e.changedTouches[0].screenX);
slider.addEventListener('touchend', e => {
    let te = e.changedTouches[0].screenX;
    if (te < ts - 40) showSlide(currentIndex + 1);
    if (te > ts + 40) showSlide(currentIndex - 1);
});

function cerrarTicket() {
    const overlayTicket = document.getElementById('overlay-ticket');
    if (overlayTicket) {
        overlayTicket.style.opacity = '0';
        setTimeout(() => {
            overlayTicket.style.display = 'none';
        }, 1200);
    }
}