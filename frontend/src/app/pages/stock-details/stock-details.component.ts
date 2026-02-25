import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { StockDetails, StocksService } from 'src/app/core/api/stocks.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HoldingsService } from 'src/app/core/api/holdings.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-stock-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './stock-details.component.html',
  styleUrls: ['./stock-details.component.scss'],
})
export class StockDetailsComponent {
  stockDetails: StockDetails | null = null;
  loading: boolean = false;
  error: string = '';
  stockSymbol: string | null = null;
  quantity = 1;
  adding = false;
  addMessage = '';

  constructor(
    private route: ActivatedRoute,
    private stockService: StocksService,
    private holdingsService: HoldingsService,
    private auth: AuthService,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.loading = true;
    this.stockSymbol = this.route.snapshot.paramMap.get('symbol');

    if (this.stockSymbol) {
      this.stockService.getStockDetails(this.stockSymbol).subscribe({
        next: (res: StockDetails) => {
          this.stockDetails = res;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.log(err);
          this.error = 'Failed to grab details for stock';
        },
      });
    }
  }

  addHolding() {
    if (!this.stockDetails?.price) {
      this.addMessage = 'No price available right now.';
      return;
    }
    if (this.quantity <= 0) return;

    this.adding = true;
    this.addMessage = '';

    const body = {
      symbol: this.stockDetails.symbol,
      quantity: this.quantity,
      buy_price: Number(this.stockDetails.price.toFixed(2)),
    };

    this.holdingsService.addHolding(body).subscribe({
      next: () => {
        this.adding = false;
        this.addMessage = 'Added!';
      },
      error: () => {
        this.adding = false;
        this.addMessage = 'Failed to add holding.';
      },
    });
  }
  goBack(): void {
    this.location.back();
  }
}
