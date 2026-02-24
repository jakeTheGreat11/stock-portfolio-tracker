import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StockSearchItem {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface StockSearchResponse {
  count: number;
  results: StockSearchItem[];
}

export interface StockQuote {
  price: number | null;
}

export interface StockDetails {
  symbol: string;
  name: string | null;
  exchange: string | null;
  country: string | null;
  currency: string | null;
  description: string | null;
  industry: string | null;
  logo: string | null;
  website: string | null;
  ipo: string | null;
  marketCapitalization: number | null;
  shareOutstanding: number | null;
  quote: StockQuote;
  quote_error: string | null;
  quote_source: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class StocksService {
  constructor(private http: HttpClient) {}

  searchStocks(q: string): Observable<StockSearchResponse> {
    const params = new HttpParams().set('q', q.trim());
    return this.http.get<StockSearchResponse>('/api/stocks/search', { params });
  }

  getStockDetails(symbol: string): Observable<StockDetails> {
    return this.http.get<StockDetails>(`/api/stocks/${symbol}/details`);
  }
}
