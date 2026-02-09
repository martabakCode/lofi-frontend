import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../../core/services/rbac.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Branch } from '../../../../core/models/rbac.models';
import { LeafletMapComponent, MapLocation } from '../../../../shared/components/leaflet-map/leaflet-map.component';
import { PageHeaderComponent } from '../../../../shared/components/page/page-header.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-branch-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, LeafletMapComponent, PageHeaderComponent, CardComponent],
    templateUrl: './branch-form.component.html',
    styleUrls: ['./branch-form.component.css']
})
export class BranchFormComponent implements OnInit {
    private rbacService = inject(RbacService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // State signals
    isEditMode = signal(false);
    isSubmitting = signal(false);
    error = signal<string | null>(null);
    branchId = signal<string | null>(null);

    // Default Jakarta location
    defaultLocation: MapLocation = {
        latitude: -6.2088,
        longitude: 106.8456
    };

    // Form
    branchForm = this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['ID', Validators.required],
        zipCode: ['', Validators.required],
        phone: ['', Validators.required],
        longitude: [''],
        latitude: ['']
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.branchId.set(id);
            this.loadBranch(id);
        }
    }

    loadBranch(id: string) {
        this.isSubmitting.set(true);
        this.rbacService.getBranchById(id).subscribe({
            next: (branch) => {
                this.branchForm.patchValue({
                    name: branch.name,
                    address: branch.address,
                    city: branch.city,
                    state: branch.state,
                    zipCode: branch.zipCode,
                    phone: branch.phone,
                    longitude: branch.longitude || '',
                    latitude: branch.latitude || ''
                });
                this.isSubmitting.set(false);
            },
            error: () => {
                this.toastService.show('Failed to load branch', 'error');
                this.isSubmitting.set(false);
                this.router.navigate(['/dashboard/branches']);
            }
        });
    }

    onLocationChange(location: MapLocation) {
        this.branchForm.patchValue({
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString()
        });
    }

    getCurrentLocation(): MapLocation {
        const lat = parseFloat(this.branchForm.get('latitude')?.value || '0');
        const lng = parseFloat(this.branchForm.get('longitude')?.value || '0');
        if (lat && lng) {
            return { latitude: lat, longitude: lng };
        }
        return this.defaultLocation;
    }

    onSubmit() {
        if (this.branchForm.invalid) {
            this.branchForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.error.set(null);

        const formValue = this.branchForm.getRawValue();

        const branchData: Partial<Branch> = {
            name: formValue.name!,
            address: formValue.address!,
            city: formValue.city!,
            state: formValue.state!,
            zipCode: formValue.zipCode!,
            phone: formValue.phone!,
            longitude: formValue.longitude || undefined,
            latitude: formValue.latitude || undefined
        };

        if (this.isEditMode() && this.branchId()) {
            this.rbacService.updateBranch(this.branchId()!, branchData).subscribe({
                next: () => {
                    this.toastService.show('Branch updated successfully', 'success');
                    this.router.navigate(['/dashboard/branches']);
                },
                error: (err) => {
                    this.isSubmitting.set(false);
                    this.error.set(err.error?.message || 'Failed to update branch');
                    this.toastService.show('Failed to update branch', 'error');
                }
            });
        } else {
            this.rbacService.createBranch(branchData).subscribe({
                next: () => {
                    this.toastService.show('Branch created successfully', 'success');
                    this.router.navigate(['/dashboard/branches']);
                },
                error: (err) => {
                    this.isSubmitting.set(false);
                    this.error.set(err.error?.message || 'Failed to create branch');
                    this.toastService.show('Failed to create branch', 'error');
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/dashboard/branches']);
    }
}
