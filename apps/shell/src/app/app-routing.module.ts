import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebComponentContainerComponent } from './web-component-container.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('login/Module').then((m) => m.AppModule),
  },
  {
    path: 'dashboard',
    component: WebComponentContainerComponent,
    data: {
      loadElement: () => import('dashboard/Module'),
      elementName: 'mfe-dashboard',
    },
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
