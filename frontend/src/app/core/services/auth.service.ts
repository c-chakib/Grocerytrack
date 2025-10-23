// Authentication Service - Login & Register
import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment'; 

// Interface for API response
interface AuthResponse {
  statusCode: number;
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // ===== SIGNALS (State Management) =====
  currentUser = signal<any>(null);
  isAuthenticated = signal(false);
  isLoading = signal(false);
  error = signal('');

  // Computed signal for user name
  userName = computed(() => this.currentUser()?.name || 'Guest');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  // ===== INITIALIZE AUTH ON APP START =====
  private initializeAuth(): void {
    const token = localStorage.getItem('token');

    if (token && typeof token === 'string' && token.trim().length > 0) {
      this.isAuthenticated.set(true);
    }
  }

  // ===== REGISTER NEW USER =====
  register(
    email: string,
    password: string,
    name: string
  ): Observable<AuthResponse> {
    console.log('📝 Registering user:', email);
    this.isLoading.set(true);
    this.error.set('');

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        email,
        password,
        name
      })
      .pipe(
        tap((response) => {
          console.log('✅ Registration successful');
          this.handleAuthSuccess(response);
        }),
        catchError((error) => {
          console.error('❌ Registration error:', error);
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
  }

  // ===== LOGIN USER =====
  login(email: string, password: string): Observable<AuthResponse> {
    console.log('🔓 Logging in user:', email);
    this.isLoading.set(true);
    this.error.set('');

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, {
        email,
        password
      })
      .pipe(
        tap((response) => {
          console.log('✅ Login successful');
          this.handleAuthSuccess(response);
        }),
        catchError((error) => {
          console.error('❌ Login error:', error);
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
  }

  // ===== GET CURRENT USER =====
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap((response: any) => {
        this.currentUser.set(response.data.user);
        this.isAuthenticated.set(true);
      }),
      catchError((error) => {
        console.error('❌ Error fetching user:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // ===== HANDLE SUCCESSFUL AUTH =====
  private handleAuthSuccess(response: AuthResponse): void {
    // ✅ CRITICAL: Store token in localStorage
    localStorage.setItem('token', response.data.token);

    // ✅ Update signals
    this.currentUser.set(response.data.user);
    this.isAuthenticated.set(true);
    this.isLoading.set(false);
    this.error.set('');

    // ✅ Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }

  // ===== HANDLE AUTH ERROR =====
  private handleAuthError(error: any): void {
    this.isLoading.set(false);

    const errorMessage =
      error.error?.error || error.error?.message || 'Authentication failed';

    console.error('❌ Auth error message:', errorMessage);
    this.error.set(errorMessage);
  }

  // ===== LOGOUT USER =====
  logout(): void {
    console.log('🚪 Logging out user');

    localStorage.removeItem('token');

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isLoading.set(false);
    this.error.set('');

    this.router.navigate(['/login']);
  }

  // ===== CHECK IF USER IS LOGGED IN =====
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && this.isAuthenticated();
  }
}