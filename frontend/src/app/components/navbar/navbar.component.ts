import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  isAuthed(): boolean {
    return this.auth.isLoggedIn();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
