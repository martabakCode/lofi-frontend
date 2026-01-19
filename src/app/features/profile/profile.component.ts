import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService, UserProfile } from '../../core/services/profile.service';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Profile Header Card -->
      <div class="relative overflow-hidden bg-brand-main rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-brand-main/20">
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

          <div class="text-center md:text-left space-y-2">
            <h1 class="text-4xl font-black tracking-tight">{{ profile()?.fullName || user()?.username }}</h1>
            <p class="text-brand-soft text-lg">{{ user()?.email }}</p>
            <div class="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              @for (role of user()?.roles; track role) {
                <span class="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest leading-none">
                  {{ role.replace('ROLE_', '') }}
                </span>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar Stats -->
        <div class="space-y-6">
          <div class="bg-bg-surface border border-border-default rounded-3xl p-6 shadow-sm">
             <h3 class="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Account Stats</h3>
             <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-bg-muted rounded-2xl">
                   <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center">
                         <i class="pi pi-check"></i>
                      </div>
                      <span class="text-sm font-medium">Loans Approved</span>
                   </div>
                   <span class="font-bold">0</span>
                </div>
                <!-- Add more stats here -->
             </div>
          </div>
        </div>

        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-bg-surface border border-border-default rounded-3xl p-8 shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-text-primary">Biodata Information</h2>
              <button 
                type="button" 
                (click)="isEditing.set(!isEditing())"
                class="px-4 py-2 text-brand-main hover:bg-brand-soft rounded-xl transition-colors font-bold flex items-center gap-2">
                <i [class]="isEditing() ? 'pi pi-times' : 'pi pi-user-edit'"></i>
                {{ isEditing() ? 'Cancel Edit' : 'Edit Profile' }}
              </button>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-8">
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
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">NIK (Identity Number)</label>
                  <input formControlName="nik" [readonly]="!isEditing()" [class.bg-bg-muted]="!isEditing()"
                    class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-brand-main focus:ring-1 focus:ring-brand-main outline-none transition-all">
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Income Source</label>
                  <input formControlName="incomeSource" [readonly]="!isEditing()" [class.bg-bg-muted]="!isEditing()"
                    class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-brand-main focus:ring-1 focus:ring-brand-main outline-none transition-all">
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Monthly Income</label>
                  <input type="number" formControlName="monthlyIncome" [readonly]="!isEditing()" [class.bg-bg-muted]="!isEditing()"
                    class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-brand-main focus:ring-1 focus:ring-brand-main outline-none transition-all">
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">City</label>
                  <input formControlName="city" [readonly]="!isEditing()" [class.bg-bg-muted]="!isEditing()"
                    class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-brand-main focus:ring-1 focus:ring-brand-main outline-none transition-all">
                </div>
              </div>

              @if (isEditing()) {
                <div class="pt-4 animate-in slide-in-from-top-2">
                  <button 
                    type="submit" 
                    [disabled]="profileForm.invalid || isLoading()"
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
  `,
    styles: [`
    :host { display: block; padding-bottom: 2rem; }
    input[readonly] { cursor: default; }
  `]
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
        postalCode: ['']
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
}
