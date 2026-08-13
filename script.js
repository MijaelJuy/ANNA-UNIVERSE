/* =========================================================
   ANNA'S UNIVERSE V3
   Vanilla JS + optional GSAP/ScrollTrigger.
   GitHub Pages compatible. No build step required.
========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof window.gsap !== "undefined";

if (hasGSAP && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* =========================
   LOCAL AUDIO
========================= */

const launchAudio = document.getElementById("launchAudio");
const ambientAudio = document.getElementById("ambientAudio");
const recordAudio = document.getElementById("recordAudio");
const uiAudio = document.getElementById("uiAudio");
const soundControl = document.getElementById("soundControl");
const soundLabel = document.getElementById("soundLabel");

const allAudio = [launchAudio, ambientAudio, recordAudio, uiAudio];
let soundEnabled = true;
let missionStarted = false;
let recordPlaying = false;

ambientAudio.volume = 0.001;
launchAudio.volume = 0.55;
recordAudio.volume = 0.42;
uiAudio.volume = 0.12;
document.body.classList.add("sound-on");

function safePlay(audio, restart = false) {
    if (!soundEnabled || !audio) return Promise.resolve();
    if (restart) audio.currentTime = 0;
    const promise = audio.play();
    return promise?.catch(() => {});
}

function fadeAudio(audio, target, duration = .8) {
    if (!audio) return;
    const finalTarget = soundEnabled ? target : 0;

    if (hasGSAP && !reduceMotion) {
        gsap.to(audio, { volume: finalTarget, duration, overwrite: true });
        return;
    }

    audio.volume = finalTarget;
}

function playUiSound() {
    if (!soundEnabled) return;
    uiAudio.volume = .11;
    safePlay(uiAudio, true);
}

function updateSoundUI() {
    soundControl.setAttribute("aria-pressed", String(soundEnabled));
    soundLabel.textContent = soundEnabled ? "SONIDO / SOUND · ON" : "SONIDO / SOUND · OFF";
    document.body.classList.toggle("sound-on", soundEnabled);
    allAudio.forEach(audio => { audio.muted = !soundEnabled; });

    if (soundEnabled && missionStarted && ambientAudio.paused) {
        ambientAudio.volume = .10;
        safePlay(ambientAudio);
    }
}

soundControl.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateSoundUI();
    if (soundEnabled) playUiSound();
});

updateSoundUI();

/* =========================
   STAR FIELD + SHOOTING STARS
========================= */

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];
let shootingStars = [];
let lastShot = 0;
let nextShotDelay = randomBetween(7000, 13000);
let launchWarp = 0;

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createStars();
}

function createStars() {
    stars = [];
    const amount = Math.max(90, Math.floor((window.innerWidth * window.innerHeight) / 6200));

    for (let i = 0; i < amount; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 1.45 + .15,
            opacity: Math.random() * .8 + .12,
            twinkle: Math.random() * .012 + .003,
            depth: Math.random() * .8 + .2
        });
    }
}

function createShootingStar() {
    shootingStars.push({
        x: randomBetween(window.innerWidth * .15, window.innerWidth * .85),
        y: randomBetween(10, window.innerHeight * .42),
        vx: randomBetween(9, 15),
        vy: randomBetween(6, 10),
        length: randomBetween(70, 130),
        opacity: 1,
        life: 0
    });
}

function drawStar(star) {
    star.opacity += star.twinkle;
    if (star.opacity >= 1 || star.opacity <= .12) star.twinkle *= -1;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(236,243,255,${star.opacity})`;
    ctx.fill();

    if (launchWarp > .02) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = star.x - cx;
        const dy = star.y - cy;
        const distance = Math.hypot(dx, dy) || 1;
        const stretch = launchWarp * 74 * star.depth;

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + (dx / distance) * stretch, star.y + (dy / distance) * stretch);
        ctx.strokeStyle = `rgba(215,230,255,${Math.min(star.opacity, .55)})`;
        ctx.lineWidth = Math.max(.35, star.radius * .7);
        ctx.stroke();
    }
}

function drawShootingStars() {
    shootingStars = shootingStars.filter(shot => shot.opacity > .02 && shot.life < 100);

    shootingStars.forEach(shot => {
        shot.x += shot.vx;
        shot.y += shot.vy;
        shot.opacity *= .965;
        shot.life += 1;

        const magnitude = Math.hypot(shot.vx, shot.vy);
        const tailX = shot.x - (shot.vx / magnitude) * shot.length;
        const tailY = shot.y - (shot.vy / magnitude) * shot.length;
        const gradient = ctx.createLinearGradient(tailX, tailY, shot.x, shot.y);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(1, `rgba(235,244,255,${shot.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shot.x, shot.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.25;
        ctx.stroke();
    });
}

