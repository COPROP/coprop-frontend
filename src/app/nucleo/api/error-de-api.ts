import { HttpErrorResponse } from '@angular/common/http';
import { CodigoDeError, ErrorDeCampo, Problema } from './problema';

/**
 * Lo que recibe cualquier parte de la aplicación cuando una petición falla.
 *
 * Existe para que nadie tenga que mirar un `HttpErrorResponse` ni adivinar si el cuerpo trae
 * `problem+json`: después del interceptor, todo fallo es uno de estos y **siempre tiene `codigo`**.
 */
export class ErrorDeApi extends Error {
  constructor(
    readonly codigo: CodigoDeError,
    readonly estado: number,
    override readonly message: string,
    readonly traceId?: string,
    readonly errores: readonly ErrorDeCampo[] = [],
  ) {
    super(message);
    this.name = 'ErrorDeApi';
  }

  /** El mensaje que el backend dejó para ese campo, si lo rechazó. */
  mensajeDe(campo: string): string | undefined {
    return this.errores.find((error) => error.campo === campo)?.mensaje;
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
export function aErrorDeApi(fallo: HttpErrorResponse): ErrorDeApi {
  if (fallo.status === 0) {
    return new ErrorDeApi(
      'SIN_RESPUESTA',
      0,
      'No se pudo contactar con el servidor. Revisa tu conexión.',
    );
  }

  const problema = fallo.error as Partial<Problema> | null;
  if (problema?.codigo) {
    return new ErrorDeApi(
      problema.codigo,
      fallo.status,
      problema.detail ?? problema.title ?? 'La operación falló.',
      problema.traceId,
      problema.errores ?? [],
    );
  }

  return new ErrorDeApi(
    'INTERNO',
    fallo.status,
    'El servidor respondió de una forma que no esperábamos.',
  );
}
