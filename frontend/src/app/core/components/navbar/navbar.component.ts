import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    LanguageSwitcherComponent, 
    TranslateModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    // Close menu on route change
    this.router.events.subscribe(() => {
      this.closeMenu();
    });
  }

  get userName(): string {
    return this.auth.userName();
  }

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    
    // Prevent body scroll when menu is open
    if (this.menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }
}
