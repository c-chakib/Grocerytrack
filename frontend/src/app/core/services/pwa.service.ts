import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PWAService {
  installPromptEvent = signal<any>(null);
  canInstall = signal(false);
  isStandalone = signal(false);

  constructor() {
    this.checkIfStandalone();
    this.listenForInstallPrompt();
  }

  private checkIfStandalone() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    this.isStandalone.set(isStandalone);
  }

  private listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPromptEvent.set(e);
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.canInstall.set(false);
      this.isStandalone.set(true);
      console.log('✅ PWA installed successfully!');
    });
  }

  async promptInstall() {
    const promptEvent = this.installPromptEvent();
    if (!promptEvent) return false;

    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    
    if (result.outcome === 'accepted') {
      console.log('✅ User accepted install');
      this.canInstall.set(false);
      return true;
    } else {
      console.log('❌ User dismissed install');
      return false;
    }
  }
}