import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.register(this.username, this.email, this.password)
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: err => {
          this.error = err.error.message || 'An error occurred';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}