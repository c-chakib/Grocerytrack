// JWT Interceptor - Auto-attach token to every request (Functional approach for Angular 17+)
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  console.log('🔐 JWT Interceptor - Token found:', !!token);

  // If token exists, attach it to request header
  if (token) {
    console.log('✅ Attaching token to request:', req.url);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn('⚠️ No token found for request:', req.url);
  }

  // Continue with request
  return next(req);
};