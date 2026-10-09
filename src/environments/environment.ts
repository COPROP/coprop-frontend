/**
 * Configuracion de produccion. Es la que se compila por defecto; la de desarrollo la sustituye
 * `fileReplacements` de angular.json.
 */
export const environment = {
  produccion: true,
  /**
   * Prefijo de las llamadas al backend.
   *
   * Vacio a proposito: en produccion el frontend se sirve tras el mismo dominio que la API, asi
   * que `/api/v1/...` ya apunta donde debe. Si algun dia viven en dominios distintos, aqui entra
   * el absoluto y hay que resolver CORS en el backend.
   */
  baseApi: '',
};
