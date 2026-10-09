/**
 * Configuracion de desarrollo.
 *
 * `baseApi` tambien va vacio: el dev server de Angular reenvia `/api` y `/actuator` al backend
 * del 8080 (ver proxy.conf.json), asi que para el navegador todo es el mismo origen y CORS no
 * entra en juego.
 */
export const environment = {
  produccion: false,
  baseApi: '',
};
