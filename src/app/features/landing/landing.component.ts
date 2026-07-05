import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="lp">
      <!-- Barra superior -->
      <header class="topbar">
        <div class="topbar__inner">
          <a routerLink="/" class="mark">
            Rentaree<span class="mark__tick" aria-hidden="true"></span>
          </a>
          <span class="chip">Interiores en 3D</span>
          <nav class="topbar__nav">
            <a routerLink="/auth" class="btn btn--primary">Iniciar sesión</a>
          </nav>
        </div>
      </header>

      <main>
        <!-- Hero -->
        <section class="hero">
          <div class="hero__text">
            <p class="eyebrow">Tecnología 3D · Quebec</p>
            <h1>Alquila sabiendo<br />exactamente lo que rentas.</h1>
            <p class="lead">
              Cada propiedad incluye fotos, un recorrido 3D y las dimensiones reales
              de cada ambiente, extraídas del propio escaneo. Sin sorpresas al llegar.
            </p>
            <div class="hero__cta">
              <a routerLink="/auth" class="btn btn--primary">Explorar propiedades</a>
              <a href="#escaneo" class="btn btn--ghost">Escanear mi propiedad</a>
            </div>
          </div>

          <div class="hero__plan" aria-hidden="true">
            <svg viewBox="0 0 360 280" fill="none">
              <rect x="24" y="30" width="300" height="210" stroke="#2A2E2A" stroke-width="2"/>
              <line x1="188" y1="30" x2="188" y2="150" stroke="#2A2E2A" stroke-width="2"/>
              <line x1="188" y1="150" x2="324" y2="150" stroke="#2A2E2A" stroke-width="2"/>
              <line x1="24" y1="150" x2="120" y2="150" stroke="#2A2E2A" stroke-width="2"/>
              <line x1="120" y1="150" x2="120" y2="240" stroke="#2A2E2A" stroke-width="2"/>
              <line x1="188" y1="200" x2="188" y2="240" stroke="#2A2E2A" stroke-width="2"/>
              <path d="M188 200 A28 28 0 0 1 216 228" stroke="#1F4E6B" stroke-width="1.5"/>
              <text x="96" y="92" class="rlbl">Salon</text>
              <text x="250" y="92" class="rlbl">Cuisine</text>
              <text x="66" y="200" class="rlbl">Chambre</text>
              <text x="256" y="200" class="rlbl">Bureau</text>
              <line x1="24" y1="256" x2="324" y2="256" stroke="#9AA09A" stroke-width="1"/>
              <line x1="24" y1="251" x2="24" y2="261" stroke="#9AA09A" stroke-width="1"/>
              <line x1="324" y1="251" x2="324" y2="261" stroke="#9AA09A" stroke-width="1"/>
              <text x="174" y="274" class="dlbl">9,60 m</text>
            </svg>
          </div>
        </section>

        <!-- Ejemplos de mercado (precios en CAD) -->
        <section class="listings">
          <div class="listing">
            <span class="listing__type">Apartamento</span>
            <span class="listing__loc">Le Plateau-Mont-Royal, Montréal</span>
            <span class="listing__price">1 650 $ CA<span>/mois</span></span>
          </div>
          <div class="listing">
            <span class="listing__type">Condominio</span>
            <span class="listing__loc">Chomedey, Laval</span>
            <span class="listing__price">1 950 $ CA<span>/mois</span></span>
          </div>
          <div class="listing">
            <span class="listing__type">Cuarto</span>
            <span class="listing__loc">Villeray, Montréal</span>
            <span class="listing__price">780 $ CA<span>/mois</span></span>
          </div>
        </section>

        <hr class="rule" />

        <!-- Cómo funciona -->
        <section class="steps">
          <h2>Cómo funciona</h2>
          <div class="steps__grid">
            <div class="step">
              <span class="step__n">01</span>
              <h3>Busca</h3>
              <p>Filtra por ciudad, barrio, tipo y precio en todo Quebec.</p>
            </div>
            <div class="step">
              <span class="step__n">02</span>
              <h3>Recórrela en 3D</h3>
              <p>Entra a cada ambiente con el recorrido virtual y consulta sus medidas exactas.</p>
            </div>
            <div class="step">
              <span class="step__n">03</span>
              <h3>Alquila</h3>
              <p>Contacta al propietario y cierra el alquiler con confianza.</p>
            </div>
          </div>
          <div class="types">
            <span>Cuartos</span><span>Casa</span><span>Apartamento</span>
            <span>Edificio</span><span>Comercial</span><span>Condominio</span>
          </div>
        </section>

        <!-- Servicio de escaneo 3D (propietarios) -->
        <section id="escaneo" class="scan">
          <div class="scan__text">
            <p class="eyebrow">Para propietarios</p>
            <h2>¿Pones una propiedad en alquiler?<br />La escaneamos en 3D.</h2>
            <p class="lead">
              Un técnico visita tu propiedad y captura un recorrido con Matterport.
              Nosotros generamos el recorrido virtual, un plano rápido y las dimensiones
              de cada ambiente. Tu anuncio se alquila antes.
            </p>
            <a routerLink="/auth" class="btn btn--primary">Solicitar escaneo</a>
          </div>
          <ul class="scan__list">
            <li><span class="scan__k">Recorrido virtual</span><span class="scan__v">navegable, ambiente por ambiente</span></li>
            <li><span class="scan__k">Plano rápido</span><span class="scan__v">distribución a escala</span></li>
            <li><span class="scan__k">Dimensiones</span><span class="scan__v">medidas reales por ambiente</span></li>
          </ul>
        </section>

        <hr class="rule" />

        <!-- Testimonios -->
        <section class="quotes">
          <h2>Lo que dicen en Quebec</h2>
          <div class="quotes__grid">
            <figure class="quote">
              <blockquote>Alquilé sin visitar cinco veces. El recorrido 3D me mostró cada rincón antes de decidir.</blockquote>
              <figcaption>Marie-Ève T.<span>Le Plateau-Mont-Royal, Montréal</span></figcaption>
            </figure>
            <figure class="quote">
              <blockquote>Publiqué mi condo en Laval y el escaneo se hizo en una mañana. Se alquiló en dos semanas.</blockquote>
              <figcaption>David R.<span>Chomedey, Laval</span></figcaption>
            </figure>
            <figure class="quote">
              <blockquote>Las dimensiones exactas me ahorraron mudar muebles que no cabían. Simple y honesto.</blockquote>
              <figcaption>Sophie L.<span>Villeray, Montréal</span></figcaption>
            </figure>
          </div>
        </section>

        <!-- Cierre -->
        <section class="cta">
          <h2>Encuentra tu próximo hogar en Quebec.</h2>
          <a routerLink="/auth" class="btn btn--primary">Explorar propiedades</a>
        </section>
      </main>

      <footer class="foot">
        <span class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></span>
        <span class="foot__note">Recorridos 3D para alquilar en Quebec · © 2026</span>
      </footer>
    </div>
  `,
  styles: [`
    .lp { --edge: clamp(20px, 5vw, 72px); color: var(--ink); }

    .topbar { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--paper) 88%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
    .topbar__inner { display: flex; align-items: center; gap: 14px; padding: 14px var(--edge); }
    .topbar__nav { margin-left: auto; }

    .mark { font-family: var(--font-display); font-weight: 600; font-size: 20px; color: var(--ink); display: inline-flex; align-items: center; gap: 5px; }
    .mark__tick { width: 16px; height: 9px; border-left: 1px solid var(--ink-3); border-right: 1px solid var(--ink-3); border-bottom: 1px solid var(--ink-3); }

    .chip { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: .03em; color: var(--ink-2); background: var(--surface-2); border: 1px solid var(--line); padding: 4px 9px; border-radius: 100px; }

    .hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; padding: clamp(48px, 8vw, 96px) var(--edge) 40px; }
    .eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); margin: 0 0 16px; }
    .hero h1 { font-size: clamp(34px, 5vw, 56px); line-height: 1.04; letter-spacing: -0.02em; }
    .lead { color: var(--ink-2); font-size: clamp(15px, 1.4vw, 17px); line-height: 1.6; max-width: 46ch; margin: 20px 0 28px; }
    .hero__cta { display: flex; gap: 12px; flex-wrap: wrap; }
    .hero__plan svg { width: 100%; height: auto; }
    .rlbl { font-family: var(--font-mono); font-size: 11px; fill: var(--ink-3); text-anchor: middle; }
    .dlbl { font-family: var(--font-mono); font-size: 11px; fill: var(--ink-2); text-anchor: middle; }

    .listings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border-block: 1px solid var(--line); margin: 0 var(--edge); }
    .listing { background: var(--paper); padding: 18px 20px; display: flex; flex-direction: column; gap: 4px; }
    .listing__type { font-weight: 500; font-size: 14px; }
    .listing__loc { color: var(--ink-3); font-size: 13px; }
    .listing__price { font-family: var(--font-mono); font-size: 15px; color: var(--ink); margin-top: 6px; }
    .listing__price span { color: var(--ink-3); font-size: 12px; }

    .rule { border: 0; border-top: 1px solid var(--line); margin: clamp(48px, 8vw, 88px) var(--edge); position: relative; }
    .rule::after { content: ""; position: absolute; left: 50%; top: -4px; width: 1px; height: 9px; background: var(--ink-3); }

    section h2 { font-size: clamp(24px, 3vw, 34px); line-height: 1.1; letter-spacing: -0.015em; }

    .steps { padding: 0 var(--edge); }
    .steps__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin: 32px 0; }
    .step__n { font-family: var(--font-mono); font-size: 13px; color: var(--accent); }
    .step h3 { font-size: 19px; margin: 10px 0 6px; }
    .step p { color: var(--ink-2); font-size: 15px; line-height: 1.55; margin: 0; }
    .types { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .types span { font-size: 13px; color: var(--ink-2); border: 1px solid var(--line-2); border-radius: 100px; padding: 6px 14px; }

    .scan { display: grid; grid-template-columns: 1.05fr .95fr; gap: 40px; align-items: center; padding: 0 var(--edge); }
    .scan__list { list-style: none; margin: 0; padding: 24px; background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-lg); }
    .scan__list li { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line); }
    .scan__list li:last-child { border-bottom: 0; }
    .scan__k { font-weight: 500; font-size: 15px; }
    .scan__v { color: var(--ink-3); font-size: 13px; text-align: right; }

    .quotes { padding: 0 var(--edge); }
    .quotes__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 28px; }
    .quote { margin: 0; padding: 24px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); }
    .quote blockquote { margin: 0 0 16px; font-size: 16px; line-height: 1.5; }
    .quote figcaption { font-size: 13px; font-weight: 500; color: var(--ink); display: flex; flex-direction: column; gap: 2px; }
    .quote figcaption span { font-weight: 400; color: var(--ink-3); font-family: var(--font-mono); font-size: 12px; }

    .cta { text-align: center; padding: clamp(56px, 9vw, 104px) var(--edge); }
    .cta h2 { max-width: 20ch; margin: 0 auto 24px; }

    .foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 28px var(--edge); border-top: 1px solid var(--line); }
    .foot__note { color: var(--ink-3); font-size: 13px; }

    @media (max-width: 820px) {
      .hero, .scan { grid-template-columns: 1fr; }
      .hero__plan { order: -1; max-width: 420px; }
      .steps__grid, .quotes__grid, .listings { grid-template-columns: 1fr; }
      .listings { gap: 1px; }
      .chip { display: none; }
    }
  `],
})
export class LandingComponent {}