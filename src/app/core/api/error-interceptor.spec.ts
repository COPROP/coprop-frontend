import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { ApiError } from './api-error';
import { errorInterceptor } from './error-interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let servidor: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
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
  function captureError<T>(fuente: Observable<T>): Promise<ApiError> {
    return new Promise((resolver, rechazar) => {
      fuente.subscribe({
        next: () => rechazar(new Error('se esperaba un fallo y la peticion salio bien')),
        error: (failure: ApiError) => resolver(failure),
      });
    });
  }

  it('traduce un problem+json conservando codigo, traceId y los campos rechazados', async () => {
    const pendiente = captureError(http.get('/api/v1/units'));

    servidor.expectOne('/api/v1/units').flush(
      {
        type: 'https://coprop.bo/errors/validation',
        title: 'La solicitud no es valida',
        status: 422,
        detail: 'Revisa los campos indicados.',
        code: 'VALIDATION',
        traceId: 'abc-123',
        errors: [{ field: 'number', code: 'NotBlank', message: 'El numero es obligatorio.' }],
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );

    const failure = await pendiente;
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.code).toBe('VALIDATION');
    expect(failure.status).toBe(422);
    expect(failure.traceId).toBe('abc-123');
    expect(failure.messageOf('number')).toBe('El numero es obligatorio.');
  });

  it('da NO_RESPONSE cuando el servidor no contesta, no un error sin codigo', async () => {
    const pendiente = captureError(http.get('/actuator/health'));

    servidor.expectOne('/actuator/health').error(new ProgressEvent('error'));

    const failure = await pendiente;
    expect(failure.code).toBe('NO_RESPONSE');
    expect(failure.status).toBe(0);
  });

  it('da INTERNAL cuando la respuesta no es problem+json, como un 502 del proxy', async () => {
    const pendiente = captureError(http.get('/api/v1/units'));

    servidor
      .expectOne('/api/v1/units')
      .flush('<html>Bad Gateway</html>', { status: 502, statusText: 'Bad Gateway' });

    const failure = await pendiente;
    expect(failure.code).toBe('INTERNAL');
    expect(failure.status).toBe(502);
  });
});