function animateStars(timestamp = 0) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach(drawStar);

    if (!reduceMotion && timestamp - lastShot > nextShotDelay && launchWarp < .2) {
        createShootingStar();
        lastShot = timestamp;
        nextShotDelay = randomBetween(7000, 13000);
    }

    drawShootingStars();
    requestAnimationFrame(animateStars);
}

window.addEventListener("resize", resizeCanvas, { passive: true });
resizeCanvas();
animateStars();

/* =========================
   HERO PARALLAX
========================= */

const heroTitle = document.getElementById("heroTitle");

if (!reduceMotion) {
    document.addEventListener("pointermove", event => {
        const x = event.clientX / window.innerWidth - .5;
        const y = event.clientY / window.innerHeight - .5;

        if (hasGSAP) {
            gsap.to(heroTitle, { x: x * 14, y: y * 10, duration: 1.1, ease: "power2.out", overwrite: true });
            gsap.to(canvas, { x: x * -7, y: y * -5, duration: 1.5, ease: "power2.out", overwrite: true });
        } else {
            heroTitle.style.transform = `translate(${x * 10}px, ${y * 7}px)`;
        }
    }, { passive: true });
}

/* =========================
   LAUNCH SEQUENCE
========================= */

const exploreBtn = document.getElementById("exploreBtn");
const launchOverlay = document.getElementById("launchOverlay");
const launchNumber = document.getElementById("launchNumber");
const launchStatus = document.getElementById("launchStatus");
const launchProgress = document.getElementById("launchProgress");
const launchSub = document.getElementById("launchSub");
let launching = false;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runLaunchSequence() {
    if (launching) return;
    launching = true;
    missionStarted = true;

    // Both files begin from the user's click so browsers permit audio.
    if (soundEnabled) {
        ambientAudio.volume = .001;
        safePlay(ambientAudio);
        safePlay(launchAudio, true);
    }

    document.body.classList.add("launching");
    launchOverlay.classList.add("active");
    launchOverlay.setAttribute("aria-hidden", "false");

    if (hasGSAP && !reduceMotion) {
        gsap.fromTo(launchOverlay, { opacity: 0 }, { opacity: 1, duration: .35 });
        gsap.to(launchProgress, { width: "100%", duration: 3.3, ease: "none" });
    } else {
        launchProgress.style.width = "100%";
    }

    const sequence = ["03", "02", "01"];
    for (const number of sequence) {
        launchNumber.textContent = number;
        if (hasGSAP && !reduceMotion) {
            gsap.fromTo(launchNumber, { scale: .78, opacity: 0 }, { scale: 1, opacity: 1, duration: .32, ease: "power2.out" });
        }
        await wait(reduceMotion ? 120 : 720);
    }

    launchStatus.textContent = "DESPEGUE / LIFTOFF";
    launchNumber.textContent = "GO";
    launchSub.textContent = "Trayectoria nominal · entrando al sistema estelar local";

    if (!reduceMotion) {
        const warp = { value: 0 };
        if (hasGSAP) {
            gsap.to(warp, {
                value: 1,
                duration: .85,
                ease: "power3.in",
                onUpdate: () => { launchWarp = warp.value; }
            });
        } else {
            launchWarp = .75;
        }
    }

    await wait(reduceMotion ? 160 : 780);

    document.getElementById("universe").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    await wait(reduceMotion ? 100 : 700);

    launchWarp = 0;
    fadeAudio(ambientAudio, .11, 1.8);

    if (hasGSAP && !reduceMotion) {
        await new Promise(resolve => gsap.to(launchOverlay, { opacity: 0, duration: .45, onComplete: resolve }));
    }

    launchOverlay.classList.remove("active");
    launchOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("launching");
    launchProgress.style.width = "0";
    launchStatus.textContent = "DESTINO BLOQUEADO / DESTINATION LOCKED";
    launchNumber.textContent = "03";
    launchSub.textContent = "Trayectoria: ANNA'S UNIVERSE";
    launching = false;
}

