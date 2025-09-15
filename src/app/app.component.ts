import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from 'ngx-avatar';
import { UserService } from './user.service';
import { Source } from '../../projects/ngx-avatar/src/lib/sources/source';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly defaultName = 'Haithem Mosbahi';
  private readonly defaultFB = 'wrongId';

  customStyle = {
    backgroundColor: '#27ae60',
    border: '1px solid #bdc3c7',
    borderRadius: '50%',
    color: 'white',
    cursor: 'pointer',
  };

  failedSources: number[] = [];

  constructor(public userService: UserService) {}

  private readonly userSig = toSignal(this.userService.fetchInformation(), {
    initialValue: null as any,
  });
  private readonly fbSig = toSignal(this.userService.getUserFacebook(), {
    initialValue: this.defaultFB,
  });

  readonly userNameSig = computed(
    () => (this.userSig()?.username as string | undefined) ?? this.defaultName,
  );
  readonly userFBSig = computed(() => this.fbSig());

  get userName(): string {
    return this.userNameSig();
  }

  get userFB(): string {
    return this.userFBSig();
  }

  avatarClicked(event: Source) {
    alert('click on avatar fetched from ' + event.sourceType);
  }
}
