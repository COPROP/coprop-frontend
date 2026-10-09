import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { interceptorDeErrores } from '../nucleo/api/interceptor-de-errores';
import { PaginaDeEstado } from './pagina-de-estado';

describe('PaginaDeEstado', () => {
  let fixture: ComponentFixture<PaginaDeEstado>;
  let servidor: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaDeEstado],
      providers: [
        provideHttpClient(withInterceptors([interceptorDeErrores])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaDeEstado);
    servidor = TestBed.inject(HttpTestingController);
  });

  afterEach(() => servidor.verify());

  function texto(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('consulta el health del backend y muestra su estado', () => {
    fixture.detectChanges();

    servidor.expectOne('/actuator/health').flush({ status: 'UP' });
    fixture.detectChanges();

    expect(texto()).toContain('UP');
  });

  it('con el backend caido muestra el mensaje y el codigo, no una pantalla en blanco', () => {
    fixture.detectChanges();

    servidor.expectOne('/actuator/health').error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(texto()).toContain('No se pudo contactar con el servidor');
    expect(texto()).toContain('SIN_RESPUESTA');
  });

  it('muestra el traceId cuando el backend lo manda, que es lo que busca soporte', () => {
    fixture.detectChanges();

    servidor.expectOne('/actuator/health').flush(
      {
        type: 'https://coprop.bo/errores/interno',
        title: 'Error interno',
        status: 500,
        detail: 'Ocurrio un error inesperado.',
        codigo: 'INTERNO',
        traceId: 'abc-123',
      },
      { status: 500, statusText: 'Internal Server Error' },
    );
    fixture.detectChanges();

    expect(texto()).toContain('abc-123');
  });
});