exploreBtn.addEventListener("click", runLaunchSequence);

/* =========================
   ALL 8 PLANETS + MODAL
========================= */

const planetInfo = {
    mercury: {
        code: "SOL-01",
        title: "Mercurio / Mercury",
        data: [
            ["TIPO", "ROCOSO"],
            ["DIÁMETRO", "4,879 KM"],
            ["GRAVEDAD", "3.70 M/S²"],
            ["ÓRBITA", "88 DÍAS"]
        ],
        message: "El planeta más cercano al Sol representa los comienzos: pequeños, veloces y capaces de alterar una trayectoria completa."
    },
    venus: {
        code: "SOL-02",
        title: "Venus",
        data: [
            ["TIPO", "ROCOSO"],
            ["DIÁMETRO", "12,104 KM"],
            ["GRAVEDAD", "8.87 M/S²"],
            ["ÓRBITA", "224.7 DÍAS"]
        ],
        message: "Un mundo cubierto por nubes intensas. Aquí guardé una idea sencilla: incluso lo que no podemos ver por completo puede seguir siendo extraordinario."
    },
    earth: {
        code: "SOL-03",
        title: "Tierra / Earth",
        data: [
            ["TIPO", "ROCOSO"],
            ["DIÁMETRO", "12,742 KM"],
            ["GRAVEDAD", "9.81 M/S²"],
            ["ÓRBITA", "365.25 DÍAS"],
            ["VIDA", "DETECTADA"],
            ["OBJETO DE INTERÉS", "ANNA"]
        ],
        message: "Podría explorar millones de mundos y aun así elegiría este por una razón muy concreta: tú estás aquí."
    },
    mars: {
        code: "SOL-04",
        title: "Marte / Mars",
        data: [
            ["TIPO", "ROCOSO"],
            ["DIÁMETRO", "6,779 KM"],
            ["GRAVEDAD", "3.71 M/S²"],
            ["ÓRBITA", "687 DÍAS"]
        ],
        message: "Marte representa todas las aventuras pendientes. Estado de la misión: todavía quedan demasiados lugares por descubrir juntos."
    },
    jupiter: {
        code: "SOL-05",
        title: "Júpiter / Jupiter",
        data: [
            ["TIPO", "GIGANTE GASEOSO"],
            ["DIÁMETRO", "139,820 KM"],
            ["GRAVEDAD", "24.79 M/S²"],
            ["ÓRBITA", "11.86 AÑOS"]
        ],
        message: "El planeta más grande del sistema. Aun así, no alcanza para guardar todo lo que todavía me gustaría vivir contigo."
    },
    saturn: {
        code: "SOL-06",
        title: "Saturno / Saturn",
        data: [
            ["TIPO", "GIGANTE GASEOSO"],
            ["DIÁMETRO", "116,460 KM"],
            ["GRAVEDAD", "10.44 M/S²"],
            ["ÓRBITA", "29.45 AÑOS"]
        ],
        message: "No sé exactamente dónde estaremos dentro de muchos años. Sí sé qué trayectoria me gustaría conservar: seguir orbitando cerca de ti."
    },
    uranus: {
        code: "SOL-07",
        title: "Urano / Uranus",
        data: [
            ["TIPO", "GIGANTE HELADO"],
            ["DIÁMETRO", "50,724 KM"],
            ["GRAVEDAD", "8.69 M/S²"],
            ["ÓRBITA", "84 AÑOS"]
        ],
        message: "Urano gira casi de lado. Una buena prueba de que no existe una única orientación correcta para recorrer el universo."
    },
    neptune: {
        code: "SOL-08",
        title: "Neptuno / Neptune",
        data: [
            ["TIPO", "GIGANTE HELADO"],
            ["DIÁMETRO", "49,244 KM"],
            ["GRAVEDAD", "11.15 M/S²"],
            ["ÓRBITA", "164.8 AÑOS"]
        ],
        message: "El último planeta del recorrido, pero no el final de la misión. Después de Neptuno todavía queda todo el espacio profundo."
    }
};

