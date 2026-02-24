import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    router.navigate(['/holdings']);
    return false;
  }
  return true;
};
