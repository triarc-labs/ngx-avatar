import { Component, OnChanges, SimpleChanges, OnDestroy, input, output, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal } from '@angular/core';
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
      [ngStyle]="hostStyle()"
    >
      @if (avatarSrc()) {
        <img
          [src]="avatarSrc()"
          [width]="size()"
          [height]="size()"
          [ngStyle]="avatarStyle()"
          (error)="fetchAvatarSource()"
          class="avatar-content"
          loading="lazy"
        />
      } @else {
        @if (avatarText()) {
          <div class="avatar-content" [ngStyle]="avatarStyle()">
            {{ avatarText() }}
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
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

  public isAlive = signal(true);
  public avatarSrc = signal<string | null>(null);
  public avatarText = signal<string | null>(null);
  public avatarStyle = signal<Style>({});
  public hostStyle = signal<Style>({});

  private currentIndex = signal(-1);
  private sources = signal<Source[]>([]);

  public sourceFactory = inject(SourceFactory);
  private avatarService = inject(AvatarService);

  public onAvatarClicked(): void {
    this.clickOnAvatar.emit(this.sources()[this.currentIndex()]);
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
    const currentIdx = this.currentIndex();
    const prevSources = this.sources();
    const previousSource = prevSources[currentIdx];
    if (previousSource) {
      this.avatarService.markSourceAsFailed(previousSource);
    }

    const source = this.findNextSource();
    if (!source) {
      return;
    }

    if (this.avatarService.isTextAvatar(source.sourceType)) {
      this.buildTextAvatar(source);
      this.avatarSrc.set(null);
    } else {
      this.buildImageAvatar(source);
    }
  }

  private findNextSource(): Source | null {
    let idx = this.currentIndex();
    const arr = this.sources();
    while (++idx < arr.length) {
      const source = arr[idx];
      if (source && !this.avatarService.sourceHasFailedBefore(source)) {
        this.currentIndex.set(idx);
        return source;
      }
    }
    this.currentIndex.set(idx);
    return null;
  }

  public ngOnDestroy(): void {
    this.isAlive.set(false);
  }

  /**
   * Initialize the avatar component and its fallback system
   */
  private initializeAvatar(): void {
    this.currentIndex.set(-1);
    if (this.sources().length > 0) {
      this.sortAvatarSources();
      this.fetchAvatarSource();
      this.hostStyle.set({
        width: this.size() + 'px',
        height: this.size() + 'px'
      });
    }
  }

  private sortAvatarSources(): void {
    const sorted = [...this.sources()].sort((source1, source2) =>
      this.avatarService.compareSources(source1.sourceType, source2.sourceType)
    );
    this.sources.set(sorted);
  }

  private buildTextAvatar(avatarSource: Source): void {
    this.avatarText.set(avatarSource.getAvatar(+this.initialsSize()));
    this.avatarStyle.set(this.getInitialsStyle(avatarSource.sourceId));
  }

  private buildImageAvatar(avatarSource: Source): void {
    this.avatarStyle.set(this.getImageStyle());
    if (avatarSource instanceof AsyncSource) {
      this.fetchAndProcessAsyncAvatar(avatarSource);
    } else {
      this.avatarSrc.set(avatarSource.getAvatar(+this.size()));
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
            takeWhile(() => this.isAlive()),
            map(response => source.processResponse(response, +this.size())),
        )
        .subscribe(
            avatarSrc => {
              this.avatarSrc.set(avatarSrc);
            },
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
    const arr = [...this.sources()];
    const existing = arr.find(s => s.sourceType === sourceType);
    if (existing) {
      existing.sourceId = sourceValue;
      this.sources.set([...arr]);
    } else {
      arr.push(this.sourceFactory.newInstance(sourceType, sourceValue));
      this.sources.set(arr);
    }
  }

  /**
   * Remove avatar source
   *
   * param sourceType avatar source type e.g facebook,x, etc.
   */
  private removeSource(sourceType: AvatarSource): void {
    const filtered = this.sources().filter((source: Source) => source.sourceType !== sourceType);
    this.sources.set(filtered);
  }
}
