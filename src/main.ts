import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';
import { UserService } from './app/user.service';

import { provideAvatar } from '../projects/ngx-avatar/src/lib/avatar.module';

const avatarColors = ['#FFB6C1', '#2c3e50', '#95a5a6', '#f39c12', '#1abc9c'];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    UserService,
    provideAvatar({ colors: avatarColors })
  ]
}).catch(err => console.error(err));
