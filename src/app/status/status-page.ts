import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiError } from '../core/api/api-error';
import { StatusService } from './status-service';

/**
 * Muestra si el backend responde.
 *
 * Es la primera pantalla y, de momento, la única: existe para cumplir el criterio del issue #1
 * —que la aplicación arranque y consuma el health del backend local— y para dejar montado el
 * camino completo, del componente al interceptor de errores.
 */
@Component({
  selector: 'app-status-page',
  templateUrl: './status-page.html',
  styleUrl: './status-page.scss',
})
export class StatusPage implements OnInit {
  private readonly servicio = inject(StatusService);

  protected readonly loading = signal(true);
  protected readonly status = signal<string | null>(null);
  protected readonly error = signal<ApiError | null>(null);

  ngOnInit(): void {
    this.check();
  }

  protected check(): void {
    this.loading.set(true);
    this.error.set(null);
    this.servicio.check().subscribe({
      next: (respuesta) => {
        this.status.set(respuesta.status);
        this.loading.set(false);
      },
      error: (failure: ApiError) => {
        this.error.set(failure);
        this.status.set(null);
        this.loading.set(false);
      },
    });
  }
}
