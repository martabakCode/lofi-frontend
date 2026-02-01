---
description: 
---

# Antigravity Angular Application - Complete Workflow

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Design System (HIG)](#design-system-hig)
7. [Best Practices](#best-practices)
8. [Environment Configuration](#environment-configuration)
9. [CI/CD Pipeline](#cicd-pipeline)

---

## 🎯 Project Overview

**Antigravity** adalah aplikasi Angular modern dengan:
- ✅ Clean Architecture
- ✅ Apple HIG Design System
- ✅ Cloudflare Storage Integration
- ✅ Firebase Cloud Messaging
- ✅ PWA Support
- ✅ SSR (Server-Side Rendering)
- ✅ TailwindCSS v4
- ✅ GSAP Animations

---

## 🏗️ Architecture

### Layer Architecture
```
┌─────────────────────────────────────┐
│   Presentation Layer (Components)   │
│   - Smart Components                │
│   - Presentational Components       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Application Layer (Services)    │
│   - Business Logic                  │
│   - State Management                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Infrastructure Layer (API/Data)   │
│   - Cloudflare Storage              │
│   - Firebase Messaging              │
│   - HTTP Interceptors               │
└─────────────────────────────────────┘
```

### Design Patterns
- **Reactive Programming**: RxJS operators untuk data flow
- **Dependency Injection**: Angular DI system
- **Repository Pattern**: Abstraksi data access
- **Facade Pattern**: Simplified API untuk complex subsystems
- **Observer Pattern**: Event-driven architecture
- **Singleton Pattern**: Shared services

---

## 🚀 Setup & Installation

### 1. Prerequisites
```bash
# Node.js version
node --version  # >= 20.x

# Install Angular CLI globally
npm install -g @angular/cli@21.0.2
```

### 2. Project Initialization
```bash
# Clone or create project
ng new antigravity --routing --style=css --ssr

# Navigate to project
cd antigravity

# Install dependencies
npm install
```

### 3. Environment Setup
```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

---

## 📁 Project Structure

```
antigravity/
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── permission.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── cloudflare-storage.service.ts
│   │   │   │   ├── firebase-messaging.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── logger.service.ts
│   │   │   │   └── analytics.service.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/                        # Reusable components, directives, pipes
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   │   ├── button.component.ts
│   │   │   │   │   ├── button.component.html
│   │   │   │   │   ├── button.component.css
│   │   │   │   │   └── button.component.spec.ts
│   │   │   │   ├── card/
│   │   │   │   ├── modal/
│   │   │   │   ├── loader/
│   │   │   │   ├── toast/
│   │   │   │   └── navigation/
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.directive.ts
│   │   │   │   ├── auto-focus.directive.ts
│   │   │   │   └── lazy-load.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── safe-html.pipe.ts
│   │   │   │   ├── truncate.pipe.ts
│   │   │   │   └── time-ago.pipe.ts
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── api-response.model.ts
│   │   │   │   └── notification.model.ts
│   │   │   ├── constants/
│   │   │   │   ├── app.constants.ts
│   │   │   │   └── api.constants.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── features/                      # Feature modules (lazy-loaded)
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── dashboard-routing.module.ts
│   │   │   │   └── dashboard.module.ts
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── admin/
│   │   │
│   │   ├── layout/                        # Layout components
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── sidebar/
│   │   │   └── main-layout/
│   │   │
│   │   ├── design-system/                 # HIG Design System
│   │   │   ├── tokens/
│   │   │   │   ├── colors.ts
│   │   │   │   ├── typography.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   └── animations.ts
│   │   │   ├── styles/
│   │   │   │   ├── _variables.css
│   │   │   │   ├── _mixins.css
│   │   │   │   └── _animations.css
│   │   │   └── README.md
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── i18n/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   │
│   ├── styles/
│   │   ├── main.css
│   │   ├── tailwind.css
│   │   └── hig-overrides.css
│   │
│   ├── index.html
│   ├── main.ts
│   ├── main.server.ts
│   └── styles.css
│
├── server.ts                              # Express server for SSR
├── .env.example
├── .env
├── .gitignore
├── angular.json
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── README.md
```

---

## 🔧 Development Workflow

### Phase 1: Setup & Configuration (Week 1)

#### Day 1-2: Project Foundation
```bash
# 1. Initialize project
ng new antigravity --routing --style=css --ssr

# 2. Install dependencies
npm install

# 3. Setup environment files
# Create .env files and configure
```

**Tasks:**
- ✅ Setup folder structure
- ✅ Configure TypeScript strict mode
- ✅ Setup ESLint & Prettier
- ✅ Configure Tailwind CSS v4
- ✅ Setup environment variables

#### Day 3-4: Core Infrastructure
**Tasks:**
- ✅ Create core services (Cloudflare, Firebase)
- ✅ Setup HTTP interceptors
- ✅ Create guards and error handling
- ✅ Configure routing structure
- ✅ Setup state management (if needed)

#### Day 5-7: Design System
**Tasks:**
- ✅ Implement HIG design tokens
- ✅ Create base components (Button, Card, Modal)
- ✅ Setup GSAP animation library
- ✅ Configure typography system
- ✅ Create color palette

### Phase 2: Feature Development (Week 2-4)

#### Week 2: Authentication & User Management
```typescript
// Example: Auth Service Implementation
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.checkAuthentication();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.cookieService.set('token', response.token, {
      secure: true,
      sameSite: 'Strict'
    });
    this.currentUserSubject.next(response.user);
  }
}
```

#### Week 3: Core Features
- Dashboard implementation
- Profile management
- Settings page
- Data visualization (Chart.js)

#### Week 4: Advanced Features
- Real-time notifications (Firebase)
- File upload/download (Cloudflare R2)
- Search & filtering
- Analytics integration

### Phase 3: Integration & Testing (Week 5)

#### Integration Tasks
- ✅ Cloudflare R2 storage integration
- ✅ Firebase Cloud Messaging setup
- ✅ Service Worker configuration
- ✅ PWA manifest setup
- ✅ SSR optimization

#### Testing Strategy
```bash
# Unit tests
npm run test

# E2E tests (if configured)
npm run e2e

# Coverage report
npm run test:coverage
```

### Phase 4: Optimization & Deployment (Week 6)

#### Performance Optimization
- ✅ Lazy loading modules
- ✅ Image optimization
- ✅ Bundle size reduction
- ✅ CDN configuration
- ✅ Caching strategy

#### Deployment
```bash
# Build for production
npm run build

# Build SSR
npm run build:ssr

# Serve SSR
npm run serve:ssr
```

---

## 🎨 Design System (HIG)

### Apple Human Interface Guidelines Implementation

#### 1. Color System
```typescript
// src/app/design-system/tokens/colors.ts
export const HIGColors = {
  // Primary Colors
  primary: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00'
  },
  
  // Grayscale
  gray: {
    1: '#8E8E93',
    2: '#AEAEB2',
    3: '#C7C7CC',
    4: '#D1D1D6',
    5: '#E5E5EA',
    6: '#F2F2F7'
  },
  
  // System Colors
  system: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
      tertiary: '#FFFFFF'
    },
    label: {
      primary: '#000000',
      secondary: 'rgba(60, 60, 67, 0.6)',
      tertiary: 'rgba(60, 60, 67, 0.3)',
      quaternary: 'rgba(60, 60, 67, 0.18)'
    }
  },
  
  // Dark Mode
  dark: {
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E'
    },
    label: {
      primary: '#FFFFFF',
      secondary: 'rgba(235, 235, 245, 0.6)',
      tertiary: 'rgba(235, 235, 245, 0.3)',
      quaternary: 'rgba(235, 235, 245, 0.18)'
    }
  }
};
```

#### 2. Typography
```typescript
// src/app/design-system/tokens/typography.ts
export const HIGTypography = {
  fontFamily: {
    system: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace'
  },
  
  sizes: {
    largeTitle: '34px',
    title1: '28px',
    title2: '22px',
    title3: '20px',
    headline: '17px',
    body: '17px',
    callout: '16px',
    subheadline: '15px',
    footnote: '13px',
    caption1: '12px',
    caption2: '11px'
  },
  
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    heavy: 800
  },
  
  lineHeights: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.7
  }
};
```

#### 3. Spacing System
```typescript
// src/app/design-system/tokens/spacing.ts
export const HIGSpacing = {
  xs: '4px',    // 0.25rem
  sm: '8px',    // 0.5rem
  md: '16px',   // 1rem
  lg: '24px',   // 1.5rem
  xl: '32px',   // 2rem
  '2xl': '48px', // 3rem
  '3xl': '64px'  // 4rem
};
```

#### 4. Animation Tokens
```typescript
// src/app/design-system/tokens/animations.ts
export const HIGAnimations = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms'
  },
  
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)'
  }
};
```

#### 5. Component Example: HIG Button
```typescript
// src/app/shared/components/button/button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disa