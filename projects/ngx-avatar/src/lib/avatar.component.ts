import { Component, OnChanges, SimpleChanges, OnDestroy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Source } from './sources/source';
import { AsyncSource } from './sources/async-source';
import { SourceFactory } from './sources/source.factory';
import { AvatarService } from './avatar.service';
import { AvatarSource } from './sources/avatar-source.enum';
import { takeWhile, map } from 'rxjs/operators';

type Style = Partial<CSSStyleDeclaration>;

/**
 * Universal avatar component that
 * generates avatar from different sources
 *
 * export
 * class AvatarComponent
 * implements {OnChanges}
 */

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-avatar',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        border-radius: 50%;
      }
    `
  ],
  template: `
    <div
      (click)="onAvatarClicked()"
      class="avatar-container"
      [ngStyle]="hostStyle"
    >
      @if (avatarSrc) {
        <img
          [src]="avatarSrc"
          [width]="size()"
          [height]="size()"
          [ngStyle]="avatarStyle"
          (error)="fetchAvatarSource()"
          class="avatar-content"
          loading="lazy"
        />
      } @else {
        @if (avatarText) {
          <div class="avatar-content" [ngStyle]="avatarStyle">
            {{ avatarText }}
          </div>
        }
      }
    </div>
  `
})
export class AvatarComponent implements OnChanges, OnDestroy {
  public round = input(true);
  public size = input<string | number>(50);
  public textSizeRatio = input(3);
  public bgColor = input<string | undefined>(undefined);
  public fgColor = input('#FFF');
  public borderColor = input<string | undefined>(undefined);
  public style = input<Style>({});
  public cornerRadius = input<string | number>(0);
  public facebook = input<string | null | undefined>(undefined, { alias: 'facebookId' });
  public google = input<string | null | undefined>(undefined, { alias: 'googleId' });
  public instagram = input<string | null | undefined>(undefined, { alias: 'instagramId' });
  public skype = input<string | null | undefined>(undefined, { alias: 'skypeId' });
  public gravatar = input<string | null | undefined>(undefined, { alias: 'gravatarId' });
  public github = input<string | null | undefined>(undefined, { alias: 'githubId' });
  public custom = input<string | null | undefined>(undefined, { alias: 'src' });
  public initials = input<string | null | undefined>(undefined, { alias: 'name' });
  public value = input<string | null | undefined>(undefined);
  public placeholder = input<string | undefined>(undefined);
  public initialsSize = input<string | number>(0);

  public clickOnAvatar = output<Source>();

  public isAlive = true;
  public avatarSrc: string | null = null;
  public avatarText: string | null = null;
  public avatarStyle: Style = {};
  public hostStyle: Style = {};

  private currentIndex = -1;
  private sources: Source[] = [];

  constructor(
    public sourceFactory: SourceFactory,
    private avatarService: AvatarService
  ) {}

  public onAvatarClicked(): void {
    this.clickOnAvatar.emit(this.sources[this.currentIndex]);
  }

  /**
   * Detect inputs change
   *
   * param {{ [propKey: string]: SimpleChange }} changes
   *
   * memberof AvatarComponent
   */
  public ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (this.avatarService.isSource(propName)) {
        const sourceType: AvatarSource = AvatarSource[propName.toUpperCase() as keyof typeof AvatarSource] ;
        const currentValue = changes[propName].currentValue;
        if (currentValue && typeof currentValue === 'string') {
          this.addSource(sourceType, currentValue);
        } else {
          this.removeSource(sourceType);
        }
      }
    }
    // reinitialize the avatar component when a source property value has changed
    // the fallback system must be re-invoked with the new values.
    this.initializeAvatar();
  }

  /**
   * Fetch avatar source
   *
   * memberOf AvatarComponent
   */
  public fetchAvatarSource(): void {
    const previousSource = this.sources[this.currentIndex];
    if (previousSource) {
      this.avatarService.markSourceAsFailed(previousSource);
    }

    const source = this.findNextSource();
    if (!source) {
      return;
    }

    if (this.avatarService.isTextAvatar(source.sourceType)) {
      this.buildTextAvatar(source);
      this.avatarSrc = null;
    } else {
      this.buildImageAvatar(source);
    }
  }

  private findNextSource(): Source | null {
    while (++this.currentIndex < this.sources.length) {
      const source = this.sources[this.currentIndex];
      if (source && !this.avatarService.sourceHasFailedBefore(source)) {
        return source;
      }
    }

    return null;
  }

  public ngOnDestroy(): void {
    this.isAlive = false;
  }

  /**
   * Initialize the avatar component and its fallback system
   */
  private initializeAvatar(): void {
    this.currentIndex = -1;
    if (this.sources.length > 0) {
      this.sortAvatarSources();
      this.fetchAvatarSource();
      this.hostStyle = {
        width: this.size() + 'px',
        height: this.size() + 'px'
      };
    }
  }

  private sortAvatarSources(): void {
    this.sources.sort((source1, source2) =>
      this.avatarService.compareSources(source1.sourceType, source2.sourceType)
    );
  }

  private buildTextAvatar(avatarSource: Source): void {
    this.avatarText = avatarSource.getAvatar(+this.initialsSize());
    this.avatarStyle = this.getInitialsStyle(avatarSource.sourceId);
  }

  private buildImageAvatar(avatarSource: Source): void {
    this.avatarStyle = this.getImageStyle();
    if (avatarSource instanceof AsyncSource) {
      this.fetchAndProcessAsyncAvatar(avatarSource);
    } else {
      this.avatarSrc = avatarSource.getAvatar(+this.size());
    }
  }

  /**
   *
   * returns initials style
   *
   * memberOf AvatarComponent
   */
  private getInitialsStyle(avatarValue: string): Style {
    return {
      textAlign: 'center',
      borderRadius: this.round() ? '100%' : this.cornerRadius() + 'px',
      border: this.borderColor() ? '1px solid ' + this.borderColor() : '',
      textTransform: 'uppercase',
      color: this.fgColor(),
      backgroundColor: this.bgColor()
        ? this.bgColor()
        : this.avatarService.getRandomColor(avatarValue),
      font:
        Math.floor(+this.size() / this.textSizeRatio()) +
        'px Helvetica, Arial, sans-serif',
      lineHeight: this.size() + 'px',
      ...this.style()
    };
  }

  /**
   *
   * returns image style
   *
   * memberOf AvatarComponent
   */
  private getImageStyle(): Style {
    return {
      maxWidth: '100%',
      borderRadius: this.round() ? '50%' : this.cornerRadius() + 'px',
      border: this.borderColor() ? '1px solid ' + this.borderColor() : '',
      width: this.size() + 'px',
      height: this.size() + 'px',
      ...this.style(),
    };
  }
  /**
   * Fetch avatar image asynchronously.
   *
   * param {Source} source represents avatar source
   * memberof AvatarComponent
   */
  private fetchAndProcessAsyncAvatar(source: AsyncSource): void {
    if (this.avatarService.sourceHasFailedBefore(source)) {
      return;
    }

    this.avatarService
        .fetchAvatar(source.getAvatar(+this.size()))
        .pipe(
            takeWhile(() => this.isAlive),
            map(response => source.processResponse(response, +this.size())),
        )
        .subscribe(
            avatarSrc => (this.avatarSrc = avatarSrc),
            err => {
              this.fetchAvatarSource();
            },
        );
  }

  /**
   * Add avatar source
   *
   * param sourceType avatar source type e.g facebook,x, etc.
   * param sourceValue  source value e.g facebookId value, etc.
   */
  private addSource(sourceType: AvatarSource, sourceValue: string): void {
    const source = this.sources.find(s => s.sourceType === sourceType);
    if (source) {
      source.sourceId = sourceValue;
    } else {
      this.sources.push(
          this.sourceFactory.newInstance(sourceType, sourceValue),
      );
    }
  }

  /**
   * Remove avatar source
   *
   * param sourceType avatar source type e.g facebook,x, etc.
   */
  private removeSource(sourceType: AvatarSource): void {
    this.sources = this.sources.filter(source => source.sourceType !== sourceType);
  }
}
