# Lebams · sitio web

Sitio de una página (con formulario de contacto aparte) para el servicio de costura y arreglos **Lebams**.
Reescrito conservando la identidad original: paleta azul tinta / beige / dorado, tipografías Fraunces + Montserrat,
tarjetas de servicio con giro 3D y el lema *“Diseño que cose emociones”*.

---

## Estructura de carpetas

```
Proyecto/
├─ index.html            Página principal (hero, sobre nosotros, servicios, proceso, FAQ, contacto)
├─ form-contact.html     Formulario de contacto (envío a FormSubmit por AJAX con respaldo sin JS)
├─ 404.html              Página de error
├─ favicon.svg           Icono vectorial
├─ site.webmanifest      Metadatos PWA
├─ robots.txt            Indexación + referencia al sitemap
├─ sitemap.xml           Mapa del sitio
├─ _headers              Cabeceras de seguridad para Netlify / Cloudflare Pages
├─ .htaccess             Cabeceras, HTTPS, compresión y caché para Apache
├─ .well-known/
│  └─ security.txt       Contacto para reportar vulnerabilidades
├─ assets/
│  ├─ css/               core.css (tipografía + base + layout) · home.css · contact.css
│  ├─ js/main.js         Toda la interactividad (sin dependencias)
│  ├─ fonts/             Montserrat variable + 2 Fraunces + licencias OFL (814 KB)
│  └─ img/               WebP optimizadas (5–82 KB), iconos y og-image
├─ _archivo/original/    Respaldo de los archivos y assets originales (excluido de indexación)
└─ README.md
```

### Qué cambió respecto al proyecto original

| Antes | Ahora | Motivo |
|---|---|---|
| `style.css`, `styles-form.css`, `form-styles.css`, `modal-dialog.css`, `fonts.css` en la raíz | **2 hojas por página**: `core.css` (tipografía, base y layout compartido) + la de su página | Orden, mantenibilidad y menos peticiones; sin `@import` en cascada |
| 5 archivos CSS con reglas duplicadas | Tokens de duración (`--dur-fast/mid/slow`) y una sola definición de cada componente | Código más corto y coherente |
| `@import` de Google Fonts | Fuentes autoalojadas: Montserrat en **un solo archivo variable** (100–900) + Fraunces, con `font-display: swap` y `preload` | Privacidad, rendimiento (−628 KB) y CSP estricta sin `fonts.googleapis.com` |
| Font Awesome por CDN (6 iconos usados) | SVG en línea reutilizables (`<symbol>` + `<use>`) | −100 KB de CSS/JS de terceros y sin dependencia externa |
| Imágenes JPG/PNG de hasta 9,5 MB | WebP redimensionado (500×600 tarjetas, 1920×1095 hero) | Carga mucho más rápida |
| Hero con imagen remota | `assets/img/hero(.webp|-mobile.webp)` local y responsive | Sin dependencia de terceros, `picture` con `srcset` |
| CSS anidado (nesting) sin respaldo | CSS plano compatible con más navegadores | Compatibilidad |
| `onclick` en el HTML | `data-*` + delegación en `main.js` | Necesario para una CSP sin `unsafe-inline` |
| `<button>` dentro de `<a>` | Un único elemento interactivo | HTML válido y accesible (un control, un foco) |
| Inputs del formulario sin `name` | `name`, `autocomplete`, `inputmode`, `pattern`, `required` | Los datos llegan completos y se validan |
| Ruta `/imagenes/...` (rompía en local y en subcarpetas) | Rutas relativas `assets/img/...` | Funciona en cualquier despliegue |
| `lang="en"` con contenido en español | `lang="es"` | SEO + lectores de pantalla |
| Sin meta description, canonical, OG ni datos estructurados | Metadatos completos + JSON-LD `LocalBusiness` y `ContactPage` | Posicionamiento y compartición |
| Textos duplicados en “Sobre nosotros” | Tres bloques con contenido propio (experiencia, a medida, acabado) | Calidad de contenido (evita contenido duplicado) |
| Sin adaptación a móvil en menú/tarjetas/footer | Menú hamburguesa, grid fluido, tarjetas 2 columnas en móvil | Responsive real desde 320 px |

---

## Seguridad implementada

- **CSP estricta** (`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`)
  declarada en `<meta>` y en `_headers` / `.htaccess`. Todo el JS y CSS son archivos externos: no hay
  `unsafe-inline`.
