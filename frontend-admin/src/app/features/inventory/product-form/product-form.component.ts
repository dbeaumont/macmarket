import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { CATEGORY_LABELS } from '../../../core/models/admin.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
            MatInputModule, MatSelectModule, MatProgressSpinnerModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminApi = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  private productId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    description: ['', Validators.required],
    shortDesc: ['', [Validators.required, Validators.maxLength(120)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    category: ['MACBOOK_AIR', Validators.required],
    imageUrl: ['', Validators.required],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    promotionPercentage: [0, [Validators.min(0), Validators.max(100)]],
    specs: this.fb.array([]),
  });

  get specsArray(): FormArray {
    return this.form.get('specs') as FormArray;
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.adminApi.getProduct(this.productId).subscribe({
        next: (p) => {
          this.form.patchValue({
            name: p.name,
            slug: p.slug,
            description: p.description,
            shortDesc: p.shortDesc,
            price: p.price,
            category: p.category,
            imageUrl: p.imageUrl,
            stockQuantity: p.stockQuantity,
            promotionPercentage: p.promotionPercentage,
          });
          Object.entries(p.specs).forEach(([key, value]) => this.addSpec(key, value));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }

    // Auto-slug from name
    this.form.get('name')?.valueChanges.subscribe((name) => {
      if (!this.isEdit()) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        this.form.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  addSpec(key = '', value = ''): void {
    this.specsArray.push(
      this.fb.nonNullable.group({
        key: [key, Validators.required],
        value: [value, Validators.required],
      })
    );
  }

  removeSpec(index: number): void {
    this.specsArray.removeAt(index);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);

    const raw = this.form.getRawValue();
    const specs = Object.fromEntries(
      (raw.specs as Array<{ key: string; value: string }>).map(({ key, value }) => [key, value])
    );

    const data = {
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      shortDesc: raw.shortDesc,
      price: raw.price,
      category: raw.category,
      imageUrl: raw.imageUrl,
      stockQuantity: raw.stockQuantity,
      specs,
      promotionPercentage: raw.promotionPercentage,
    };

    const obs = this.isEdit() && this.productId
      ? this.adminApi.updateProduct(this.productId, data)
      : this.adminApi.createProduct(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.isEdit() ? 'Produit mis à jour' : 'Produit créé', 'OK', { duration: 2000 });
        void this.router.navigate(['/inventory']);
      },
      error: (err: Error) => {
        this.snackBar.open(err.message, 'OK', { duration: 4000 });
        this.submitting.set(false);
      },
    });
  }
}
