import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { interceptorDeErrores } from './nucleo/api/interceptor-de-errores';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // El interceptor va aqui, una sola vez: asi ninguna pantalla puede olvidarse de traducir un
    // error del backend, porque nunca ve el HttpErrorResponse original.
    provideHttpClient(withFetch(), withInterceptors([interceptorDeErrores])),
  ],
};
