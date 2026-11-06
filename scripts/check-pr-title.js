#!/usr/bin/env node
// Validate a PR title as a Conventional Commits header.
// PRs are squash-merged, so the title becomes the commit on main that
// release-please parses. Usage: PR_TITLE="fix: ..." node scripts/check-pr-title.js

import { fileURLToPath } from 'node:url';

export const ALLOWED_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'perf',
  'ci',
  'build',
  'revert',
];

const SUBJECT_MAX_LENGTH = 100;
const HEADER_PATTERN = /^(?<type>[a-z]+)(?:\((?<scope>[^()]+)\))?!?: (?<subject>.*)$/;

export function validatePrTitle(title) {
  const match = HEADER_PATTERN.exec(title);
  if (!match) {
    return ['title must follow "<type>(<scope>): <subject>"'];
  }

  const { type, subject } = match.groups;
  const errors = [];

  if (!ALLOWED_TYPES.includes(type)) {
    errors.push(`type "${type}" is not one of: ${ALLOWED_TYPES.join(', ')}`);
  }
  if (subject.trim() === '') {
    errors.push('subject must not be empty');
  } else {
    const isUpperCase = /[A-Z]/.test(subject) && subject === subject.toUpperCase();
    const isPascalCase = /^(?:[A-Z][a-z0-9]+){2,}$/.test(subject);
    if (isUpperCase || isPascalCase) {
      errors.push('subject must not be upper-case or pascal-case');
    }
  }
  if (subject.length > SUBJECT_MAX_LENGTH) {
    errors.push(`subject must be at most ${SUBJECT_MAX_LENGTH} characters`);
  }

  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const title = process.env.PR_TITLE ?? '';
  const errors = validatePrTitle(title);
  if (errors.length > 0) {
    console.error(`Invalid PR title: "${title}"`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
  console.log(`PR title OK: "${title}"`);
}
