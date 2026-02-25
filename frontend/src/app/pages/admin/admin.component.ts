import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminOverview,
  AdminService,
  AdminStockTotals,
} from 'src/app/core/api/admin.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  overviewAnalyticsLoading = false;
  overviewAnalyticsError: string = '';
  overviewAnalytics: AdminOverview | null = null;

  symbol = new FormControl('');
  stockAnalyticsLoading: boolean = false;
  stockAnalyticsError: string = '';
  stockAnalyticsTotal: AdminStockTotals | null = null;

  notAuthorized: boolean = false;

  constructor(
    private admin: AdminService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadOverview();
  }

  loadOverview() {
    this.overviewAnalyticsLoading = true;
    this.overviewAnalyticsError = '';
    this.admin.getOverview().subscribe({
      next: (response) => {
        this.overviewAnalytics = response;
        this.notAuthorized = false;
        this.overviewAnalyticsLoading = false;
      },
      error: (err) => {
        if (err.status === 403) {
          this.notAuthorized = true;
          this.router.navigate(['/holdings']);
        }
        this.overviewAnalyticsError = 'Failed to load admin overview.';
        this.overviewAnalyticsLoading = false;
      },
    });
  }

  fetchStockTotals() {
    const sanatizedSymbol = this.symbol.value?.trim().toUpperCase();
    if (!sanatizedSymbol) return;

    this.stockAnalyticsLoading = true;
    this.stockAnalyticsError = '';
    this.stockAnalyticsTotal = null;

    this.admin.getStockTotals(sanatizedSymbol).subscribe({
      next: (res) => {
        this.stockAnalyticsTotal = res;
        this.stockAnalyticsLoading = false;
      },
      error: () => {
        this.stockAnalyticsError = 'Failed to load stock totals';
        this.stockAnalyticsLoading = false;
      },
    });
  }
  toNum(v: any): number {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) ? n : 0;
  }
  money(v: any): string {
    return this.toNum(v).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    });
  }
}
