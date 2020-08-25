import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponentComponent } from './test-component/test-component.component';
import { KeywordSpottingService } from './shared/keyword-spotting.service';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [AppComponent, TestComponentComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [KeywordSpottingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
