import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const isAuthEndpoint =
      request.url.includes('/api/auth/login/') ||
      request.url.includes('/api/auth/register/') ||
      request.url.includes('/api/auth/refresh/');

    if (isAuthEndpoint) {
      return next.handle(request);
    }

    const token = this.auth.getAccessToken();

    // we attache access token
    const access = this.auth.getAccessToken();
    const reqWithToken = access ? this.addToken(request, access) : request;

    // we try to refresh the the access token with refresh token when we get 401
    return next.handle(reqWithToken).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) {
          return throwError(() => error);
        }

        //checks if there is refresh token in local storage
        const refresh = this.auth.getRefreshToken();
        if (!refresh) {
          this.forceLogout();
          return throwError(() => error);
        }

        // retrying the request with refrsh token
        return this.auth.refreshAccessToken().pipe(
          switchMap((res) => {
            const retryReq = this.addToken(request, res.access);
            return next.handle(retryReq);
          }),
          catchError((refreshError) => {
            this.forceLogout();
            return throwError(() => refreshError);
          }),
        );
      }),
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  private forceLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
