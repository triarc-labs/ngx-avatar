import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AvatarModule } from 'ngx-avatar';

import { AppComponent } from './app.component';
import { UserService } from './user.service';

const avatarColors = ['#FFB6C1', '#2c3e50', '#95a5a6', '#f39c12', '#1abc9c'];

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    AvatarModule.forRoot({
      colors: avatarColors
    }),
    AppComponent
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule {}
