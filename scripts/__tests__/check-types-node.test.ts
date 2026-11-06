// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  compareMajors,
  getElectronNodeVersion,
  getTypesNodeVersion,
} from '../check-types-node.js';

const scriptPath = fileURLToPath(new URL('../check-types-node.js', import.meta.url));

describe('compareMajors', () => {
  it('returns null when majors match', () => {
    expect(compareMajors('24.22.2', '24.10.4')).toBeNull();
  });

  it('describes the mismatch when majors differ', () => {
    const message = compareMajors('24.22.2', '26.1.1');
    expect(message).toContain('24');
    expect(message).toContain('26');
  });
});

describe('installed versions', () => {
  it('reads the Node version bundled with the installed Electron', () => {
    expect(getElectronNodeVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('reads the installed @types/node version', () => {
    expect(getTypesNodeVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('check-types-node CLI', () => {
  it('passes for the dependencies in this repository', () => {
    const result = spawnSync(process.execPath, [scriptPath], { encoding: 'utf8' });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});
