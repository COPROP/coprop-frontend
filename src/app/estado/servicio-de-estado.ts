import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Lo que devuelve el actuator del backend. Trae más campos; aquí solo interesa el estado. */
export interface EstadoDelBackend {
  readonly status: string;
}

@Injectable({ providedIn: 'root' })
export class ServicioDeEstado {
  private readonly http = inject(HttpClient);

  /**
   * Consulta el health del backend.
   *
   * La ruta va sin dominio a propósito: en desarrollo la reenvía el proxy del dev server al 8080,
   * y en producción el frontend se sirve tras el mismo dominio que la API. En los dos casos el
   * navegador ve el mismo origen y CORS no entra en juego.
   */
  consultar(): Observable<EstadoDelBackend> {
    return this.http.get<EstadoDelBackend>(`${environment.baseApi}/actuator/health`);
  }
}
