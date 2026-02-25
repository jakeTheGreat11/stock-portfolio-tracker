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
  deletingSymbol: string | null = null;

  responseDetail: string = '';

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

  reduceOrDelete(row: HoldingRow) {
    const symbol = row.symbol.trim().toUpperCase();
    const currentQuant = Number(row.quantity);
    const input = prompt(
      `How many ${symbol} shares do you want to remove? \n Current ${currentQuant}`,
    );

    if (input == null) return;

    const removeQuant = Number(input);

    if (removeQuant > currentQuant) {
      alert(`You cant remove more than you have.`);
      return;
    }
    if (removeQuant < 0) {
      alert(`invalid quantity`);
      return;
    }

    const remainQuant = currentQuant - removeQuant;
    this.deletingSymbol = symbol;

    if (remainQuant == 0) {
      this.holdings.deleteHolding(this.deletingSymbol).subscribe({
        next: (res: any) => {
          this.deletingSymbol = null;
          console.log(res);
          this.responseDetail = res.detail;
          alert(this.responseDetail);
          this.load();
        },
        error: () => {
          this.deletingSymbol = null;
          this.error = `Failed to delete ${symbol}`;
        },
      });
    } else {
      this.holdings.updateHolding(this.deletingSymbol, remainQuant).subscribe({
        next: () => {
          this.deletingSymbol = null;
          alert(this.responseDetail);
          this.load();
        },
        error: () => {
          this.deletingSymbol = null;
          this.error = `Failed to update ${symbol}`;
        },
      });
    }
  }

  //helper function for display
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

  pct(v: any): string {
    return `${this.toNum(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  }
}
