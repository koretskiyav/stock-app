import { describe, it, expect, beforeEach } from 'vitest';
import { selectCash } from '../selectors';
import { storeBuilder } from './testHelpers';

describe('AppStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with correct cash value using the shared selectCash selector', () => {
    const store = storeBuilder().withCash(555.55).build();
    expect(selectCash(store.getState())).toBe(555.55);
  });
});
