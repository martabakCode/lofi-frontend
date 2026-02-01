import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService, UserProfile } from '../../core/services/profile.service';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { LeafletMapComponent, MapLocation } from '../../shared/components/leaflet-map/leaflet-map.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LeafletMapComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);

  user = this.authService.currentUser;
  profile = signal<UserProfile | null>(null);

  isEditing = signal(false);
  isLoading = signal(false);
  isUploadingPhoto = signal(false);
  showLocationMap = signal(false);

  // Default Jakarta location
  defaultLocation: MapLocation = {
    latitude: -6.2088,
    longitude: 106.8456
  };

  profileForm = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    incomeSource: [''],
    incomeType: [''],
    monthlyIncome: [0],
    age: [0],
    nik: [''],
    dateOfBirth: [''],
    placeOfBirth: [''],
    city: [''],
    address: [''],
    province: [''],
    district: [''],
    subDistrict: [''],
    postalCode: [''],
    longitude: [null as number | null],
    latitude: [null as number | null]
  });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.patchForm(res.data);
      }
    });
  }

  patchForm(data: UserProfile) {
    this.profileForm.patchValue({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      ...data.biodata
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.isLoading.set(true);

    const formData = this.profileForm.value;
    this.profileService.updateProfile({
      ...formData,
      profilePictureUrl: this.profile()?.profilePictureUrl
    } as any).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        this.showLocationMap.set(false);
        this.profile.set(res.data);
        this.toast.show('Profile updated successfully', 'success');
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploadingPhoto.set(true);
    this.documentService.uploadProfilePicture(file).subscribe({
      next: (res) => {
        // Update profile with new URL
        const currentProfile = this.profile();
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, profilePictureUrl: res.objectKey }; // Backend should return full URL or we prepend base
          // Actually backend returns objectKey, storageService handles URL.
          // For simplicity, let's assume we can use a direct download URL if we have one.
          // I'll update the profile on the server with the object key
          this.profileService.updateProfile({
            ...this.profileForm.value,
            profilePictureUrl: res.objectKey
          } as any).subscribe(profileRes => {
            this.profile.set(profileRes.data);
            this.isUploadingPhoto.set(false);
            this.toast.show('Profile photo updated', 'success');
          });
        }
      },
      error: () => this.isUploadingPhoto.set(false)
    });
  }

  onLocationChange(location: MapLocation) {
    this.profileForm.patchValue({
      latitude: location.latitude,
      longitude: location.longitude
    });
  }

  getCurrentLocation(): MapLocation {
    const lat = this.profileForm.get('latitude')?.value;
    const lng = this.profileForm.get('longitude')?.value;
    if (lat && lng) {
      return { latitude: lat, longitude: lng };
    }
    return this.defaultLocation;
  }

  hasLocation(): boolean {
    const lat = this.profileForm.get('latitude')?.value;
    const lng = this.profileForm.get('longitude')?.value;
    return !!(lat && lng);
  }

  toggleLocationMap() {
    this.showLocationMap.set(!this.showLocationMap());
  }

  locateMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.profileForm.patchValue({
            latitude: latitude,
            longitude: longitude
          });
          this.showLocationMap.set(true);
          this.toast.show('Location captured successfully', 'success');
        },
        (error) => {
          console.error('Error getting location:', error);
          this.toast.show('Failed to get your location. Please enable location services.', 'error');
        }
      );
    } else {
      this.toast.show('Geolocation is not supported by your browser', 'error');
    }
  }

  viewOnMap() {
    const lat = this.profileForm.get('latitude')?.value;
    const lng = this.profileForm.get('longitude')?.value;
    if (lat && lng) {
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
      window.open(url, '_blank');
    }
  }
}
