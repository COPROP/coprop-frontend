/**
 * El cuerpo de error que devuelve el backend: RFC 9457, `application/problem+json`.
 *
 * El contrato está documentado en `ARCHITECTURE.md` de `coprop-backend`, sección «Contrato de la
 * API». Lo que importa aquí: **se ramifica por `codigo`, nunca por `title` ni por `detail`**, que
 * son texto para una persona y pueden cambiar sin aviso.
 */
export interface Problema {
  /** Identifica el tipo de error. No se resuelve por red. */
  readonly type: string;
  /** Título legible. Para mostrar, no para decidir. */
  readonly title: string;
  readonly status: number;
  /** Detalle legible. Para mostrar, no para decidir. */
  readonly detail?: string;
  /** Ruta que falló. */
  readonly instance?: string;
  /** La parte estable del contrato. */
  readonly codigo: CodigoDeError;
  /** El mismo identificador que llevan los logs del backend para esta petición. */
  readonly traceId?: string;
  /** Solo en errores de validación: un objeto por campo rechazado. */
  readonly errores?: readonly ErrorDeCampo[];
}

export interface ErrorDeCampo {
  readonly campo: string;
  readonly codigo: string;
  readonly mensaje: string;
}

/**
 * Los códigos que el backend puede devolver, más uno que nace aquí.
 *
 * `SIN_RESPUESTA` no existe en el backend: lo pone el interceptor cuando la petición ni siquiera
 * llegó a contestar —el servidor está caído, no hay red, el proxy no responde—. Así el resto de la
 * aplicación siempre tiene un código con el que ramificar, en vez de tener que distinguir entre un
 * error del backend y un hueco.
 */
export type CodigoDeError =
  | 'VALIDACION'
  | 'NO_ENCONTRADO'
  | 'CONFLICTO'
  | 'REGLA_DE_NEGOCIO'
  | 'NO_AUTENTICADO'
  | 'SIN_PERMISO'
  | 'INTERNO'
  | 'SIN_RESPUESTA';
