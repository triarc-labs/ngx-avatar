// Intentionally minimal Jest test suite to avoid double Angular TestBed initialization.
// The root-level src/test.ts initializes the Angular testing environment for all specs.
// Keeping this file free of Angular init prevents duplication while ensuring Jest sees a valid suite.

describe('library test bootstrap noop', () => {
  it('does nothing', () => {
    expect(true).toBe(true);
  });
});
