import { describe, it, expect, beforeEach } from 'vitest';
import { getFieldTypes, registerFieldTypes } from '../lib/registry/fieldRegistry';
import { bootstrapDefaultFieldTypes } from '../lib/registry/init';

describe('Field registry bootstrap', () => {
  beforeEach(() => {
    // Reset registry by re-registering an empty set
    registerFieldTypes([]);
  });

  it('is empty before bootstrap and populated after bootstrap', () => {
    const before = getFieldTypes();
    expect(before.length).toBe(0);

    bootstrapDefaultFieldTypes();

    const after = getFieldTypes();
    expect(after.length).toBeGreaterThan(0);
  });
});
