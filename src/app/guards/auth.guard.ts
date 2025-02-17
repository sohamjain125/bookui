import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.token) {
      return true; // Allow access if logged in
    }
    
    // Not logged in, redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}