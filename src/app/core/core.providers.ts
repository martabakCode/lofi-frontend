import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

export const provideCore = (): (Provider | EnvironmentProviders)[] => {
  return [
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor])
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark'
        }
      },
      ripple: true
    })
  ];
};
