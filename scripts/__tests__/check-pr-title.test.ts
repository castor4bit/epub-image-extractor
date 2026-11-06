// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validatePrTitle } from '../check-pr-title.js';

const scriptPath = fileURLToPath(new URL('../check-pr-title.js', import.meta.url));

describe('validatePrTitle', () => {
  it.each([
    'feat: add drag and drop support',
    'fix(parser): handle missing nav document',
    'chore(deps-dev): Bump the development-dependencies group across 1 directory with 11 updates',
    'chore(main): release 0.7.2',
    'feat!: drop EPUB 2 support',
    'refactor(core)!: split extractor',
  ])('accepts %s', (title) => {
    expect(validatePrTitle(title)).toEqual([]);
  });

  it('rejects a title without a type prefix', () => {
    expect(validatePrTitle('Add drag and drop support')).toHaveLength(1);
  });

  it('rejects an unknown type', () => {
    expect(validatePrTitle('feature: add drag and drop')[0]).toMatch(/type/);
  });

  it('rejects an empty subject', () => {
    expect(validatePrTitle('fix: ')).not.toEqual([]);
  });

  it('rejects an upper-case subject', () => {
    expect(validatePrTitle('fix: HANDLE MISSING NAV')[0]).toMatch(/case/);
  });

  it('rejects a pascal-case subject', () => {
    expect(validatePrTitle('fix: HandleMissingNav')[0]).toMatch(/case/);
  });

  it('rejects a subject longer than 100 characters', () => {
    expect(validatePrTitle(`fix: ${'a'.repeat(101)}`)[0]).toMatch(/100/);
  });

  it('accepts a subject of exactly 100 characters', () => {
    expect(validatePrTitle(`fix: ${'a'.repeat(100)}`)).toEqual([]);
  });
});

describe('check-pr-title CLI', () => {
  const run = (title: string) =>
    spawnSync(process.execPath, [scriptPath], {
      env: { ...process.env, PR_TITLE: title },
      encoding: 'utf8',
    });

  it('exits 0 for a valid title', () => {
    expect(run('fix: handle missing nav').status).toBe(0);
  });

  it('exits 1 and reports the problem for an invalid title', () => {
    const result = run('Handle missing nav');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Handle missing nav');
  });
});
