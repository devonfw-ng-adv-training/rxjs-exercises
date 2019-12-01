import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CoreModule } from './core/core.module';
import { AppComponent } from './core/containers/app/app.component';
import { TodoModule } from './todo/todo.module';


@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    TodoModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
