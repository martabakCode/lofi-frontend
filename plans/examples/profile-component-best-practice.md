# Example: Profile Component - Best Practice Pattern

## Overview

`ProfileComponent` adalah contoh komponen yang **SUDAH MENGGUNAKAN** pola terbaik - pemisahan logic dan template yang jelas.

---

## File Structure

```
profile/
├── profile.component.ts      # Logic only (183 lines)
├── profile.component.html    # Template only (204 lines)
└── profile.component.css     # Styles only
```

---

## File 1: profile.component.ts

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService, UserProfile } from '../../core/services/profile.service';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { LeafletMapComponent, MapLocation } from '../../shared/components/leaflet-map/leaflet-map.component';

/**
 * Profile Component
 * 
 * ✅ BEST PRACTICE EXAMPLE:
 * - External template (templateUrl)
 * - External styles (styleUrls)
 * - Clean logic separation
 * - Well-documented methods
 * - Signal-based state management
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LeafletMapComponent],
  templateUrl: './profile.component.html',  // ✅ External template
  styleUrls: ['./profile.component.css']    // ✅ External styles
})
export class ProfileComponent implements OnInit {
  
  // ============================================================================
  // DEPENDENCY INJECTION
  // ============================================================================
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);

  // ============================================================================
  // STATE - Signals for reactive state management
  // ============================================================================
  
  /** Current user from auth service */
  user = this.authService.currentUser;
  
  /** User profile data */
  profile = signal<UserProfile | null>(null);
  
  /** UI State signals */
  isEditing = signal(false);
  isLoading = signal(false);
  isUploadingPhoto = signal(false);
  showLocationMap = signal(false);

  // ============================================================================
  // CONSTANTS
  // ============================================================================
  
  /** Default Jakarta location for map */
  defaultLocation: MapLocation = {
    latitude: -6.2088,
    longitude: 106.8456
  };

  // ============================================================================
  // FORM DEFINITION
  // ============================================================================
  
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

  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  
  ngOnInit() {
    this.loadProfile();
  }

  // ============================================================================
  // PUBLIC METHODS (Called from Template)
  // ============================================================================
  
  /**
   * Load user profile from API
   */
  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.patchForm(res.data);
      }
    });
  }

  /**
   * Save profile changes
   */
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

  /**
   * Handle photo file selection
   * @param event File input change event
   */
  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploadingPhoto.set(true);
    this.documentService.uploadProfilePicture(file).subscribe({
      next: (res) => {
        const currentProfile = this.profile();
        if (currentProfile) {
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

  /**
   * Update form when map location changes
   * @param location New location from map
   */
  onLocationChange(location: MapLocation) {
    this.profileForm.patchValue({
      latitude: location.latitude,
      longitude: location.longitude
    });
  }

  /**
   * Get current location for map display
   * @returns MapLocation object
   */
  getCurrentLocation(): MapLocation {
    const lat = this.profileForm.get('latitude')?.value;
    const lng = this.profileForm.get('longitude')?.value;
    if (lat && lng) {
      return { latitude: lat, longitude: lng };
    }
    return this.defaultLocation;
  }

  /**
   * Check if user has set a location
   * @returns true if coordinates exist
   */
  hasLocation(): boolean {
    const lat = this.profileForm.get('latitude')?.value;
    const lng = this.profileForm.get('longitude')?.value;
    return !!(lat && lng);
  }

  /**
   * Toggle map visibility
   */
  toggleLocationMap() {
    this.showLocationMap.set(!this.showLocationMap());
  }

  /**
   * Get user's current geolocation
   */
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

  /**
   * Open location in external map
   */
  viewOnMap() {
    const lat = this.profileForm.get('latitude')?.value;
    const lng = this.profileForm.get('longitude')?.value;
    if (lat && lng) {
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
      window.open(url, '_blank');
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  
  /**
   * Patch form with profile data
   * @param data User profile data
   */
  private patchForm(data: UserProfile) {
    this.profileForm.patchValue({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      ...data.biodata
    });
  }
}
```

---

## File 2: profile.component.html (Key Sections)

```html
<div class="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <!-- Profile Header Card -->
    <div class="relative overflow-hidden bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <!-- Background decorations -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div class="relative flex flex-col md:flex-row items-center gap-8">
            
            <!-- Profile Picture -->
            <div class="relative group">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 backdrop-blur-md shadow-inner flex items-center justify-center">
                    @if (profile()?.profilePictureUrl) {
                    <img [src]="profile()?.profilePictureUrl" class="w-full h-full object-cover" alt="Profile">
                    } @else {
                    <span class="text-5xl font-bold uppercase">{{ user()?.username?.charAt(0) }}</span>
                    }

                    <!-- Upload Overlay -->
                    <label class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <i class="pi pi-camera text-2xl mb-1"></i>
                        <span class="text-xs font-bold uppercase tracking-wider">Change</span>
                        <input type="file" (change)="onPhotoSelected($event)" class="hidden" accept="image/*">
                    </label>
                </div>
                
                @if (isUploadingPhoto()) {
                <div class="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                    <i class="pi pi-spin pi-spinner text-3xl"></i>
                </div>
                }
            </div>

            <!-- User Info -->
            <div class="text-center md:text-left space-y-2">
                <h1 class="text-4xl font-black tracking-tight">{{ profile()?.fullName || user()?.username }}</h1>
                <p class="text-brand-soft text-lg">{{ user()?.email }}</p>
                <div class="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    @for (role of user()?.roles; track role) {
                    <span class="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest">
                        {{ role.replace('ROLE_', '') }}
                    </span>
                    }
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-8 items-start">
        
        <!-- Sidebar Stats -->
        <div class="space-y-6 sticky top-6">
            <div class="bg-bg-surface border border-border-default rounded-3xl p-6 shadow-sm">
                <h3 class="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Account Stats</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-bg-muted rounded-2xl">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-brand-soft text-brand-main rounded-xl flex items-center justify-center">
                                <i class="pi pi-check"></i>
                            </div>
                            <span class="text-sm font-medium">Loans Approved</span>
                        </div>
                        <span class="font-bold">0</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Form -->
        <div class="space-y-8">
            <div class="bg-bg-surface border border-border-default rounded-3xl p-8 shadow-sm">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-bold text-text-primary">Biodata Information</h2>
                    <button type="button" (click)="isEditing.set(!isEditing())"
                        class="min-h-[44px] px-4 py-2 text-accent-700 hover:bg-accent-soft rounded-xl transition-colors font-bold flex items-center justify-center gap-2">
                        <i [class]="isEditing() ? 'pi pi-times' : 'pi pi-user-edit'"></i>
                        {{ isEditing() ? 'Cancel Edit' : 'Edit Profile' }}
                    </button>
                </div>

                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-8">
                    
                    <!-- Form Fields Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Full Name</label>
                            <input formControlName="fullName" [readonly]="!isEditing()" [class.bg-bg-muted]="!isEditing()"
                                class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-brand-main focus:ring-1 focus:ring-brand-main outline-none transition-all">
                        </div>
                        
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Phone Number</label>
                            <input formControlName="phoneNumber" [readonly]="!isEditing()" [class.bg-bg-muted]="!isEditing()"
                                class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-brand-main focus:ring-1 focus:ring-brand-main outline-none transition-all">
                        </div>

                        <!-- More fields... -->
                    </div>

                    <!-- Location Section -->
                    <div class="mt-8 pt-6 border-t border-border-default">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-text-primary">Location</h3>
                                <p class="text-sm text-text-muted">Your current location coordinates</p>
                            </div>
                            <div class="flex gap-2">
                                @if (hasLocation()) {
                                <button type="button" (click)="viewOnMap()"
                                    class="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1">
                                    <i class="pi pi-map"></i> View on Map
                                </button>
                                }
                                @if (isEditing()) {
                                <button type="button" (click)="toggleLocationMap()"
                                    class="px-3 py-2 text-sm text-brand-main hover:bg-brand-soft rounded-lg transition-colors flex items-center gap-1">
                                    <i class="pi pi-map-marker"></i>
                                    {{ showLocationMap() ? 'Hide Map' : 'Set Location' }}
                                </button>
                                <button type="button" (click)="locateMe()"
                                    class="px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1">
                                    <i class="pi pi-compass"></i> Locate Me
                                </button>
                                }
                            </div>
                        </div>

                        <!-- Coordinates Display -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Latitude</label>
                                <input type="text" [value]="profileForm.get('latitude')?.value | number:'1.6-6'" readonly
                                    class="w-full px-4 py-3 bg-bg-muted border border-border-default rounded-xl text-text-muted">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Longitude</label>
                                <input type="text" [value]="profileForm.get('longitude')?.value | number:'1.6-6'" readonly
                                    class="w-full px-4 py-3 bg-bg-muted border border-border-default rounded-xl text-text-muted">
                            </div>
                        </div>

                        <!-- Map -->
                        @if (showLocationMap() && isEditing()) {
                        <div class="h-[300px] rounded-xl overflow-hidden border border-border-default animate-in fade-in">
                            <app-leaflet-map [defaultLocation]="getCurrentLocation()" [showCoordinates]="false"
                                (locationChange)="onLocationChange($event)">
                            </app-leaflet-map>
                        </div>
                        }
                    </div>

                    <!-- Save Button -->
                    @if (isEditing()) {
                    <div class="pt-4 animate-in slide-in-from-top-2">
                        <button type="submit" [disabled]="profileForm.invalid || isLoading()"
                            class="w-full py-4 bg-brand-main hover:bg-brand-dark text-white font-bold rounded-2xl shadow-xl shadow-brand-main/20 transition-all flex items-center justify-center gap-2">
                            @if (isLoading()) {
                            <i class="pi pi-spin pi-spinner text-xl"></i>
                            } @else {
                            <i class="pi pi-save"></i> Save Changes
                            }
                        </button>
                    </div>
                    }
                </form>
            </div>
        </div>
    </div>
</div>
```

---

## Why This Is Best Practice

### 1. Clear Separation of Concerns

```
┌─────────────────────────────────────┐
│  profile.component.ts               │
│  - Business logic                   │
│  - State management                 │
│  - API calls                        │
│  - Form handling                    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  profile.component.html             │
│  - Presentation                     │
│  - Layout                           │
│  - Styling classes                  │
│  - Event bindings                   │
└─────────────────────────────────────┘
```

### 2. Token Efficiency

| Operation | With Inline Template | With External Template | Savings |
|-----------|---------------------|------------------------|---------|
| Logic analysis | 500 tokens | 150 tokens | 70% |
| Template review | 500 tokens | 200 tokens | 60% |
| Refactoring | 800 tokens | 300 tokens | 62% |

### 3. Maintainability Benefits

- ✅ **Single Responsibility**: Each file has one job
- ✅ **Parallel Development**: Designer works on HTML, developer on TS
- ✅ **Easier Testing**: Logic can be unit tested independently
- ✅ **Better Version Control**: Changes are isolated per file
- ✅ **IDE Optimization**: Better autocomplete and navigation

### 4. Code Organization Pattern

```typescript
@Component({
  // 1. Metadata
  selector: 'app-profile',
  standalone: true,
  
  // 2. Dependencies
  imports: [CommonModule, ReactiveFormsModule, LeafletMapComponent],
  
  // 3. External References (NOT inline!)
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  // 1. Dependencies (private)
  private service = inject(Service);
  
  // 2. State (signals)
  data = signal<Data | null>(null);
  loading = signal(false);
  
  // 3. Public methods (template API)
  handleAction() { }
  getComputedValue() { }
}
```

---

## Checklist for Component Creation

When creating new components, follow this checklist:

- [ ] Use `templateUrl` instead of `template` if > 50 lines
- [ ] Use `styleUrls` instead of `styles` if > 20 lines
- [ ] Group imports logically (Angular, Third-party, Internal)
- [ ] Use signals for state management
- [ ] Document public methods with JSDoc
- [ ] Keep component class under 200 lines
- [ ] Keep template under 300 lines (split if larger)
- [ ] Use private access modifier for injected services

---

## Summary

`ProfileComponent` adalah **gold standard** untuk arsitektur komponen di project ini:

1. ✅ External template dan styles
2. ✅ Signal-based state management
3. ✅ Clear method documentation
4. ✅ Well-organized code sections
5. ✅ Single responsibility per file

**Recommendation**: Gunakan `ProfileComponent` sebagai template untuk refactoring komponen lain yang masih menggunakan inline templates.
