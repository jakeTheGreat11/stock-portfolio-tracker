import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type Quote = {
  price: number | null;
  source: string;
  error: string | null;
};

export type HoldingRow = {
  symbol: string;
  name: string;
  quantity: string;
  avg_buy_price: string;
  quote: Quote;

  cost_basis: string;
  market_value: string | null;
  unrealized_pl: string | null;
  unrealized_pl_percent: string | null;
};

export type HoldingsSummary = {
  total_cost_basis: string;
  total_market_value: string;
  total_unrealized_pl: string;
  total_unrealized_pl_percent: string | null;
  holdings: HoldingRow[];
};

@Injectable({
  providedIn: 'root',
})
export class HoldingsService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<HoldingsSummary> {
    return this.http.get<HoldingsSummary>('/api/holdings/summary/');
  }

  addHolding(body: { symbol: string; quantity: number; buy_price: number }) {
    return this.http.post('/api/holdings/add/', body);
  }

  deleteHolding(symbol: string) {
    const santizedSymbol = symbol.trim().toUpperCase();
    return this.http.delete(`/api/holdings/delete/${santizedSymbol}/`);
  }

  updateHolding(symbol: string, quantity: number) {
    const santizedSymbol = symbol.trim().toUpperCase();
    return this.http.patch(`/api/holdings/update/${santizedSymbol}/`, {
      quantity,
    });
  }
}
