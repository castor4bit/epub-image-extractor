module.exports = {
  header: '# Changelog\n\nAll notable changes to this project will be documented in this file. See [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) for commit guidelines.\n\n',
  preset: {
    name: 'conventionalcommits',
    types: [
      { type: 'feat', section: 'Features' },
      { type: 'fix', section: 'Bug Fixes' },
      { type: 'docs', section: 'Documentation', hidden: false },
      { type: 'perf', section: 'Performance Improvements', hidden: false },
      { type: 'chore', section: 'Maintenance', hidden: true },
      { type: 'style', section: 'Styles', hidden: true },
      { type: 'refactor', section: 'Code Refactoring', hidden: true },
      { type: 'test', section: 'Tests', hidden: true },
      { type: 'build', section: 'Build System', hidden: true },
      { type: 'ci', section: 'Continuous Integration', hidden: true },
      { type: 'revert', section: 'Reverts', hidden: false }
    ]
  },
  commitUrlFormat: 'https://github.com/castor4bit/epub-image-extractor/commit/{{hash}}',
  compareUrlFormat: 'https://github.com/castor4bit/epub-image-extractor/compare/{{previousTag}}...{{currentTag}}',
  issueUrlFormat: 'https://github.com/castor4bit/epub-image-extractor/issues/{{id}}',
  releaseCommitMessageFormat: 'chore: release v{{currentTag}}',
  skipUnstable: false,
  outputUnreleased: false
};