import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as L from 'leaflet';

export interface MapLocation {
    latitude: number;
    longitude: number;
    address?: string;
}

@Component({
    selector: 'app-leaflet-map',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div #mapContainer class="w-full h-full min-h-[300px] rounded-lg"></div>
    @if (showCoordinates) {
      <div class="mt-2 text-sm text-gray-600 flex gap-4">
        <span>Lat: {{ currentLocation?.latitude | number:'1.6-6' }}</span>
        <span>Lng: {{ currentLocation?.longitude | number:'1.6-6' }}</span>
      </div>
    }
  `,
    styles: [`
    :host {
      display: block;
    }
    :host ::ng-deep .leaflet-container {
      border-radius: 0.5rem;
    }
  `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LeafletMapComponent),
            multi: true
        }
    ]
})
export class LeafletMapComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

    @Input() height = '300px';
    @Input() showCoordinates = true;
    @Input() readonly = false;
    @Input() defaultLocation: MapLocation = { latitude: -6.2088, longitude: 106.8456 }; // Jakarta default
    @Input() zoom = 13;

    @Output() locationChange = new EventEmitter<MapLocation>();

    private map!: L.Map;
    private marker!: L.Marker;
    private onChange: (value: MapLocation | null) => void = () => { };
    private onTouched: () => void = () => { };

    currentLocation: MapLocation | null = null;

    ngOnInit() {
        this.initMap();
    }

    ngOnDestroy() {
        if (this.map) {
            this.map.remove();
        }
    }

    private initMap() {
        // Fix default marker icon path issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
        });

        // Initialize map
        this.map = L.map(this.mapContainer.nativeElement).setView(
            [this.defaultLocation.latitude, this.defaultLocation.longitude],
            this.zoom
        );

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add marker
        this.marker = L.marker(
            [this.defaultLocation.latitude, this.defaultLocation.longitude],
            { draggable: !this.readonly }
        ).addTo(this.map);

        this.currentLocation = { ...this.defaultLocation };

        // Handle marker drag
        if (!this.readonly) {
            this.marker.on('dragend', () => {
                const position = this.marker.getLatLng();
                this.updateLocation(position.lat, position.lng);
            });

            // Handle map click
            this.map.on('click', (e: L.LeafletMouseEvent) => {
                this.marker.setLatLng(e.latlng);
                this.updateLocation(e.latlng.lat, e.latlng.lng);
            });
        }

        // Fix map rendering issue
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    private updateLocation(lat: number, lng: number) {
        this.currentLocation = {
            latitude: lat,
            longitude: lng
        };
        this.onChange(this.currentLocation);
        this.onTouched();
        this.locationChange.emit(this.currentLocation);
    }

    // ControlValueAccessor implementation
    writeValue(value: MapLocation | null): void {
        if (value && this.map) {
            this.currentLocation = value;
            this.marker.setLatLng([value.latitude, value.longitude]);
            this.map.setView([value.latitude, value.longitude], this.zoom);
        }
    }

    registerOnChange(fn: (value: MapLocation | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (this.marker) {
            if (isDisabled) {
                this.marker.dragging?.disable();
            } else {
                this.marker.dragging?.enable();
            }
        }
    }

    // Public method to get current location
    getCurrentLocation(): MapLocation | null {
        return this.currentLocation;
    }

    // Public method to set location programmatically
    setLocation(lat: number, lng: number) {
        if (this.map && this.marker) {
            this.marker.setLatLng([lat, lng]);
            this.map.setView([lat, lng], this.zoom);
            this.updateLocation(lat, lng);
        }
    }

    // Get user's current GPS location
    locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.setLocation(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }
}
