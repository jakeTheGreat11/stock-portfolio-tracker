import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export type AuthUser = {
  id: number;
  username: string;
  email: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
};
export type RegisterResponse = {
  user: AuthUser;
  refresh: string;
  access: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ACCESS_KEY = 'access';
  private readonly REFRESH_KEY = 'refresh';
  isAdmin: boolean = false;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/login/', {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.access, response.refresh);
        }),
      );
  }

  register(
    username: string,
    email: string,
    password: string,
  ): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>('/api/auth/register/', {
        username,
        email,
        password,
      })
      .pipe(
        tap((response) => this.setToken(response.access, response.refresh)),
      );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.isAdmin = false;
  }

  refreshAccessToken(): Observable<{ access: string }> {
    const refresh = this.getRefreshToken();
    return this.http
      .post<{ access: string }>('/api/auth/refresh/', { refresh })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.ACCESS_KEY, res.access);
        }),
      );
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  private setToken(access: string, refresh: string): void {
    localStorage.setItem(this.ACCESS_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
  }
}
