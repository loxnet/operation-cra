import { AfterViewInit, Component, effect, input, OnDestroy, OnInit, signal } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  coordinates = input<GeolocationCoordinates | null>();
  marker?: L.Marker;
  constructor() {
    effect(() => {
      const coords = this.coordinates();
      if (!coords) return;
      if (this.map) {
        this.map.setView([coords.latitude, coords.longitude], this.map.getZoom());
      } else {
        const coords = this.coordinates();
        this.initMap(coords!);
      }
      if (this.marker) {
        this.marker.setLatLng([coords.latitude, coords.longitude]);
      } else {
        this.marker = L.marker([coords.latitude, coords.longitude]).addTo(this.map);
      }
    });
  }
  ngOnInit() {}
  ngAfterViewInit(): void {
    const coords = this.coordinates();
    if (coords && this.map) this.initMap(coords);
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  private initMap(coords: GeolocationCoordinates | null): void {
    if (coords) {
      this.map = L.map('map', {
        center: [coords.latitude, coords.longitude],
        zoom: 12,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
    }
  }
}
