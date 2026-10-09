import { Routes } from '@angular/router';

/**
 * Rutas con carga diferida: cada pantalla entra en su propio trozo de bundle.
 *
 * Con una sola pagina no se nota, pero la convencion se fija ahora; cuando entren las de pagos y
 * reservas, anadir una ruta sin `loadComponent` sera la excepcion visible, no el descuido normal.
 */
export const routes: Routes = [
  {
    path: 'estado',
    loadComponent: () => import('./estado/pagina-de-estado').then((m) => m.PaginaDeEstado),
    title: 'Estado del backend',
  },
  { path: '', pathMatch: 'full', redirectTo: 'estado' },
  { path: '**', redirectTo: 'estado' },
];
