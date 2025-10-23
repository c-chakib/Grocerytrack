// Language Service - Manages application language switching and translation loading
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'fr' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations = {
    en: {
      "app": {
        "title": "GroceryTrack",
        "welcome": "Welcome to GroceryTrack",
        "description": "Track your groceries and never run out of essentials again!"
      },
      "auth": {
        "login": "Login",
        "register": "Register",
        "logout": "Logout",
        "email": "Email",
        "password": "Password",
        "name": "Name",
        "confirmPassword": "Confirm Password",
        "loginTitle": "Sign In",
        "registerTitle": "Create Account",
        "loginButton": "Sign In",
        "registerButton": "Create Account",
        "noAccount": "Don't have an account?",
        "hasAccount": "Already have an account?",
        "loginSuccess": "Login successful!",
        "registerSuccess": "Registration successful!",
        "loginError": "Login failed",
        "registerError": "Registration failed"
      },
      "dashboard": {
        "title": "Dashboard",
        "welcome": "Welcome back",
        "addGrocery": "Add Grocery",
        "search": "Search groceries...",
        "filterByCategory": "Filter by category",
        "sortBy": "Sort by",
        "clearFilters": "Clear Filters",
        "totalGroceries": "Total Groceries",
        "expiringSoon": "Expiring Soon",
        "expired": "Expired",
        "fresh": "Fresh",
        "name": "Name",
        "category": "Category",
        "expirationDate": "Expiration Date",
        "quantity": "Quantity",
        "location": "Location",
        "status": "Status",
        "actions": "Actions",
        "edit": "Edit",
        "delete": "Delete",
        "cancel": "Cancel",
        "save": "Save",
        "confirmDelete": "Are you sure you want to delete this grocery?",
        "deleteConfirmTitle": "Confirm Delete",
        "addSuccess": "Grocery added successfully!",
        "updateSuccess": "Grocery updated successfully!",
        "deleteSuccess": "Grocery deleted successfully!",
        "addError": "Failed to add grocery",
        "updateError": "Failed to update grocery",
        "deleteError": "Failed to delete grocery",
        "requiredField": "This field is required",
        "invalidEmail": "Please enter a valid email",
        "minLength": "Minimum length is {{min}} characters"
      },
      "categories": {
        "dairy": "Dairy",
        "vegetables": "Vegetables",
        "fruits": "Fruits",
        "meat": "Meat",
        "pantry": "Pantry",
        "frozen": "Frozen",
        "other": "Other"
      },
      "units": {
        "pieces": "pieces",
        "kg": "kg",
        "g": "g",
        "l": "L",
        "ml": "ml",
        "packs": "packs"
      },
      "locations": {
        "fridge": "Fridge",
        "freezer": "Freezer",
        "pantry": "Pantry",
        "counter": "Counter"
      },
      "status": {
        "fresh": "Fresh",
        "expiringSoon": "Expiring Soon",
        "expired": "Expired"
      },
      "language": {
        "english": "English",
        "french": "Français",
        "arabic": "العربية"
      }
    },
    fr: {
      "app": {
        "title": "GroceryTrack",
        "welcome": "Bienvenue sur GroceryTrack",
        "description": "Suivez vos courses et ne manquez plus jamais d'essentiels !"
      },
      "auth": {
        "login": "Connexion",
        "register": "Inscription",
        "logout": "Déconnexion",
        "email": "Email",
        "password": "Mot de passe",
        "name": "Nom",
        "confirmPassword": "Confirmer le mot de passe",
        "loginTitle": "Se connecter",
        "registerTitle": "Créer un compte",
        "loginButton": "Se connecter",
        "registerButton": "Créer un compte",
        "noAccount": "Pas de compte ?",
        "hasAccount": "Déjà un compte ?",
        "loginSuccess": "Connexion réussie !",
        "registerSuccess": "Inscription réussie !",
        "loginError": "Échec de la connexion",
        "registerError": "Échec de l'inscription"
      },
      "dashboard": {
        "title": "Tableau de bord",
        "welcome": "Bienvenue",
        "addGrocery": "Ajouter un produit",
        "search": "Rechercher des produits...",
        "filterByCategory": "Filtrer par catégorie",
        "sortBy": "Trier par",
        "clearFilters": "Effacer les filtres",
        "totalGroceries": "Total des produits",
        "expiringSoon": "Expire bientôt",
        "expired": "Expiré",
        "fresh": "Frais",
        "name": "Nom",
        "category": "Catégorie",
        "expirationDate": "Date d'expiration",
        "quantity": "Quantité",
        "location": "Emplacement",
        "status": "Statut",
        "actions": "Actions",
        "edit": "Modifier",
        "delete": "Supprimer",
        "cancel": "Annuler",
        "save": "Enregistrer",
        "confirmDelete": "Êtes-vous sûr de vouloir supprimer ce produit ?",
        "deleteConfirmTitle": "Confirmer la suppression",
        "addSuccess": "Produit ajouté avec succès !",
        "updateSuccess": "Produit modifié avec succès !",
        "deleteSuccess": "Produit supprimé avec succès !",
        "addError": "Échec de l'ajout du produit",
        "updateError": "Échec de la modification du produit",
        "deleteError": "Échec de la suppression du produit",
        "requiredField": "Ce champ est requis",
        "invalidEmail": "Veuillez saisir un email valide",
        "minLength": "La longueur minimale est de {{min}} caractères"
      },
      "categories": {
        "dairy": "Produits laitiers",
        "vegetables": "Légumes",
        "fruits": "Fruits",
        "meat": "Viande",
        "pantry": "Garde-manger",
        "frozen": "Surgelés",
        "other": "Autre"
      },
      "units": {
        "pieces": "pièces",
        "kg": "kg",
        "g": "g",
        "l": "L",
        "ml": "ml",
        "packs": "paquets"
      },
      "locations": {
        "fridge": "Réfrigérateur",
        "freezer": "Congélateur",
        "pantry": "Garde-manger",
        "counter": "Comptoir"
      },
      "status": {
        "fresh": "Frais",
        "expiringSoon": "Expire bientôt",
        "expired": "Expiré"
      },
      "language": {
        "english": "English",
        "french": "Français",
        "arabic": "العربية"
      }
    },
    ar: {
      "app": {
        "title": "GroceryTrack",
        "welcome": "مرحباً بك في GroceryTrack",
        "description": "تتبع مشترياتك ولا تفوت الأساسيات مرة أخرى!"
      },
      "auth": {
        "login": "تسجيل الدخول",
        "register": "التسجيل",
        "logout": "تسجيل الخروج",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "name": "الاسم",
        "confirmPassword": "تأكيد كلمة المرور",
        "loginTitle": "تسجيل الدخول",
        "registerTitle": "إنشاء حساب",
        "loginButton": "تسجيل الدخول",
        "registerButton": "إنشاء حساب",
        "noAccount": "ليس لديك حساب؟",
        "hasAccount": "لديك حساب بالفعل؟",
        "loginSuccess": "تم تسجيل الدخول بنجاح!",
        "registerSuccess": "تم التسجيل بنجاح!",
        "loginError": "فشل في تسجيل الدخول",
        "registerError": "فشل في التسجيل"
      },
      "dashboard": {
        "title": "لوحة التحكم",
        "welcome": "مرحباً بعودتك",
        "addGrocery": "إضافة منتج",
        "search": "البحث في المنتجات...",
        "filterByCategory": "تصفية حسب الفئة",
        "sortBy": "ترتيب حسب",
        "clearFilters": "مسح المرشحات",
        "totalGroceries": "إجمالي المنتجات",
        "expiringSoon": "ينتهي قريباً",
        "expired": "منتهي الصلاحية",
        "fresh": "طازج",
        "name": "الاسم",
        "category": "الفئة",
        "expirationDate": "تاريخ الانتهاء",
        "quantity": "الكمية",
        "location": "الموقع",
        "status": "الحالة",
        "actions": "الإجراءات",
        "edit": "تعديل",
        "delete": "حذف",
        "cancel": "إلغاء",
        "save": "حفظ",
        "confirmDelete": "هل أنت متأكد من حذف هذا المنتج؟",
        "deleteConfirmTitle": "تأكيد الحذف",
        "addSuccess": "تم إضافة المنتج بنجاح!",
        "updateSuccess": "تم تحديث المنتج بنجاح!",
        "deleteSuccess": "تم حذف المنتج بنجاح!",
        "addError": "فشل في إضافة المنتج",
        "updateError": "فشل في تحديث المنتج",
        "deleteError": "فشل في حذف المنتج",
        "requiredField": "هذا الحقل مطلوب",
        "invalidEmail": "يرجى إدخال بريد إلكتروني صحيح",
        "minLength": "الحد الأدنى للطول هو {{min}} حرفاً"
      },
      "categories": {
        "dairy": "منتجات الألبان",
        "vegetables": "الخضروات",
        "fruits": "الفواكه",
        "meat": "اللحوم",
        "pantry": "المخزن",
        "frozen": "المجمدات",
        "other": "أخرى"
      },
      "units": {
        "pieces": "قطعة",
        "kg": "كغ",
        "g": "غ",
        "l": "لتر",
        "ml": "مل",
        "packs": "علبة"
      },
      "locations": {
        "fridge": "الثلاجة",
        "freezer": "الفريزر",
        "pantry": "المخزن",
        "counter": "الطاولة"
      },
      "status": {
        "fresh": "طازج",
        "expiringSoon": "ينتهي قريباً",
        "expired": "منتهي الصلاحية"
      },
      "language": {
        "english": "English",
        "french": "Français",
        "arabic": "العربية"
      }
    }
  };

  private availableLanguages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  constructor(private translate: TranslateService) {
    this.initializeTranslations();
    this.initializeLanguage();
  }

  private initializeTranslations(): void {
    // Set translations for each language
    Object.keys(this.translations).forEach(lang => {
      this.translate.setTranslation(lang, this.translations[lang as Language]);
    });
  }

  private initializeLanguage(): void {
    // Get saved language from localStorage or use browser language
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLang = this.translate.getBrowserLang() as Language;
    const defaultLang = this.availableLanguages.find(lang => lang.code === browserLang) ? browserLang : 'en';

    const initialLanguage = savedLanguage || defaultLang;
    this.setLanguage(initialLanguage);
  }

  setLanguage(language: Language): void {
    if (!this.availableLanguages.find(lang => lang.code === language)) {
      console.warn(`Language '${language}' is not available`);
      return;
    }

    this.translate.use(language);
    localStorage.setItem('language', language);
    this.currentLanguageSubject.next(language);

    // Set document direction for RTL languages
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    console.log(`🌐 Language switched to: ${language}`);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  getAvailableLanguages() {
    return this.availableLanguages;
  }

  getLanguageName(code: Language): string {
    const lang = this.availableLanguages.find(l => l.code === code);
    return lang ? lang.name : code;
  }

  getLanguageFlag(code: Language): string {
    const lang = this.availableLanguages.find(l => l.code === code);
    return lang ? lang.flag : '';
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }
}