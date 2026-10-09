import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { aErrorDeApi } from './error-de-api';

/**
 * Convierte todo fallo HTTP en un {@link ErrorDeApi} antes de que llegue a quien pidió.
 *
 * Se hace en un interceptor y no en cada servicio porque así es imposible saltárselo: una pantalla
 * nueva no puede olvidarse de traducir el error, porque nunca ve el `HttpErrorResponse` original.
 */
export const interceptorDeErrores: HttpInterceptorFn = (peticion, siguiente) =>
  siguiente(peticion).pipe(
    catchError((fallo: HttpErrorResponse) => throwError(() => aErrorDeApi(fallo))),
  );
