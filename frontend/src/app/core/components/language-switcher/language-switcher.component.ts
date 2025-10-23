import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcherComponent implements OnInit {
  currentLanguage: Language = 'en';
  availableLanguages: { code: Language; name: string; flag: string }[] = [];

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
    this.availableLanguages = this.languageService.getAvailableLanguages();
  }

  switchLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }

  getLanguageDisplayName(code: Language): string {
    return this.languageService.getLanguageName(code);
  }

  getLanguageFlag(code: Language): string {
    return this.languageService.getLanguageFlag(code);
  }
}
