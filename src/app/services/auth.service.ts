import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import * as signalR from '@microsoft/signalr';
import { Router } from '@angular/router';
interface LoginResponse {
  token: string;
  username: string;
  tokenExpiration: Date;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7050/api/Auth';
  private hubConnection!: signalR.HubConnection;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private showAlertSubject = new BehaviorSubject<boolean>(false);
  showAlert$ = this.showAlertSubject.asObservable();
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;
  showConfirmDialog: boolean = false;
  private getAuthHeaders(): HttpHeaders {
    const token = this.currentUserValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.setupSignalRConnection();
  }

  private setupSignalRConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7050/authHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Retry pattern
      .build();

    this.hubConnection.on('ForceLogout', (email: string) => {
      console.log('Force logout received for:', email);
      if (email === localStorage.getItem('email')) {
        this.handleForcedLogout();
      }
    });

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        // Try to reconnect after 5 seconds
        setTimeout(() => this.setupSignalRConnection(), 5000);
      });
  }



  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // ... other imports and code ...
  login(credentials: { email: string; password: string }, force: boolean = false): Observable<LoginResponse> {
    const url = `${this.apiUrl}/login${force ? '?force=true' : ''}`;

    console.log('Login attempt:', { url, force, credentials });

    return this.http.post<LoginResponse>(
      url,
      credentials,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', credentials.email);
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response as any);

          // Reconnect SignalR with new token
          this.hubConnection.stop().then(() => {
            this.setupSignalRConnection();
          });
        }
      }),
      catchError(error => {
        console.log('Server error:', error.status);
        if (error.status === 409) {
          // Show force login dialog
          console.log('Force login dialog shown', error.status);
          this.showConfirmDialog = true;
          this.error = error.error.message;
        } else {
          this.showConfirmDialog = false;
          this.error = error.error?.message || 'Login failed';
        }
        throw error;
      })
    );
  }
  private handleForcedLogout() {
    localStorage.clear();
    this.currentUserSubject.next(null);
    alert('You have been logged out because someone else logged into your account.');
    this.router.navigate(['/login']);
  }

  register(username: string, email: string, password: string) {
    return this.http.post(
      `${this.apiUrl}/register`,
      { username, email, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  logout() {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      map(() => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        this.currentUserSubject.next(null);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    });
  }
}