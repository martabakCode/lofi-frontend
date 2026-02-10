import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { authInterceptor } from './interceptors/auth.interceptor';
import { proxyInterceptor } from './interceptors/proxy.interceptor';

import { errorInterceptor } from './interceptors/error.interceptor';
import { CookieService } from 'ngx-cookie-service';

export const provideCore = (): (Provider | EnvironmentProviders)[] => {
  return [
    CookieService,
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, proxyInterceptor, errorInterceptor])
    ),

  ];
};
