# Anna's Universe V3

Experiencia espacial interactiva hecha con HTML, CSS y JavaScript puro y preparada para GitHub Pages.

## Novedades V3

- Interfaz parcialmente bilingüe (español + inglés técnico).
- Los 8 planetas del Sistema Solar son interactivos:
  Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.
- Cada planeta abre una ficha con datos y un mensaje distinto.
- Nueva constelación ficticia **A-1308 «Anna»**:
  - No corresponde a ninguna constelación astronómica real.
  - Tiene forma de “A” por Anna y Aeroespacial.
  - Sus estrellas tienen nombres temáticos y tooltip al pasar el cursor.
- Sonido integrado con archivos locales:
  - `launch-sequence.wav`
  - `deep-space-ambience.wav`
  - `signal-for-anna.wav`
  - `ui-confirm.wav`
- Control global de sonido.
- Golden Record usa ahora un audio real incluido en el proyecto.
- Mantiene GSAP + ScrollTrigger por CDN para las animaciones.
- Sigue funcionando como sitio estático, sin Node, npm, React ni backend.

## GitHub Pages

Sube **el contenido de esta carpeta** a la raíz del repositorio:

```text
index.html
style.css
script.js
assets/
```

Después activa GitHub Pages en la configuración del repositorio.

## Audio

Todos los WAV incluidos fueron sintetizados específicamente para este proyecto; no son canciones comerciales ni requieren licencias externas.

Los navegadores bloquean el autoplay antes de una interacción del usuario. Por eso el ambiente comienza después de pulsar **EXPLORAR EL UNIVERSO**.

## Personalización rápida

- Textos generales: `index.html`
- Mensajes y datos de los planetas: objeto `planetInfo` en `script.js`
- Colores/órbitas/planetas: `style.css`
- Audios: `assets/audio/`

Si después quieres usar una canción propia, reemplaza `assets/audio/signal-for-anna.wav` por un archivo tuyo y conserva el mismo nombre, o cambia la ruta del elemento `recordAudio` en `index.html`.
