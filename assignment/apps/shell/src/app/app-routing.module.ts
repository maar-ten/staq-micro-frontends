import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@mfe/auth';
import { ReactContainerComponent } from './react-component-container.component';
import { WebComponentContainerComponent } from './web-component-container.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('login/Module').then((m) => m.AppModule),
  },
  {
    path: 'dashboard',
    children: [
      {
        path: '**',
        component: WebComponentContainerComponent,
        data: {
          loadElement: () => import('dashboard/Module'),
          elementName: 'mfe-dashboard',
        },
      },
    ],
  },
  {
    path: 'flights',
    canActivate: [AuthGuard],
    children: [
      {
        path: '**',
        component: ReactContainerComponent,
        data: {
          loadElement: () => import('flights/Module'),
          rootUrl: '/flights',
        },
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
