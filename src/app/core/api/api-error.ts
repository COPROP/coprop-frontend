import { HttpErrorResponse } from '@angular/common/http';
import { ErrorCode, ApiFieldError, Problem } from './problem';

/**
 * Lo que recibe cualquier parte de la aplicación cuando una petición falla.
 *
 * Existe para que nadie tenga que mirar un `HttpErrorResponse` ni adivinar si el cuerpo trae
 * `problem+json`: después del interceptor, todo fallo es uno de estos y **siempre tiene `codigo`**.
 */
export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly status: number,
    override readonly message: string,
    readonly traceId?: string,
    readonly errors: readonly ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** El mensaje que el backend dejó para ese campo, si lo rechazó. */
  messageOf(field: string): string | undefined {
    return this.errors.find((error) => error.field === field)?.message;
  }
}

/**
 * Traduce lo que sea que haya fallado a un {@link ErrorDeApi}.
 *
 * Tres casos, y el tercero es el que suele olvidarse: el backend contestó con `problem+json`; el
 * backend contestó otra cosa (un 502 del proxy, un HTML de error); o no contestó nada, porque está
 * caído o no hay red. En los tres hay que devolver un `codigo`, o cada pantalla acabaría
 * inventándose su propio manejo.
 */
export function toApiError(failure: HttpErrorResponse): ApiError {
  if (failure.status === 0) {
    return new ApiError(
      'NO_RESPONSE',
      0,
      'No se pudo contactar con el servidor. Revisa tu conexión.',
    );
  }

  const problem = failure.error as Partial<Problem> | null;
  if (problem?.code) {
    return new ApiError(
      problem.code,
      failure.status,
      problem.detail ?? problem.title ?? 'La operación falló.',
      problem.traceId,
      problem.errors ?? [],
    );
  }

  return new ApiError(
    'INTERNAL',
    failure.status,
    'El servidor respondió de una forma que no esperábamos.',
  );
}
