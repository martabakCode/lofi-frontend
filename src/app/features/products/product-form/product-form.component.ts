import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductVM } from '../models/product.models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State signals
  isEditMode = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  productId = signal<string | null>(null);

  // Form
  productForm = this.fb.group({
    productCode: ['', Validators.required],
    productName: ['', Validators.required],
    description: [''],
    minLoanAmount: [0, [Validators.required, Validators.min(0)]],
    maxLoanAmount: [0, [Validators.required, Validators.min(0)]],
    minTenor: [1, [Validators.required, Validators.min(1)]],
    maxTenor: [12, [Validators.required, Validators.min(1)]],
    interestRate: [0, [Validators.required, Validators.min(0)]],
    adminFee: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.isSubmitting.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          productCode: product.productCode,
          productName: product.productName,
          description: product.description,
          minLoanAmount: product.minLoanAmount,
          maxLoanAmount: product.maxLoanAmount,
          minTenor: product.minTenor,
          maxTenor: product.maxTenor,
          interestRate: product.interestRate,
          adminFee: product.adminFee,
          isActive: product.isActive
        });
        this.isSubmitting.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load product', 'error');
        this.isSubmitting.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // Validate min/max amounts
    const formValue = this.productForm.getRawValue();
    if (formValue.minLoanAmount! > formValue.maxLoanAmount!) {
      this.error.set('Minimum loan amount cannot be greater than maximum amount');
      return;
    }
    if (formValue.minTenor! > formValue.maxTenor!) {
      this.error.set('Minimum tenor cannot be greater than maximum tenor');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const productData = {
      productCode: formValue.productCode!,
      productName: formValue.productName!,
      description: formValue.description || '',
      minLoanAmount: formValue.minLoanAmount!,
      maxLoanAmount: formValue.maxLoanAmount!,
      minTenor: formValue.minTenor!,
      maxTenor: formValue.maxTenor!,
      interestRate: formValue.interestRate!,
      adminFee: formValue.adminFee!,
      isActive: formValue.isActive!
    };

    if (this.isEditMode() && this.productId()) {
      this.productService.updateProduct(this.productId()!, productData).subscribe({
        next: () => {
          this.toastService.show('Product updated successfully', 'success');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err.error?.message || 'Failed to update product');
          this.toastService.show('Failed to update product', 'error');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.toastService.show('Product created successfully', 'success');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err.error?.message || 'Failed to create product');
          this.toastService.show('Failed to create product', 'error');
        }
      });
    }
  }
}
