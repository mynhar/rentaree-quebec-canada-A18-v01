import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from '../../core/i18n/language-switcher.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, TranslocoDirective, LanguageSwitcherComponent],
  template: `
    <div class="lp" *transloco="let t">
      <!-- Nav N1b: marca · enlaces centrales · idioma + CTA -->
      <header class="nav" [class.is-scrolled]="scrolled()">
        <div class="nav__inner">
          <a routerLink="/" class="mark">
            Rentaree<span class="mark__tick" aria-hidden="true"></span>
          </a>
          <nav class="nav__center">
            <a href="#steps" class="nav__link">{{ t('landing.steps.title') }}</a>
            <a href="#escaneo" class="nav__link">{{ t('landing.scan.eyebrow') }}</a>
          </nav>
          <div class="nav__right">
            <app-language-switcher />
            <a routerLink="/auth" class="btn btn--primary">{{ t('landing.signIn') }}</a>
          </div>
        </div>
      </header>

      <main>
        <!-- Hero — diptych asimétrico (texto izq. / tarjeta de plano der.) -->
        <section class="hero">
          <div class="hero__text">
            <p class="mono-label hero__eyebrow">{{ t('landing.hero.eyebrow') }}</p>
            <h1>{{ t('landing.hero.title1') }} {{ t('landing.hero.title2') }}</h1>
            <p class="lead">{{ t('landing.hero.lead') }}</p>
            <div class="hero__cta">
              <a routerLink="/auth" class="btn btn--primary">{{ t('landing.hero.ctaExplore') }}</a>
              <a href="#escaneo" class="btn btn--ghost">{{ t('landing.hero.ctaScan') }}</a>
            </div>
          </div>

          <!-- Tarjeta de escaneo: el sello de Rentaree, elevado -->
          <figure class="plan-card" aria-hidden="true">
            <figcaption class="plan-card__bar">
              <span class="mono-label plan-card__name">{{ t('landing.scan.plan.k') }}</span>
              <span class="plan-card__chip">{{ t('landing.badge') }}</span>
            </figcaption>
            <div class="plan-card__stage">
              <svg viewBox="0 0 360 264" fill="none" class="plan">
                <rect class="wall" x="20" y="24" width="320" height="196"/>
                <line class="wall" x1="196" y1="24" x2="196" y2="140"/>
                <line class="wall" x1="196" y1="140" x2="340" y2="140"/>
                <line class="wall" x1="20" y1="140" x2="120" y2="140"/>
                <line class="wall" x1="120" y1="140" x2="120" y2="220"/>
                <line class="wall" x1="196" y1="176" x2="196" y2="220"/>
                <path class="door" d="M196 176 A30 30 0 0 1 226 206"/>
                <text class="rlbl" x="100" y="88">{{ t('landing.plan.salon') }}</text>
                <text class="rlbl" x="264" y="88">{{ t('landing.plan.cuisine') }}</text>
                <text class="rlbl" x="66" y="188">{{ t('landing.plan.chambre') }}</text>
                <text class="rlbl" x="268" y="188">{{ t('landing.plan.bureau') }}</text>
                <line class="tick" x1="20" y1="240" x2="340" y2="240"/>
                <line class="tick" x1="20" y1="235" x2="20" y2="245"/>
                <line class="tick" x1="340" y1="235" x2="340" y2="245"/>
              </svg>
            </div>
            <div class="plan-card__read">
              <span class="mono-label">{{ t('landing.scan.dims.k') }}</span>
              <span class="plan-card__val">{{ t('landing.plan.width') }}</span>
            </div>
          </figure>
        </section>

        <!-- Demostración de escaneo 3D — el diferenciador del negocio -->
        <section class="showcase">
          <div class="showcase__head">
            <p class="mono-label showcase__eyebrow">{{ t('landing.video.eyebrow') }}</p>
            <h2>{{ t('landing.video.title') }}</h2>
            <p class="lead">{{ t('landing.video.lead') }}</p>
          </div>
          <figure class="showcase__frame">
            <video class="showcase__video" src="videos/short-intro-480p.mp4"
              autoplay muted loop playsinline controls preload="metadata"
              [attr.aria-label]="t('landing.video.title')"></video>
          </figure>
        </section>

        <!-- Ejemplos de mercado (precios en CAD) -->
        <section class="listings" aria-label="Exemples">
          <a routerLink="/auth" class="listing">
            <span class="listing__type">{{ t('property.types.apartamento') }}</span>
            <span class="listing__loc">{{ t('landing.listings.one.loc') }}</span>
            <span class="listing__price">{{ t('landing.listings.one.price') }}<span>{{ t('landing.listings.perMonth') }}</span></span>
          </a>
          <a routerLink="/auth" class="listing">
            <span class="listing__type">{{ t('property.types.condominio') }}</span>
            <span class="listing__loc">{{ t('landing.listings.two.loc') }}</span>
            <span class="listing__price">{{ t('landing.listings.two.price') }}<span>{{ t('landing.listings.perMonth') }}</span></span>
          </a>
          <a routerLink="/auth" class="listing">
            <span class="listing__type">{{ t('property.types.cuarto') }}</span>
            <span class="listing__loc">{{ t('landing.listings.three.loc') }}</span>
            <span class="listing__price">{{ t('landing.listings.three.price') }}<span>{{ t('landing.listings.perMonth') }}</span></span>
          </a>
        </section>

        <!-- Cómo funciona — secuencia numerada -->
        <section id="steps" class="steps">
          <div class="section-head">
            <span class="mono-label">01 — 03</span>
            <h2>{{ t('landing.steps.title') }}</h2>
          </div>
          <ol class="steps__grid">
            <li class="step">
              <span class="step__n">01</span>
              <h3>{{ t('landing.steps.one.title') }}</h3>
              <p>{{ t('landing.steps.one.text') }}</p>
            </li>
            <li class="step">
              <span class="step__n">02</span>
              <h3>{{ t('landing.steps.two.title') }}</h3>
              <p>{{ t('landing.steps.two.text') }}</p>
            </li>
            <li class="step">
              <span class="step__n">03</span>
              <h3>{{ t('landing.steps.three.title') }}</h3>
              <p>{{ t('landing.steps.three.text') }}</p>
            </li>
          </ol>
          <div class="types">
            @for (type of types; track type) {
              <span>{{ t('property.types.' + type) }}</span>
            }
          </div>
        </section>

        <!-- Banda oscura: servicio de escaneo 3D (propietarios) -->
        <section id="escaneo" class="scan">
          <div class="scan__inner">
            <div class="scan__text">
              <p class="mono-label scan__eyebrow">{{ t('landing.scan.eyebrow') }}</p>
              <h2>{{ t('landing.scan.title1') }} {{ t('landing.scan.title2') }}</h2>
              <p class="lead">{{ t('landing.scan.lead') }}</p>
              <a routerLink="/auth" class="btn btn--primary">{{ t('landing.scan.cta') }}</a>
            </div>
            <ul class="scan__list">
              <li>
                <span class="scan__k">{{ t('landing.scan.tour.k') }}</span>
                <span class="scan__v">{{ t('landing.scan.tour.v') }}</span>
              </li>
              <li>
                <span class="scan__k">{{ t('landing.scan.plan.k') }}</span>
                <span class="scan__v">{{ t('landing.scan.plan.v') }}</span>
              </li>
              <li>
                <span class="scan__k">{{ t('landing.scan.dims.k') }}</span>
                <span class="scan__v">{{ t('landing.scan.dims.v') }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Testimonios -->
        <section class="quotes">
          <div class="section-head">
            <span class="mono-label">Québec</span>
            <h2>{{ t('landing.quotes.title') }}</h2>
          </div>
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
      </main>

      <!-- Ft5 Statement: cierre + CTA -->
      <footer class="foot">
        <h2 class="foot__line">{{ t('landing.cta.title') }}</h2>
        <a routerLink="/auth" class="btn btn--primary">{{ t('landing.cta.button') }}</a>
        <div class="foot__meta">
          <span class="mark">Rentaree<span class="mark__tick" aria-hidden="true"></span></span>
          <span class="foot__note">{{ t('landing.footer.note') }}</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .lp { color: var(--ink); }
    section { scroll-margin-top: 80px; }
    .nav__inner, .hero, .steps, .scan__inner, .quotes, .foot {
      max-width: var(--page-max); margin-inline: auto; }
    .hero, .steps, .scan__inner, .quotes { padding: var(--space-4xl) var(--page-gutter); }
    .listings, .steps__grid, .quotes__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .plan-card__bar, .plan-card__read, .scan__list li, .foot__meta {
      display: flex; align-items: baseline; justify-content: space-between; }

    /* — Nav N1b — */
    .nav { position: sticky; top: 0; z-index: 20; background: transparent;
      border-bottom: 1px solid transparent;
      transition: background var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out); }
    .nav.is-scrolled { background: color-mix(in oklch, var(--paper) 78%, transparent);
      backdrop-filter: blur(14px) saturate(150%); border-bottom-color: var(--line); }
    .nav__inner { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
      gap: var(--space-md); height: 64px; padding-inline: var(--page-gutter); }
    .nav__center { justify-self: center; display: flex; gap: var(--space-lg); }
    .nav__link { color: var(--ink-2); font-size: var(--text-sm); font-weight: 500;
      padding-block: 4px; border-bottom: 1px solid transparent; transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
    .nav__link:hover { color: var(--ink); border-bottom-color: var(--accent); }
    .nav__right { justify-self: end; display: flex; align-items: center; gap: var(--space-md); }

    .mark { font-family: var(--font-display); font-weight: 600; font-size: 20px; color: var(--ink);
      display: inline-flex; align-items: center; gap: 5px; }
    .mark__tick { width: 16px; height: 9px; border: 1px solid var(--ink-3); border-top: 0; }

    /* — Hero — */
    .hero { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: var(--space-2xl); align-items: center; }
    .hero__eyebrow, .scan__eyebrow { color: var(--accent); margin: 0 0 var(--space-md); }
    .hero h1 { font-size: var(--text-display); max-width: 15ch; }
    .lead { color: var(--ink-2); font-size: var(--text-lg); line-height: 1.55; max-width: 48ch;
      margin: var(--space-lg) 0 var(--space-xl); }
    .hero__cta { display: flex; gap: var(--space-md); flex-wrap: wrap; }

    /* — Tarjeta de plano (grafito) — */
    .plan-card { margin: 0; background: var(--graphite); color: var(--on-graphite);
      border: 1px solid var(--graphite-2); border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-lift); }
    .plan-card__bar { align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--graphite-line); }
    .plan-card__name { color: var(--on-graphite-2); }
    .plan-card__chip { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .06em;
      text-transform: uppercase; color: var(--accent-ink);
      background: var(--accent); padding: 3px 9px; border-radius: var(--radius-pill); }
    .plan-card__stage { padding: var(--space-lg) var(--space-xl); color: var(--on-graphite-2); }
    .plan { width: 100%; height: auto; display: block; }
    .plan .wall { stroke: var(--on-graphite); stroke-width: 1.5; }
    .plan .door { stroke: var(--accent); stroke-width: 1.5; }
    .plan .tick { stroke: var(--graphite-line); stroke-width: 1; }
    .plan .rlbl { font-family: var(--font-mono); font-size: 11px; fill: var(--on-graphite-2); text-anchor: middle; }
    .plan-card__read { padding: 12px 16px; border-top: 1px solid var(--graphite-line); }
    .plan-card__val { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--on-graphite); }

    /* — Demostración de escaneo 3D (diferenciador clave) — */
    .showcase { max-width: var(--page-max); margin-inline: auto; padding: var(--space-2xl) var(--page-gutter) var(--space-4xl); }
    .showcase__head { max-width: 62ch; margin-bottom: var(--space-xl); }
    .showcase__eyebrow { color: var(--accent); margin: 0 0 var(--space-md); }
    .showcase__head h2 { font-size: var(--text-3xl); }
    .showcase__frame { margin: 0; border: 1px solid var(--line-2); border-radius: var(--radius-lg);
      overflow: hidden; background: var(--graphite); box-shadow: var(--shadow-lift); line-height: 0; }
    .showcase__video { width: 100%; height: auto; display: block; }

    /* — Listings strip — */
    .listings { width: min(var(--page-max), 100% - 2 * var(--page-gutter)); margin-inline: auto;
      border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden;
      background: var(--surface); }
    .listing { display: flex; flex-direction: column; gap: 4px; padding: var(--space-lg);
      border-right: 1px solid var(--line); transition: background var(--dur-fast) var(--ease-out); }
    .listing:last-child { border-right: 0; }
    .listing:hover { background: var(--surface-2); }
    .listing__type { font-weight: 600; font-size: var(--text-base); color: var(--ink); }
    .listing__loc { color: var(--ink-3); font-size: var(--text-sm); }
    .listing__price { font-family: var(--font-mono); font-size: var(--text-base); color: var(--ink); margin-top: 6px; }
    .listing__price span { color: var(--ink-3); font-size: var(--text-xs); }

    /* — Section head (tag apilado arriba, nunca a la izquierda) — */
    .section-head { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-xl); }
    .section-head h2, .scan h2 { font-size: var(--text-3xl); }

    .steps__grid { list-style: none; margin: 0 0 var(--space-xl); padding: 0; gap: var(--space-xl); }
    .step { border-top: 1px solid var(--line-2); padding-top: var(--space-md); }
    .step__n { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--accent); }
    .step h3 { font-size: var(--text-xl); margin: var(--space-md) 0 6px; }
    .step p { color: var(--ink-2); margin: 0; }
    .types { display: flex; flex-wrap: wrap; gap: var(--space-sm); }
    .types span { font-size: var(--text-sm); color: var(--ink-2);
      border: 1px solid var(--line-2); border-radius: var(--radius-pill); padding: 6px 14px; }

    /* — Banda oscura (escaneo) — */
    .scan { background: var(--graphite); color: var(--on-graphite); }
    .scan__inner { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: var(--space-2xl); align-items: center; }
    .scan h2 { color: var(--on-graphite); max-width: 16ch; }
    .scan .lead { color: var(--on-graphite-2); max-width: 44ch; }
    .scan__list { list-style: none; margin: 0; padding: 0;
      border: 1px solid var(--graphite-line); border-radius: var(--radius-lg); }
    .scan__list li { gap: var(--space-md);
      padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--graphite-line); }
    .scan__list li:last-child { border-bottom: 0; }
    .scan__k { font-weight: 500; color: var(--on-graphite); }
    .scan__v { color: var(--on-graphite-2); font-size: var(--text-sm); text-align: right; }

    /* — Testimonios — */
    .quotes__grid { gap: var(--space-lg); }
    .quote { margin: 0; padding: var(--space-lg); background: var(--surface);
      border: 1px solid var(--line); border-radius: var(--radius-lg);
      transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
    .quote:hover { border-color: var(--line-2); box-shadow: var(--shadow); }
    .quote blockquote { margin: 0 0 var(--space-md); font-size: var(--text-lg); line-height: 1.5; color: var(--ink); }
    .quote figcaption { font-size: var(--text-sm); font-weight: 500; color: var(--ink);
      display: flex; flex-direction: column; gap: 2px; }
    .quote figcaption span { font-weight: 400; color: var(--ink-3); font-family: var(--font-mono); font-size: var(--text-xs); }

    /* — Ft5 Statement — */
    .foot { padding: var(--space-4xl) var(--page-gutter) var(--space-2xl); }
    .foot__line { font-size: var(--text-display-s); line-height: 1.05;
      max-width: 20ch; margin: 0 0 var(--space-xl); }
    .foot__meta { gap: var(--space-md);
      margin-top: var(--space-2xl); padding-top: var(--space-lg); border-top: 1px solid var(--line); }
    .foot__note { color: var(--ink-3); font-size: var(--text-sm); }

    /* — Responsive — */
    @media (max-width: 900px) { .nav__center { display: none; } }
    @media (max-width: 820px) {
      .hero, .scan__inner { grid-template-columns: 1fr; gap: var(--space-xl); }
      .plan-card { order: -1; max-width: 460px; }
      .steps__grid, .quotes__grid { grid-template-columns: 1fr; }
      .listings { grid-template-columns: 1fr; }
      .listing { border-right: 0; border-bottom: 1px solid var(--line); }
      .listing:last-child { border-bottom: 0; }
    }
  `],
})
export class LandingComponent {
  /** Tipos que se muestran como chips (comparten claves con property.types). */
  readonly types = ['cuarto', 'casa', 'apartamento', 'edificio', 'comercial', 'condominio'];
  readonly quotes = ['one', 'two', 'three'];

  /** Frost del nav al hacer scroll. */
  readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }
}
