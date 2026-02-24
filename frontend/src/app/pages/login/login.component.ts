import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';

  loading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit(form: any) {
    this.error = '';
    this.loading = true;

    if (form.invalid) {
      return;
    }
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/holdings']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Login failed. Check your username/password';
      },
    });
  }
}
