import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

const ADMIN_GUARD = [adminGuard];
const ADMIN_ONLY_GUARD = [adminGuard];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./features/access-denied/access-denied.component').then((m) => m.AccessDeniedComponent),
  },
  {
    path: 'dashboard',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'inventory',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/inventory/inventory-list/inventory-list.component').then((m) => m.InventoryListComponent),
  },
  {
    path: 'inventory/new',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/inventory/product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    path: 'inventory/:id/edit',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/inventory/product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    path: 'orders',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/orders/orders-list/orders-list.component').then((m) => m.OrdersListComponent),
  },
  {
    path: 'orders/:id',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/orders/order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
  },
  {
    path: 'customers',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/customers/customers-list/customers-list.component').then((m) => m.CustomersListComponent),
  },
  {
    path: 'customers/:userId',
    canActivate: ADMIN_GUARD,
    loadComponent: () => import('./features/customers/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent),
  },
  {
    path: 'stats',
    canActivate: ADMIN_ONLY_GUARD,
    data: { requiredRole: 'ADMIN' },
    loadComponent: () => import('./features/stats/stats-overview/stats-overview.component').then((m) => m.StatsOverviewComponent),
  },
  {
    path: 'stats/revenue',
    canActivate: ADMIN_ONLY_GUARD,
    data: { requiredRole: 'ADMIN' },
    loadComponent: () => import('./features/stats/revenue-stats/revenue-stats.component').then((m) => m.RevenueStatsComponent),
  },
  {
    path: 'stats/products',
    canActivate: ADMIN_ONLY_GUARD,
    data: { requiredRole: 'ADMIN' },
    loadComponent: () => import('./features/stats/product-stats/product-stats.component').then((m) => m.ProductStatsComponent),
  },
  {
    path: 'stats/customers',
    canActivate: ADMIN_ONLY_GUARD,
    data: { requiredRole: 'ADMIN' },
    loadComponent: () => import('./features/stats/customer-stats/customer-stats.component').then((m) => m.CustomerStatsComponent),
  },
  {
    path: 'stats/orders',
    canActivate: ADMIN_ONLY_GUARD,
    data: { requiredRole: 'ADMIN' },
    loadComponent: () => import('./features/stats/order-stats/order-stats.component').then((m) => m.OrderStatsComponent),
  },
  { path: '**', redirectTo: '' },
];