const planets = document.querySelectorAll(".planet");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalCode = document.getElementById("modalCode");
const planetData = document.getElementById("planetData");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

function openPlanetModal(key) {
    const info = planetInfo[key];
    if (!info) return;

    playUiSound();
    modalTitle.textContent = info.title;
    modalCode.textContent = info.code;
    modalMessage.textContent = info.message;
    planetData.innerHTML = info.data.map(([label, value]) => `
        <div class="data-cell">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `).join("");

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeModal.focus();
}

function hideModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

planets.forEach(planet => {
    const orbit = planet.closest(".orbit");

    planet.addEventListener("click", event => {
        event.stopPropagation();
        openPlanetModal(planet.dataset.planet);
    });

    planet.addEventListener("pointerenter", () => orbit?.classList.add("paused"));
    planet.addEventListener("pointerleave", () => orbit?.classList.remove("paused"));
    planet.addEventListener("focus", () => orbit?.classList.add("paused"));
    planet.addEventListener("blur", () => orbit?.classList.remove("paused"));
});

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", event => {
    if (event.target === modal) hideModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("active")) hideModal();
});

/* =========================
   ANNA CONSTELLATION TOOLTIP
========================= */

const constellationStage = document.querySelector(".constellation-stage");
const annaStars = document.querySelectorAll(".anna-star");
const starTooltip = document.getElementById("starTooltip");
const starTooltipText = document.getElementById("starTooltipText");

function moveStarTooltip(event) {
    const rect = constellationStage.getBoundingClientRect();
    starTooltip.style.left = `${event.clientX - rect.left}px`;
    starTooltip.style.top = `${event.clientY - rect.top}px`;
}

annaStars.forEach(star => {
    star.addEventListener("pointerenter", event => {
        starTooltipText.textContent = star.dataset.name || "ANNA";
        starTooltip.classList.add("visible");
        starTooltip.setAttribute("aria-hidden", "false");
        moveStarTooltip(event);
    });

    star.addEventListener("pointermove", moveStarTooltip);

    star.addEventListener("pointerleave", () => {
        starTooltip.classList.remove("visible");
        starTooltip.setAttribute("aria-hidden", "true");
    });

    star.addEventListener("click", playUiSound);
});

/* =========================
   SCROLL ANIMATIONS
========================= */

if (hasGSAP && typeof ScrollTrigger !== "undefined" && !reduceMotion) {
    gsap.from(".universe .section-heading", {
        opacity: 0,
        y: 42,
        duration: 1,
        scrollTrigger: { trigger: ".universe", start: "top 72%", once: true }
    });

    const solarTimeline = gsap.timeline({
        scrollTrigger: { trigger: ".solar-system", start: "top 76%", once: true }
    });

    solarTimeline
        .from(".sun", { scale: 0, opacity: 0, duration: 1.35, ease: "power3.out" })
        .from(".orbit", { opacity: 0, duration: 1.35, stagger: .08, ease: "power2.out" }, "-=.9")
        .from(".planet", { scale: 0, opacity: 0, duration: .58, stagger: .08, ease: "back.out(1.8)" }, "-=.72")
        .from(".system-console", { x: 34, opacity: 0, duration: .8 }, "-=.35");

    const constellationTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".constellation-stage",
            start: "top 68%",
            once: true,
            onEnter: () => {
                if (missionStarted && soundEnabled) {
                    uiAudio.volume = .07;
                    safePlay(uiAudio, true);
                }
            }
        }
    });

    constellationTimeline
        .to(".scan-line", { opacity: 1, duration: .2 })
        .to(".scan-line", { top: "105%", duration: 1.8, ease: "none" })
        .to(".scan-line", { opacity: 0, duration: .2 })
        .fromTo(".constellation-orbit path", { opacity: 0 }, { opacity: .65, duration: 1.1 }, "-=1.45")
        .to(".constellation-stars circle", { opacity: 1, duration: .38, stagger: .1, ease: "power2.out" }, "-=1.25")
        .to(".constellation-lines line", { strokeDashoffset: 0, duration: 1.55, stagger: .09, ease: "power1.inOut" }, "-=.95")
        .to(".constellation-result", { opacity: 1, y: 0, duration: .8, ease: "power2.out" }, "-=.4");

    gsap.from(".log-card", {
        opacity: 0,
        y: 46,
        duration: .9,
        stagger: .18,
        scrollTrigger: { trigger: ".logs-grid", start: "top 76%", once: true }
    });

    gsap.from(".golden-record", {
        opacity: 0,
        scale: .72,
        rotate: -28,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".record-layout", start: "top 74%", once: true }
    });

    gsap.from(".record-console", {
        opacity: 0,
        x: 42,
        duration: .9,
        scrollTrigger: { trigger: ".record-layout", start: "top 74%", once: true }
    });

    gsap.from(".final-terminal", {
        opacity: 0,
        y: 42,
        scale: .98,
        duration: 1.1,
        scrollTrigger: { trigger: ".final-section", start: "top 68%", once: true }
    });
}

