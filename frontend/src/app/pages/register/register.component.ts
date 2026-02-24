import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  error: string = '';

  loading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit(form: any) {
    console.log('button clicked');
    this.error = '';
    this.loading = true;

    if (form.invalid) {
      console.log('form is invalid');
      return;
    }

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        console.log('in next');
        this.loading = false;
        this.router.navigate(['/holdings']);
      },
      error: (err) => {
        console.log('in error');
        console.log('STATUS', err.status); // should be 400
        console.log('BODY', err.error);
        this.loading = false;
        this.error = 'Register failed';
      },
    });
  }
}
