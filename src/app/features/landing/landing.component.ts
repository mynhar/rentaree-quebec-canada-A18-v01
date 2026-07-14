import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from '../../core/i18n/language-switcher.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, TranslocoDirective, LanguageSwitcherComponent],
  template: `
    <div class="lp" *transloco="let t">
      <!-- Barra superior -->
      <header class="topbar">
        <div class="topbar__inner">
          <a routerLink="/" class="mark">
            Rentaree<span class="mark__tick" aria-hidden="true"></span>
          </a>
          <span class="chip">{{ t('landing.badge') }}</span>
          <nav class="topbar__nav">
            <app-language-switcher />
            <a routerLink="/auth" class="btn btn--primary">{{ t('landing.signIn') }}</a>
          </nav>
        </div>
      </header>

      <main>
        <!-- Hero -->
        <section class="hero">
          <div class="hero__text">
            <p class="eyebrow">{{ t('landing.hero.eyebrow') }}</p>
            <h1>{{ t('landing.hero.title1') }}<br />{{ t('landing.hero.title2') }}</h1>
            <p class="lead">{{ t('landing.hero.lead') }}</p>
            <div class="hero__cta">
              <a routerLink="/auth" class="btn btn--primary">{{ t('landing.hero.ctaExplore') }}</a>
              <a href="#escaneo" class="btn btn--ghost">{{ t('landing.hero.ctaScan') }}</a>
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
              <text x="96" y="92" class="rlbl">{{ t('landing.plan.salon') }}</text>
              <text x="250" y="92" class="rlbl">{{ t('landing.plan.cuisine') }}</text>
              <text x="66" y="200" class="rlbl">{{ t('landing.plan.chambre') }}</text>
              <text x="256" y="200" class="rlbl">{{ t('landing.plan.bureau') }}</text>
              <line x1="24" y1="256" x2="324" y2="256" stroke="#9AA09A" stroke-width="1"/>
              <line x1="24" y1="251" x2="24" y2="261" stroke="#9AA09A" stroke-width="1"/>
              <line x1="324" y1="251" x2="324" y2="261" stroke="#9AA09A" stroke-width="1"/>
              <text x="174" y="274" class="dlbl">{{ t('landing.plan.width') }}</text>
            </svg>
          </div>
        </section>

        <!-- Ejemplos de mercado (precios en CAD) -->
        <section class="listings">
          <div class="listing">
            <span class="listing__type">{{ t('property.types.apartamento') }}</span>
            <span class="listing__loc">{{ t('landing.listings.one.loc') }}</span>
            <span class="listing__price">{{ t('landing.listings.one.price') }}<span>{{ t('landing.listings.perMonth') }}</span></span>
          </div>
          <div class="listing">
            <span class="listing__type">{{ t('property.types.condominio') }}</span>
            <span class="listing__loc">{{ t('landing.listings.two.loc') }}</span>
            <span class="listing__price">{{ t('landing.listings.two.price') }}<span>{{ t('landing.listings.perMonth') }}</span></span>
          </div>
          <div class="listing">
            <span class="listing__type">{{ t('property.types.cuarto') }}</span>
            <span class="listing__loc">{{ t('landing.listings.three.loc') }}</span>
            <span class="listing__price">{{ t('landing.listings.three.price') }}<span>{{ t('landing.listings.perMonth') }}</span></span>
          </div>
        </section>

        <hr class="rule" />

        <!-- Cómo funciona -->
        <section class="steps">
          <h2>{{ t('landing.steps.title') }}</h2>
          <div class="steps__grid">
            <div class="step">
              <span class="step__n">01</span>
              <h3>{{ t('landing.steps.one.title') }}</h3>
              <p>{{ t('landing.steps.one.text') }}</p>
            </div>
            <div class="step">
              <span class="step__n">02</span>
              <h3>{{ t('landing.steps.two.title') }}</h3>
              <p>{{ t('landing.steps.two.text') }}</p>
            </div>
            <div class="step">
              <span class="step__n">03</span>
              <h3>{{ t('landing.steps.three.title') }}</h3>
              <p>{{ t('landing.steps.three.text') }}</p>
            </div>
          </div>
          <div class="types">
            @for (type of types; track type) {
              <span>{{ t('property.types.' + type) }}</span>
            }
          </div>
        </section>

        <!-- Servicio de escaneo 3D (propietarios) -->
        <section id="escaneo" class="scan">
          <div class="scan__text">
            <p class="eyebrow">{{ t('landing.scan.eyebrow') }}</p>
            <h2>{{ t('landing.scan.title1') }}<br />{{ t('landing.scan.title2') }}</h2>
            <p class="lead">{{ t('landing.scan.lead') }}</p>
            <a routerLink="/auth" class="btn btn--primary">{{ t('landing.scan.cta') }}</a>
          </div>
          <ul class="scan__list">
            <li><span class="scan__k">{{ t('landing.scan.tour.k') }}</span><span class="scan__v">{{ t('landing.scan.tour.v') }}</span></li>
            <li><span class="scan__k">{{ t('landing.scan.plan.k') }}</span><span class="scan__v">{{ t('landing.scan.plan.v') }}</span></li>
            <li><span class="scan__k">{{ t('landing.scan.dims.k') }}</span><span class="scan__v">{{ t('landing.scan.dims.v') }}</span></li>
          </ul>
        </section>

        <hr class="rule" />

        <!-- Testimonios -->
        <section class="quotes">
          <h2>{{ t('landing.quotes.title') }}</h2>
          <div class="quotes__grid">
            @for (q of quotes; track q) {
              <figure class="quote">
                <blockquote>{{ t('landing.quotes.' + q + '.text') }}</blockquote>
                <figcaption>
                  {{ t('landing.quotes.' + q + '.name') }}
                  <span>{{ t('landing.quotes.' + q + '.place') }}</span>
                </figcaption>
              </figure>
            }
          </div>
        </section>

        <!-- Cierre -->
        <section class="cta">
          <h2>{{ t('landing.cta.title') }}</h2>
          <a routerLink="/auth" class="btn btn--primary">{{ t('landing.cta.button') }}</a>
        </section>
      </main>

      <footer class="foot">
        <span class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></span>
        <span class="foot__note">{{ t('landing.footer.note') }}</span>
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
export class LandingComponent {
  /** Tipos que se muestran como chips (comparten claves con property.types). */
  readonly types = ['cuarto', 'casa', 'apartamento', 'edificio', 'comercial', 'condominio'];
  readonly quotes = ['one', 'two', 'three'];
}