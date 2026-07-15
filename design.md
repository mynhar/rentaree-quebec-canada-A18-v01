# Rentaree — sistema de diseño (Hallmark · Cobalt)

Sistema visual bloqueado para el rediseño de Rentaree. **Este archivo es la fuente de
verdad del sistema**; cada pantalla que se rediseñe debe adherirse a él (las páginas
comparten el sistema, no se diferencian entre sí). Los tokens viven en
[`src/styles.css`](src/styles.css) `:root` (cargado global por `angular.json`) y se
exportan en [`tokens.css`](tokens.css).

> Estado: **Propagación completa (Fases 1–5).** Sistema Cobalt aplicado a toda la app:
> landing, auth, completar-perfil, quebec-city (lista/mapa/split), property-card,
> property-detail, property-form, photo-picker, scanner-dashboard, admin, property-map.
> Todas las pantallas beben de los tokens globales de `src/styles.css`.

## Génesis

- **Género:** modern-minimal (marketplace confiado y moderno).
- **Tema:** Cobalt — canvas frío near-white, **una** señal cobalto, hairlines que
  cargan la estructura, radios ajustados "dibujados con regla", una banda oscura de
  grafito por página para el ritmo claro → oscuro → claro.
- **Sello de marca:** el **plano de línea + dimensiones reales** (el diferenciador de
  Rentaree) se conserva y se eleva a *tarjeta de escaneo* — reemplaza la "code-card"
  canónica de Cobalt con el mismo gesto de credibilidad de panel de instrumentos.

## Principios (no romper)

1. **Un solo acento cobalto**, < 5% de cualquier viewport: botón primario, foco, tick
   del eyebrow, hover de enlaces, chip de estado, item de nav activo. Todo lo demás es
   tinta sobre papel frío.
2. **Hairlines antes que sombras.** La profundidad viene de bordes de 1px, no de blur.
   Sombra solo como leve elevación en tarjetas destacadas.
3. **Papel frío, nunca `#fff`; tinta carbón fría, nunca `#000`.**
4. **Etiquetas mono en mayúsculas** (Space Mono, `0.08em`, uppercase) para eyebrows,
   meta, estados, dimensiones — la "voz de instrumento" contra el display Space Grotesk.
5. **Radios:** 6px controles, 10px tarjetas. Ni pills blandas ni 0px brutalista.
6. **Movimiento sobrio:** hover-lift, frost del nav al scroll, una entrada del hero.
   Máx. 3 primitivas; todo tras `prefers-reduced-motion`. Animar solo `transform`/`opacity`.
7. **Sin cromo falso:** nada de barras de navegador/ventana falsas con "semáforos".
8. **Tag de sección apilado arriba** del título, nunca a la izquierda (tell editorial).

## Tokens clave

| Rol | Token | Valor |
| --- | --- | --- |
| Papel | `--paper` | `oklch(98.3% 0.005 250)` |
| Superficie/tarjeta | `--surface` | `oklch(99.4% 0.003 250)` |
| Tinta principal | `--ink` | `oklch(25% 0.020 258)` |
| Cuerpo | `--ink-2` | `oklch(39% 0.018 257)` |
| Apagado (AA) | `--ink-3` | `oklch(52% 0.015 256)` |
| Hairline | `--line` | `oklch(92% 0.006 255)` |
| Acento | `--accent` | `oklch(55% 0.200 256)` (AA sobre botón primario) |
| Grafito (banda) | `--graphite` | `oklch(22% 0.016 260)` |

Escala 4pt (`--space-xs…4xl`), escala tipográfica (`--text-xs…display`), eases
(`--ease-out/in/in-out`), duraciones (`--dur-fast/dur/dur-slow`). Ver `tokens.css`.

## Tipografía

- **Display:** Space Grotesk 600, tracking `-0.02em`, siempre romano (nunca itálica).
- **Cuerpo:** Inter 400/500.
- **Datos:** Space Mono — precios, expedientes, dimensiones, etiquetas de estado.

## Componentes (léxico Hallmark en uso)

- **Nav de la app autenticada:** `AppHeaderComponent`
  ([core/layout/app-header.component.ts](src/app/core/layout/app-header.component.ts)) —
  barra compartida y sticky usada en TODAS las pantallas tras el login (listado, ficha,
  formulario, escáner, admin). Marca + enlaces (Propiedades · Escáner · Admin, **según
  rol**) izq. · idioma + Nueva propiedad + nombre + Salir der. La landing y auth tienen
  su propio nav (no usan éste).
- **Nav (landing):** N1b — barra con borde, `frost-on-scroll`, marca izq. · enlaces centro ·
  idioma + CTA cobalto der. Centro oculto < 900px.
- **Footer:** Ft5 — frase de cierre grande + CTA + meta apagada.
- **Hero:** diptych asimétrico (texto izq. / tarjeta de plano der.).
- **Primitivos globales:** `.btn` (`--primary`/`--ghost`/`--block`), `.input`,
  `.mono-label`. Reutilizar; no reinventar por pantalla.

## Guía de propagación (siguientes fases)

Al rediseñar cada pantalla restante, **reutilizar** los tokens y primitivos anteriores y:
- Tarjetas → `--surface` + `border 1px --line` + `--radius-lg`, hover `--line-2` + `--shadow`.
- Cualquier bloque de datos/dimensiones → tratamiento de tarjeta de plano (grafito) o
  filas hairline con valores en Space Mono.
- Formularios → `.input` + `.mono-label` para leyendas; foco cobalto.
- Máx. una banda de grafito por pantalla (momento de énfasis).
- Verificar cada pantalla a 320 / 375 / 414 / 768 px. Objetivos táctiles ≥ 44px.
- **Nunca** hard-codear texto: usar `t('…')` (Transloco, FR default) en las tres lenguas.
