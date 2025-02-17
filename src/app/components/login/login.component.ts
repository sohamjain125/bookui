import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;
  showConfirmDialog: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

 
  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }
  
    this.loading = true;
    this.error = '';
    const credentials = { email: this.email, password: this.password };
  
    this.authService.login(credentials, false).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.message === "User already logged in on another device.") {
          this.showConfirmDialog = true;
          this.error = response.message;
        } else {
          this.router.navigate(['/books']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
  
  
  
confirmForceLogin() {
  this.loading = true;
  const credentials = { email: this.email, password: this.password };
  
  this.authService.login(credentials, true).subscribe({
    next: (response) => {
      this.loading = false;
      this.showConfirmDialog = false;
      this.router.navigate(['/books']);
    },
    error: (err) => {
      this.loading = false;
      this.error = err.error?.message || 'Force login failed';
    }
  });
}


  cancelForceLogin() {
    this.showConfirmDialog = false;
    this.error = '';
  }
}