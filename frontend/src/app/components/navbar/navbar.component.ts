import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from 'src/app/core/api/admin.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  isAdmin: boolean = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    if (!this.isAuthed()) {
      this.isAdmin = false;
      return;
    }
    this.adminService.checkIfAdmin().subscribe({
      next: (res) => {
        this.auth.isAdmin = res.is_admin;
      },
      error: () => {
        this.auth.isAdmin = false;
      },
    });
  }

  isAuthed(): boolean {
    return this.auth.isLoggedIn();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
