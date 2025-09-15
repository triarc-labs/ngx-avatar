import { Provider } from '@angular/core';

import { SourceFactory } from './sources/source.factory';
import { AvatarService } from './avatar.service';
import { AvatarConfig } from './avatar-config';
import { AVATAR_CONFIG } from './avatar-config.token';
import { AvatarConfigService } from './avatar-config.service';

/**
 * Standalone provider factory to configure ngx-avatar without NgModule.
 * Use in your application's providers array:
 *   providers: [provideAvatar({ colors: [...] })]
 */
export function provideAvatar(avatarConfig?: AvatarConfig): Provider[] {
  return [
    { provide: AVATAR_CONFIG, useValue: avatarConfig ? avatarConfig : {} }
  ];
}
