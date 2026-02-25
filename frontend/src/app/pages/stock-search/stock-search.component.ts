import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  StockSearchItem,
  StocksService,
} from 'src/app/core/api/stocks.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './stock-search.component.html',
  styleUrls: ['./stock-search.component.scss'],
})
export class StockSearchComponent {
  query = new FormControl('');
  results: StockSearchItem[] = [];
  resultCount: number | null = null;
  loading: boolean = false;
  error: string = '';

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
  }

  constructor(
    private stocksService: StocksService,
    private auth: AuthService,
    private router: Router,
  ) {
    this.query.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value) => {
        const q = value?.trim();

        if (!q) {
          this.results = [];
          this.loading = false;
          this.error = '';
          return;
        }
        this.loading = true;
        this.error = '';
        this.stocksService.searchStocks(q).subscribe({
          next: (res) => {
            console.log(res.count);
            console.log(res.results);
            const supported = res.results.filter((item) =>
              this.isSupportedByFmpProfile(item.symbol),
            );
            this.results = supported;
            this.resultCount = supported.length;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'search Failed';
            this.loading = false;
          },
        });
      });
  }
  private isSupportedByFmpProfile(symbol: string): boolean {
    if (!symbol) return false;

    // Indices like ^GSPC
    if (symbol.startsWith('^')) return false;

    // Common non-company formats (forex/crypto/vendor formats)
    if (
      symbol.includes('=') ||
      symbol.includes('/') ||
      symbol.includes(':') ||
      symbol.includes('.')
    )
      return false;

    return true;
  }
}
