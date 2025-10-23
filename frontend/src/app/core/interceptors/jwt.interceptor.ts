// JWT Interceptor - Auto-attach token to every request (Functional approach for Angular 17+)
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  // If token exists and is a non-empty string, attach it to request header
  if (token && typeof token === 'string' && token.trim().length > 0) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token.trim()}`
      }
    });
    return next(authReq);
  } else {
    return next(req);
  }
};