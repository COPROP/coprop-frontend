import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toApiError } from './api-error';

/**
 * Convierte todo fallo HTTP en un {@link ErrorDeApi} antes de que llegue a quien pidió.
 *
 * Se hace en un interceptor y no en cada servicio porque así es imposible saltárselo: una pantalla
 * nueva no puede olvidarse de traducir el error, porque nunca ve el `HttpErrorResponse` original.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((failure: HttpErrorResponse) => throwError(() => toApiError(failure))),
  );
