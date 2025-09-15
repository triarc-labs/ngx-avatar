// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
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

// First, initialize the Angular testing environment with a global guard to prevent double init across multiple test.ts files.
const __globalAny: any = globalThis as any;
if (!__globalAny.__angular_testing_env_initialized__) {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
  __globalAny.__angular_testing_env_initialized__ = true;
}
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
