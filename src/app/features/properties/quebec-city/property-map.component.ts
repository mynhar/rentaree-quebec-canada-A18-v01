import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import maplibregl from 'maplibre-gl';
import { PropertyCard } from '../property.service';
import { DEFAULT_MAP_CENTER } from '../../../core/config/constants';
import { formatCAD } from '../../../core/util/format';

// Estilo vectorial gratuito y sin API key (claro, minimalista).
// Alternativa de producción: MapTiler "positron" con tu propia key.
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

@Component({
  selector: 'app-property-map',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `<div #map class="pm-map"></div>`,
  styles: [`
    app-property-map { display: block; position: relative; height: 100%; }
    .pm-map { position: absolute; inset: 0; }
    .pm-pin {
      font-family: var(--font-mono); font-size: 12px; font-weight: 700;
      color: var(--ink); background: #fff;
      border: 1px solid var(--line-2); border-radius: 100px;
      padding: 4px 9px; cursor: pointer; white-space: nowrap;
      box-shadow: 0 1px 3px rgba(24,27,24,.18);
      transition: background .12s ease, color .12s ease, border-color .12s ease;
    }
    .pm-pin:hover { border-color: var(--ink-3); }
    .pm-pin--sel { background: var(--accent); color: #fff; border-color: var(--accent); }
  `],
})
export class PropertyMapComponent implements AfterViewInit, OnDestroy {
  readonly properties = input<PropertyCard[]>([]);
  readonly center = input<{ lat: number; lng: number }>(DEFAULT_MAP_CENTER);
  readonly selectedId = input<string | null>(null);
  readonly markerSelect = output<string>();

  @ViewChild('map', { static: true }) private mapEl!: ElementRef<HTMLDivElement>;

  private map?: maplibregl.Map;
  private readonly markers = new Map<string, maplibregl.Marker>();
  private ready = false;

  constructor() {
    effect(() => {
      const props = this.properties();
      if (this.ready) this.renderMarkers(props);
    });
    effect(() => {
      const id = this.selectedId();
      this.highlight(id);
      if (this.ready && id) this.focus(id);
    });
  }

  ngAfterViewInit(): void {
    const c = this.center();
    this.map = new maplibregl.Map({
      container: this.mapEl.nativeElement,
      style: MAP_STYLE,
      center: [c.lng, c.lat],
      zoom: 11,
    });
    this.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    this.map.on('load', () => {
      this.ready = true;
      this.renderMarkers(this.properties());
    });
  }

  ngOnDestroy(): void {
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
    this.map?.remove();
  }

  private renderMarkers(props: PropertyCard[]): void {
    const map = this.map;
    if (!map) return;
    this.markers.forEach((m) => m.remove());
    this.markers.clear();

    const bounds = new maplibregl.LngLatBounds();
    let count = 0;

    for (const p of props) {
      if (p.latitude == null || p.longitude == null) continue;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'pm-pin';
      el.textContent = formatCAD(p.price);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.markerSelect.emit(p.id);
      });
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.longitude, p.latitude])
        .addTo(map);
      this.markers.set(p.id, marker);
      bounds.extend([p.longitude, p.latitude]);
      count++;
    }

    this.highlight(this.selectedId());
    if (count > 1) map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 400 });
  }

  private highlight(id: string | null): void {
    this.markers.forEach((m, key) => {
      m.getElement().classList.toggle('pm-pin--sel', key === id);
    });
  }

  private focus(id: string): void {
    const map = this.map;
    const marker = this.markers.get(id);
    if (!marker || !map) return;
    map.flyTo({ center: marker.getLngLat(), zoom: Math.max(map.getZoom(), 14), duration: 500 });
  }
}
