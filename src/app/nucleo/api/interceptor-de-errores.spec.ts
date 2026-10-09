import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { ErrorDeApi } from './error-de-api';
import { interceptorDeErrores } from './interceptor-de-errores';

describe('interceptorDeErrores', () => {
  let http: HttpClient;
  let servidor: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptorDeErrores])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    servidor = TestBed.inject(HttpTestingController);
  });

  afterEach(() => servidor.verify());

  /**
   * Se suscribe y devuelve una promesa con el fallo. Hay que llamarla antes de responder en el
   * servidor de mentira: si nadie esta suscrito, el flush no tiene a quien entregar.
   */
  function capturarError<T>(fuente: Observable<T>): Promise<ErrorDeApi> {
    return new Promise((resolver, rechazar) => {
      fuente.subscribe({
        next: () => rechazar(new Error('se esperaba un fallo y la peticion salio bien')),
        error: (fallo: ErrorDeApi) => resolver(fallo),
      });
    });
  }

  it('traduce un problem+json conservando codigo, traceId y los campos rechazados', async () => {
    const pendiente = capturarError(http.get('/api/v1/unidades'));

    servidor.expectOne('/api/v1/unidades').flush(
      {
        type: 'https://coprop.bo/errores/validacion',
        title: 'La solicitud no es valida',
        status: 422,
        detail: 'Revisa los campos indicados.',
        codigo: 'VALIDACION',
        traceId: 'abc-123',
        errores: [{ campo: 'numero', codigo: 'NotBlank', mensaje: 'El numero es obligatorio.' }],
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );

    const fallo = await pendiente;
    expect(fallo).toBeInstanceOf(ErrorDeApi);
    expect(fallo.codigo).toBe('VALIDACION');
    expect(fallo.estado).toBe(422);
    expect(fallo.traceId).toBe('abc-123');
    expect(fallo.mensajeDe('numero')).toBe('El numero es obligatorio.');
  });

  it('da SIN_RESPUESTA cuando el servidor no contesta, no un error sin codigo', async () => {
    const pendiente = capturarError(http.get('/actuator/health'));

    servidor.expectOne('/actuator/health').error(new ProgressEvent('error'));

    const fallo = await pendiente;
    expect(fallo.codigo).toBe('SIN_RESPUESTA');
    expect(fallo.estado).toBe(0);
  });

  it('da INTERNO cuando la respuesta no es problem+json, como un 502 del proxy', async () => {
    const pendiente = capturarError(http.get('/api/v1/unidades'));

    servidor
      .expectOne('/api/v1/unidades')
      .flush('<html>Bad Gateway</html>', { status: 502, statusText: 'Bad Gateway' });

    const fallo = await pendiente;
    expect(fallo.codigo).toBe('INTERNO');
    expect(fallo.estado).toBe(502);
  });
});
