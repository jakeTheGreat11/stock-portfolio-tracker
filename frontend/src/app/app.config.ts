import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // we use interceptor from di because our interceptor is class based :(
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
