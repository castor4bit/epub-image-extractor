# GitHub Rulesets Configuration

This directory contains GitHub repository rulesets that enforce branch protection and development workflow policies.

## Main Branch Protection Ruleset

The `main-branch-protection.json` ruleset implements comprehensive protection for the main branch to ensure code quality and maintain development standards defined in CLAUDE.md.

### Ruleset Components

#### 1. Target Configuration
```json
"target": "branch",
"enforcement": "active",
"conditions": {
  "ref_name": {
    "include": ["refs/heads/main"]
  }
}
```
- **Purpose**: Applies rules specifically to the `main` branch
- **Enforcement**: Active immediately upon configuration
- **Scope**: Only affects the main branch, other branches remain unrestricted

#### 2. Branch Protection Rules

##### 2.1 Deletion Protection
```json
{ "type": "deletion" }
```
- **Prevents**: Direct deletion of the main branch
- **Rationale**: Protects against accidental or malicious branch deletion

##### 2.2 Force Push Protection
```json
{ "type": "non_fast_forward" }
```
- **Prevents**: Force pushes that rewrite history
- **Rationale**: Maintains commit history integrity

##### 2.3 Branch Creation Protection
```json
{ "type": "creation" }
```
- **Prevents**: Direct creation of the main branch if deleted
- **Rationale**: Ensures main branch is properly restored through appropriate channels

##### 2.4 Linear History Requirement
```json
{ "type": "required_linear_history" }
```
- **Enforces**: Clean, linear commit history without merge commits
- **Rationale**: Maintains readable and traceable project history

##### 2.5 Pull Request Requirements
```json
{
  "type": "pull_request",
  "parameters": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews_on_push": true,
    "require_code_owner_review": false,
    "require_last_push_approval": false,
    "required_review_thread_resolution": true
  }
}
```
- **Enforces**: All changes must go through pull requests
- **Key Settings**:
  - `required_approving_review_count: 0`: No mandatory reviews (suitable for solo projects)
  - `dismiss_stale_reviews_on_push: true`: Invalidates reviews after new commits
  - `required_review_thread_resolution: true`: All PR comments must be resolved

##### 2.6 Status Check Requirements
```json
{
  "type": "required_status_checks",
  "parameters": {
    "required_status_checks": [
      {
        "context": "quick-validation",
        "integration_id": 15368
      }
    ],
    "strict_required_status_checks": true
  }
}
```
- **Enforces**: CI/CD pipeline must pass before merging
- **Required Checks**:
  - `quick-validation`: Runs linting, type checking, tests, and build
- **Strict Mode**: Branch must be up-to-date with main before merging

#### 3. Bypass Permissions
```json
"bypass_actors": [
  {
    "actor_id": 5,
    "actor_type": "RepositoryRole",
    "bypass_mode": "pull_request"
  }
]
```
- **Allows**: Repository administrators to bypass rules via pull requests
- **Use Case**: Emergency fixes or special maintenance tasks
- **Restriction**: Even admins cannot push directly, must use PRs

### How This Enforces CLAUDE.md Requirements

1. **No Direct Push to Main**: Aligns with "すべての変更は PR 経由でマージ（main への直接 push は禁止）"
2. **Quality Checks**: Ensures all commits pass:
   - ESLint (`npm run lint`)
   - TypeScript check (`npm run typecheck`)
   - Unit tests (`npm test`)
   - Integration tests (`npm run test:integration`)
   - Build verification (`npm run build`)

3. **Development Workflow**: Enforces the proper branch strategy:
   - Developers must create feature branches
   - Changes reviewed through pull requests
   - CI validation before merge

### Implementation Notes

1. **Activation**: This ruleset configuration should be applied through:
   - GitHub UI: Settings → Rules → Rulesets
   - GitHub API: POST /repos/{owner}/{repo}/rulesets
   - GitHub CLI: `gh api repos/{owner}/{repo}/rulesets --input main-branch-protection.json`

2. **Monitoring**: Review ruleset effectiveness through:
   - GitHub Insights → Rules
   - Audit log for bypass events
   - PR merge history

3. **Adjustments**: For team projects, consider:
   - Increasing `required_approving_review_count` to 1 or 2
   - Enabling `require_code_owner_review` for critical paths
   - Adding more status checks as CI/CD expands

### Troubleshooting

**Issue**: Cannot merge PR despite passing checks
- **Solution**: Ensure branch is up-to-date with main (`git pull origin main`)

**Issue**: Emergency fix needed
- **Solution**: Admin can create PR and use bypass permission

**Issue**: CI check not recognized
- **Solution**: Verify `integration_id` matches your GitHub Actions app ID

### Related Documentation
- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [CLAUDE.md Development Rules](../../CLAUDE.md)
- [CI/CD Workflow](.github/workflows/pr-validation.yml)