/* ==========================================================================
   Lebams · comportamiento de la interfaz
   - Sin dependencias, compatible con CSP estricta (sin código inline)
   - Mejora progresiva: el sitio sigue siendo utilizable sin JavaScript
   ========================================================================== */
(() => {
	'use strict';

	const $  = (sel, ctx = document) => ctx.querySelector(sel);
	const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

	const WHATSAPP_NUMBER = '584147180941';
	const MOBILE_BREAKPOINT = 1000;

	/* -- Año dinámico en el pie de página -------------------------------- */
	$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

	/* -- Cabecera (sombra) y botones flotantes al hacer scroll ------------ */
	const header = $('#header');
	const floating = $('#floatingBtn');
	let ticking = false;

	const onScroll = () => {
		const y = window.scrollY;
		header?.classList.toggle('is-scrolled', y > 20);
		floating?.classList.toggle('is-visible', y > 500);
		ticking = false;
	};
	window.addEventListener('scroll', () => {
		if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
	}, { passive: true });
	onScroll();

	/* -- Menú móvil -------------------------------------------------------- */
	const toggle = $('.nav-toggle');
	const panel = $('#primary-nav');

	const setMenu = (open) => {
		if (!toggle || !panel) return;
		toggle.setAttribute('aria-expanded', String(open));
		toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
		panel.classList.toggle('is-open', open);
		document.body.classList.toggle('menu-open', open);
	};

	if (toggle && panel) {
		toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
		panel.addEventListener('click', (e) => {
			if (e.target.closest('a, button')) setMenu(false);
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
				setMenu(false);
				toggle.focus();
			}
		});
		window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`).addEventListener('change', (e) => {
			if (e.matches) setMenu(false);
		});
	}

	/* -- Enlace activo según la sección visible (scroll-spy) --------------- */
	const navLinks = $$('.navbar-link[href^="#"]');
	if (navLinks.length && 'IntersectionObserver' in window) {
		const map = new Map();
		navLinks.forEach((a) => {
			const target = $(a.getAttribute('href'));
			if (target) map.set(target, a);
		});
		const spy = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				navLinks.forEach((a) => a.removeAttribute('aria-current'));
				map.get(entry.target)?.setAttribute('aria-current', 'true');
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		map.forEach((_, section) => spy.observe(section));
	}

	/* -- Animaciones de aparición al hacer scroll -------------------------- */
	// Las clases .reveal solo se añaden a lo que está fuera de pantalla y la
	// hoja de estilos las muestra de inmediato si el usuario prefiere menos
	// movimiento, así que no hace falta condicionar aquí.
	if ('IntersectionObserver' in window) {
		const targets = $$('.about-card, .process__step, .faq__item, .section-lead, .subtitle, .contact-cta__actions');
		const io = new IntersectionObserver((entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					obs.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

		targets.forEach((el, i) => {
			// Los elementos que ya están en pantalla no se ocultan (evita parpadeos)
			if (el.getBoundingClientRect().top < window.innerHeight) return;
			el.classList.add('reveal');
			el.style.setProperty('--delay', `${(i % 3) * 55}ms`);
			io.observe(el);
		});
	}

	/* -- Tarjetas de servicios: giro al tocar en pantallas táctiles --------- */
	const touchOnly = window.matchMedia('(hover: none)');
	$$('.card').forEach((card) => {
		card.addEventListener('click', (e) => {
			if (!touchOnly.matches || e.target.closest('a')) return;
			const willFlip = !card.classList.contains('is-flipped');
			$$('.card.is-flipped').forEach((c) => c.classList.remove('is-flipped'));
			card.classList.toggle('is-flipped', willFlip);
		});
	});

	/* -- Enlaces de WhatsApp con mensaje prellenado ------------------------- */
	$$('a[data-wa]').forEach((a) => {
		const msg = `🧵 Buen día 🪡 Señora Mabel 👋🏻 Necesito ${a.dataset.wa}, ¿cuál es su disponibilidad para realizar el ajuste? ${a.dataset.waEmoji || ''}`.trim();
		a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
	});

	/* -- Utilidades de formularios ---------------------------------------------- */
	function setStatus(el, text, state = 'info') {
		if (!el) return;
		el.textContent = text;
		if (text) el.dataset.state = state; else delete el.dataset.state;
	}

	/* -- Formulario de contacto (envío AJAX con respaldo sin JS) ---------------- */
	const contactForm = $('#contact-form');
	if (contactForm) {
		const status = $('.form-status', contactForm);
		const submitBtn = $('button[type="submit"]', contactForm);

		contactForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!contactForm.checkValidity()) {
				contactForm.reportValidity();
				setStatus(status, 'Revisa los campos marcados.', 'error');
				return;
			}

			const data = new FormData(contactForm);
			// Campo trampa: si un bot lo rellena, simulamos éxito sin enviar nada
			if (data.get('_honey')) {
				contactForm.reset();
				setStatus(status, '¡Mensaje enviado!', 'success');
				return;
			}

			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 15000);
			submitBtn.setAttribute('aria-busy', 'true');
			setStatus(status, 'Enviando…', 'info');

			try {
				const res = await fetch(contactForm.dataset.ajaxEndpoint, {
					method: 'POST',
					headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
					body: JSON.stringify(Object.fromEntries(data)),
					signal: controller.signal,
					credentials: 'omit',
					referrerPolicy: 'strict-origin-when-cross-origin'
				});
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				contactForm.reset();
				setStatus(status, '¡Gracias! Hemos recibido tu mensaje y te responderemos pronto.', 'success');
			} catch (err) {
				setStatus(status, 'No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.', 'error');
			} finally {
				clearTimeout(timer);
				submitBtn.removeAttribute('aria-busy');
			}
		});
	}
})();
