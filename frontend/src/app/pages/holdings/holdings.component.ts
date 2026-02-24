import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HoldingsService,
  HoldingRow,
  HoldingsSummary,
} from 'src/app/core/api/holdings.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-holdings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.scss'],
})
export class HoldingsComponent {
  loading: boolean = false;
  error: string = '';

  summary: HoldingsSummary | null = null;
  rows: HoldingRow[] = [];

  constructor(
    private holdings: HoldingsService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.load();
  }
  load(): void {
    this.loading = true;
    this.error = '';

    this.holdings.getSummary().subscribe({
      next: (res: HoldingsSummary) => {
        this.summary = res;
        this.rows = res.holdings ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load data';
        console.log('Handaling errors:', err.status, err?.error);
      },
    });
  }
  private toNum(v: any): number {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) ? n : 0;
  }

  money(v: any): string {
    return this.toNum(v).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }

  pct(v: any): string {
    return `${this.toNum(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  }
}
