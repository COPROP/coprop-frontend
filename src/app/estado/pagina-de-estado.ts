import { Component, inject, OnInit, signal } from '@angular/core';
import { ErrorDeApi } from '../nucleo/api/error-de-api';
import { ServicioDeEstado } from './servicio-de-estado';

/**
 * Muestra si el backend responde.
 *
 * Es la primera pantalla y, de momento, la única: existe para cumplir el criterio del issue #1
 * —que la aplicación arranque y consuma el health del backend local— y para dejar montado el
 * camino completo, del componente al interceptor de errores.
 */
@Component({
  selector: 'app-pagina-de-estado',
  templateUrl: './pagina-de-estado.html',
  styleUrl: './pagina-de-estado.scss',
})
export class PaginaDeEstado implements OnInit {
  private readonly servicio = inject(ServicioDeEstado);

  protected readonly cargando = signal(true);
  protected readonly estado = signal<string | null>(null);
  protected readonly error = signal<ErrorDeApi | null>(null);

  ngOnInit(): void {
    this.consultar();
  }

  protected consultar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.consultar().subscribe({
      next: (respuesta) => {
        this.estado.set(respuesta.status);
        this.cargando.set(false);
      },
      error: (fallo: ErrorDeApi) => {
        this.error.set(fallo);
        this.estado.set(null);
        this.cargando.set(false);
      },
    });
  }
}