- **Strict-Transport-Security**, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` y `Cross-Origin-Opener-Policy`.
- Redirección forzada a **HTTPS** y `upgrade-insecure-requests` en el servidor.
- Todos los enlaces externos con `rel="noopener noreferrer"`.
- Validación nativa del formulario de contacto (email, teléfono con patrón, longitudes).
- **Campo trampa (`_honey`)** anti-spam + `_captcha=false` de FormSubmit para evitar fricción al usuario.
- `iframe` del mapa con `sandbox`, `referrerpolicy` y `loading="lazy"`.
- `security.txt`, `.htaccess` bloqueando `/_archivo`, `Options -Indexes` y `robots.txt` con `Disallow`.

> Se eliminaron los botones y modales de **Iniciar sesión / Registrarse**: eran maquetas sin back-end y no
> aportaban al sitio. Si algún día se añade autenticación real, debe ir por POST/HTTPS con validación en
> servidor, límite de intentos, hash bcrypt/argon2 y cookies `HttpOnly; Secure; SameSite=Lax`.

---

## Accesibilidad y UX

- Enlace «Saltar al contenido», `aria-current` en la navegación y scroll-spy.
- Foco visible con `:focus-visible`, estados `:user-invalid`, mensajes `role="status"` con `aria-live`.
- Contraste corregido: rojo y dorado tienen variantes oscuras para texto pequeño (`--danger-dark`, `--accent-dark`).
- `prefers-reduced-motion`: se desactivan animaciones, zoom del hero y giros.
- Tarjetas usables con teclado (`:focus-within`) y con toque (se voltean al pulsar) además del hover.
- Imágenes con `alt` descriptivo (y `alt=""` en las decorativas), `width`/`height` para evitar saltos de maquetación.

## Movimiento y animaciones

| Elemento | Comportamiento |
|---|---|
| Menú | El enlace se atenúa al 30 % y al pasar el cursor se enciende y sube 3 px (0,4 s). La barra dorada inferior marca **la sección visible** (scroll-spy) y no se mueve con el hover. |
| Hero | Cascada suave: desenfoque que se disuelve + 12 px de recorrido, 0,8–0,95 s con retardos de 100 ms, y zoom lentísimo de la foto (22 s). |
| Secciones | Aparición con `blur` + 22 px en 0,65–0,72 s, escalonado de 90 ms; los bloques ya visibles no se animan. |
| Tarjetas de servicios | **Sin animación de entrada** y **giro 3D idéntico al del video**: 0,5 s, `perspective(600px)` por cara y el reverso de 180° a 360°. |
| Hovers en general | Botones y tarjetas a **0,45 s**; botones flotantes a 0,45–0,55 s. Ningún elemento cambia de tamaño: solo color, contorno, halo y elevación corta. |
| Botones flotantes | Se elevan 4 px, pasan a dorado y reciben un halo; el pulso del halo dura 3,6 s y se detiene al pasar el cursor. |

Todo respeta `prefers-reduced-motion`.

## Rendimiento

- Sin librerías: 0 dependencias externas en CSS/JS; iconos SVG en línea.
- WebP + `loading="lazy"` (el hero con `fetchpriority="high"`), `preload` de las dos fuentes principales y
  **`preload` de la imagen del hero** según el ancho de pantalla (mejora el LCP).
- CSS consolidado: 2 hojas por página en lugar de 5 (una petición menos en el camino crítico).
- Sin CSS/JS muerto: se auditó cada clase declarada contra el HTML y se eliminó lo que no se usa.
- `content-visibility` no aplicado adrede para no interferir con el scroll-spy; el JS se limita a
  `IntersectionObserver`, `requestAnimationFrame` y listeners `passive`.

---

## Cómo probarlo en local

```powershell
# desde la carpeta del proyecto
python -m http.server 8765
# abrir http://127.0.0.1:8765/
```

Ábrelo por HTTP y no con `file://`: así se aplican bien las rutas y las pruebas de formularios.

## Lista de verificación antes de publicar

1. Sustituir `https://lebams.com` por el dominio real en `index.html`, `form-contact.html`, `sitemap.xml`,
   `robots.txt`, `.well-known/security.txt` y la etiqueta `canonical`.
2. Activar el endpoint de **FormSubmit** enviando una vez el formulario (llega un correo de confirmación a
   `lebams@gmail.com`). También conviene usar el alias aleatorio de FormSubmit para no exponer el correo en el HTML.
3. Servir siempre por **HTTPS** (los archivos `_headers`/`.htaccess` ya lo fuerzan).
4. Revisar el contenido: los precios figuran en `COP` mientras la dirección está en Venezuela (`VES`);
   conviene unificarlo según el país de facturación.
5. Bajar el contraste del texto del hero si se cambia la imagen de fondo; la imagen actual está oscurecida con degradado.

## Capturas de verificación

En `_archivo/preview/`: `desktop.png` y `movil.png` (página completa), `hero-entrada.png` (mitad de la
animación de entrada), `hero.png`, `giro-3d.png` y `giro-completo.png` (giro de tarjeta a los 150 ms y
completo), `contacto.png`, `menu-movil.png`, `flotantes-reposo.png`, `hover-whatsapp.png` y `hover-flecha.png`.

## Créditos

- Tipografías: [Fraunces](https://fonts.google.com/specimen/Fraunces) y
  [Montserrat](https://fonts.google.com/specimen/Montserrat), licencia SIL Open Font License
  (copias en `assets/fonts/OFL-*.txt`).
- Icono de WhatsApp: [Simple Icons](https://simpleicons.org/) (CC0).
