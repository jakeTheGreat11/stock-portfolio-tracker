import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { guestGuard } from './core/auth/guest.guard';
import { HoldingsComponent } from './pages/holdings/holdings.component';
import { authGuard } from './core/auth/auth.guard';
import { StockSearchComponent } from './pages/stock-search/stock-search.component';
import { StockDetailsComponent } from './pages/stock-details/stock-details.component';
import { AdminComponent } from './pages/admin/admin.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  { path: 'holdings', component: HoldingsComponent, canActivate: [authGuard] },
  {
    path: 'stocks/search',
    component: StockSearchComponent,
    canActivate: [authGuard],
  },
  {
    path: 'stocks/:symbol',
    component: StockDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'holdings' },
  { path: '**', redirectTo: 'holdings' },
];
