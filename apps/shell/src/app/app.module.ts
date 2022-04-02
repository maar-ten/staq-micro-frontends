import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WebComponentContainerComponent } from './web-component-container.component';

@NgModule({
  declarations: [AppComponent, WebComponentContainerComponent],
  imports: [BrowserModule, AppRoutingModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