/* Fallback if GSAP is unavailable or reduced motion is requested. */
if (!hasGSAP || reduceMotion) {
    document.querySelectorAll(".constellation-lines line").forEach(line => { line.style.strokeDashoffset = "0"; });
    document.querySelectorAll(".constellation-stars circle").forEach(star => { star.style.opacity = "1"; });
    document.querySelectorAll(".constellation-orbit path").forEach(path => { path.style.opacity = ".65"; });
    const result = document.querySelector(".constellation-result");
    result.style.opacity = "1";
    result.style.transform = "none";
}

/* =========================
   TELEMETRY
========================= */

const velocityValue = document.getElementById("velocityValue");
const altitudeValue = document.getElementById("altitudeValue");
const distanceValue = document.getElementById("distanceValue");
let telemetryTicking = false;

function updateTelemetry() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, window.scrollY / maxScroll);

    const velocity = Math.round(7412 + progress * 23988);
    const altitude = (180 + progress * 482).toFixed(1);
    const distance = (progress * 4.27).toFixed(2);

    velocityValue.textContent = `${String(velocity).padStart(5, "0")} KM/H`;
    altitudeValue.textContent = `${String(altitude).padStart(5, "0")} KM`;
    distanceValue.textContent = `${distance} AU`;
    telemetryTicking = false;
}

window.addEventListener("scroll", () => {
    if (!telemetryTicking) {
        requestAnimationFrame(updateTelemetry);
        telemetryTicking = true;
    }
}, { passive: true });
updateTelemetry();

/* =========================
   GOLDEN RECORD — LOCAL ORIGINAL AUDIO
========================= */

const recordButton = document.getElementById("recordButton");
const recordStatus = document.getElementById("recordStatus");
const audioBars = document.getElementById("audioBars");

function stopGoldenSignal(completed = false) {
    recordAudio.pause();
    if (!completed) recordAudio.currentTime = 0;
    recordButton.classList.remove("playing");
    audioBars.classList.remove("active");
    recordStatus.textContent = completed ? "SEÑAL RECIBIDA · AU-1308" : "SEÑAL EN ESPERA";
    recordPlaying = false;

    if (missionStarted) fadeAudio(ambientAudio, .11, .8);
}

async function toggleGoldenSignal() {
    playUiSound();

    if (recordPlaying) {
        stopGoldenSignal(false);
        return;
    }

    if (!soundEnabled) {
        recordStatus.textContent = "ACTIVA EL SONIDO PARA TRANSMITIR";
        return;
    }

    recordPlaying = true;
    recordAudio.currentTime = 0;
    recordButton.classList.add("playing");
    audioBars.classList.add("active");
    recordStatus.textContent = "TRANSMITIENDO / TRANSMITTING...";
    fadeAudio(ambientAudio, .025, .45);
    await safePlay(recordAudio);
}

recordButton.addEventListener("click", toggleGoldenSignal);
recordAudio.addEventListener("ended", () => stopGoldenSignal(true));

/* =========================
   RESTART
========================= */

document.getElementById("restartBtn").addEventListener("click", () => {
    playUiSound();
    stopGoldenSignal(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});
