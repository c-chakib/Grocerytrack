import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  isConnected = signal(false);

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.apiUrl.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      this.isConnected.set(false);
    });
  }

  on<T>(event: string): Observable<T> {
    return new Observable(observer => {
      if (!this.socket) return;

      const handler = (data: any) => {
        observer.next(data.payload);
      };

      this.socket.on(event, handler);

      // Return teardown function to remove listener when unsubscribed
      return () => {
        if (this.socket) {
          this.socket.off(event, handler);
        }
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.set(false);
    }
  }
}