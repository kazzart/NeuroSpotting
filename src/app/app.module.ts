import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponentComponent } from './test-component/test-component.component';
import { AudioService } from './audio-service.service';

@NgModule({
  declarations: [AppComponent, TestComponentComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [AudioService],
  bootstrap: [AppComponent],
})
export class AppModule {}
