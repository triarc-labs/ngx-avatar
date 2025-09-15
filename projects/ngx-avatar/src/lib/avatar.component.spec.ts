import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarComponent } from './avatar.component';
import { SourceFactory } from './sources/source.factory';
import { AvatarService } from './avatar.service';
import { By } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';
import { AvatarSource } from './sources/avatar-source.enum';
import { Observable, of, throwError } from 'rxjs';
import { Source } from './sources/source';

class AvatarServiceMock {
  public fetchAvatar(avatarUrl: string): Observable<{ avatar_url: string }> {
    return avatarUrl === 'https://api.github.com/users/github-username' ?
        of({
          avatar_url: 'https://mocked.url/foo.jpg',
        }) :
        throwError(new Error('Mocked error for ' + avatarUrl));
  }

  public compareSources(source1: AvatarSource, source2: AvatarSource): number {
    return 0;
  }

  public isSource(source: string): boolean {
    return true;
  }

  public isTextAvatar(sourceType: AvatarSource) {
    return true;
  }

  public getRandomColor(avatarText: string): string {
    return '';
  }

  public markSourceAsFailed(source: Source): void {

  }

  public sourceHasFailedBefore(source: Source): boolean {
    return source.sourceType === AvatarSource.GRAVATAR;
  }
}

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;
  let avatarService: AvatarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
      providers: [
        SourceFactory,
        { provide: AvatarService, useClass: AvatarServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    avatarService = TestBed.inject(AvatarService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('AvatarText', () => {
    it('should display the initials of the given value', () => {
      fixture.componentRef.setInput('name', 'Marco');

      fixture.detectChanges();

      const avatarTextEl = fixture.debugElement.query(
        By.css('.avatar-container > div')
      );
      expect(avatarTextEl.nativeElement.textContent.trim()).toBe('M');
    });
  });

  it('should not try again failed sources', () => {
    fixture.componentRef.setInput('gravatarId', 'invalid@example.com');
    fixture.componentRef.setInput('name', 'Marco');

    fixture.detectChanges();

    const avatarTextEl = fixture.debugElement.query(
        By.css('.avatar-container > div')
    );
    expect(avatarTextEl.nativeElement.textContent.trim()).toBe('M');
  });

  it('should try next async source if first async source fails', () => {
    jest.spyOn(avatarService, 'isTextAvatar').mockReturnValue(false);
    fixture.componentRef.setInput('googleId', 'invalid@example.com');
    fixture.componentRef.setInput('githubId', 'github-username');

    fixture.detectChanges();

    const avatarImgEl = fixture.debugElement.query(
        By.css('.avatar-container > img')
    );
    expect(avatarImgEl.nativeElement.src).toBe('https://mocked.url/foo.jpg&s=50');
  });

  describe('AvatarImage', () => {});
});
