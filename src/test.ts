// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp,
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// Intentionally minimal Jest test bootstrap for the demo app.
// jest-preset-angular handles Angular testing environment setup and test discovery.
// Keeping this file with a noop test avoids double initialization or Webpack-specific APIs.

describe('app test bootstrap noop', () => {
  it('does nothing', () => {
    expect(true).toBe(true);
  });
});
