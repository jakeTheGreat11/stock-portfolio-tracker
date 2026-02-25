import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type AdminStockTotals = {
  symbol: string;
  total_quantity: string;
  total_cost_basis: string;
  number_of_holders: number;
};

export type AdminOverview = {
  total_quantity: string;
  total_cost_basis: string;
  total_positions: number;
  active_investors: number;
  actively_owned_stocks: number;
  total_registered_users: number;
};

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getOverview(): Observable<AdminOverview> {
    return this.http.get<AdminOverview>('/api/admin/overview/');
  }
  getStockTotals(symbol: string): Observable<AdminStockTotals> {
    return this.http.get<AdminStockTotals>(
      `/api/admin/stocks/${symbol}/totals/`,
    );
  }

  checkIfAdmin(): Observable<{ is_admin: boolean }> {
    return this.http.get<{ is_admin: boolean }>('/api/auth/is-admin/');
  }
}
