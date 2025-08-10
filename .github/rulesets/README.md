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
        "context": "quick-validation"
      }
    ],
    "strict_required_status_checks_policy": true
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

## Initial Setup Procedures

### Creating a New Ruleset for the First Time

#### Method 1: Via GitHub CLI (Recommended)

1. **Ensure you have the necessary permissions**
   ```bash
   # Check if you have admin access to the repository
   gh api repos/{owner}/{repo} --jq '.permissions.admin'
   ```

2. **Create the ruleset from JSON file**
   ```bash
   # Apply the ruleset configuration
   gh api repos/castor4bit/epub-image-extractor/rulesets \
     --method POST \
     --input .github/rulesets/main-branch-protection.json
   
   # Verify the ruleset was created
   gh api repos/castor4bit/epub-image-extractor/rulesets \
     --jq '.[] | {id: .id, name: .name, enforcement: .enforcement}'
   ```

#### Method 2: Via GitHub UI

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Rules** → **Rulesets**
3. Click **New ruleset** → **New branch ruleset**
4. Configure the ruleset:
   - **Name**: "Main Branch Protection"
   - **Enforcement status**: Active
   - **Target branches**: Add `main`
5. Add rules:
   - ✅ Restrict deletions
   - ✅ Restrict force pushes
   - ✅ Restrict creations
   - ✅ Require linear history
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
6. Configure bypass permissions if needed
7. Click **Create**

#### Method 3: Via GitHub API with curl

```bash
# First, create a GitHub personal access token with repo permissions
# Then use it to create the ruleset

curl -X POST \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/castor4bit/epub-image-extractor/rulesets \
  -d @.github/rulesets/main-branch-protection.json
```

### Verification After Initial Setup

1. **Verify the ruleset is active**
   ```bash
   gh api repos/castor4bit/epub-image-extractor/rulesets \
     --jq '.[] | select(.name == "Main Branch Protection") | {
       id: .id,
       name: .name,
       enforcement: .enforcement,
       created_at: .created_at
     }'
   ```

2. **Test with a direct push (should fail)**
   ```bash
   # Create a test branch
   git checkout main
   git checkout -b test/direct-push
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test: verify branch protection"
   
   # Try to push directly to main (should be rejected)
   git push origin test/direct-push:main
   # Expected: push rejected due to ruleset
   
   # Clean up
   git checkout main
   git branch -D test/direct-push
   ```

3. **Test with a pull request (should work)**
   ```bash
   # Create a proper feature branch
   git checkout -b test/pr-flow
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test: verify PR workflow"
   git push origin test/pr-flow
   
   # Create a PR
   gh pr create --title "Test: Verify ruleset" --body "Testing branch protection"
   
   # Check required status checks
   gh pr checks
   
   # After verification, close the PR
   gh pr close
   git checkout main
   git branch -D test/pr-flow
   ```

## Update Procedures

### When to Update the Ruleset

Update the ruleset configuration when:
- Adding/removing CI workflow checks
- Changing branch protection requirements
- Modifying review policies
- Adjusting bypass permissions
- Updating merge strategies

### Step-by-Step Update Process

#### Method 1: Update via JSON File (Recommended)

1. **Edit the JSON configuration**
   ```bash
   # Create a new branch for the changes
   git checkout -b chore/update-branch-protection-rules
   
   # Edit the ruleset file
   vim .github/rulesets/main-branch-protection.json
   ```

2. **Common modifications**

   **Adding a new required status check:**
   ```json
   "required_status_checks": [
     {
       "context": "quick-validation"
     },
     {
       "context": "security-scan"  // New check
     }
   ]
   ```

   **Changing review requirements:**
   ```json
   "parameters": {
     "required_approving_review_count": 1,  // Changed from 0
     "require_code_owner_review": true,     // Changed from false
   }
   ```

   **Adding bypass actors:**
   ```json
   "bypass_actors": [
     {
       "actor_id": 5,
       "actor_type": "RepositoryRole",
       "bypass_mode": "pull_request"
     },
     {
       "actor_id": 123456,  // New: specific user
       "actor_type": "User",
       "bypass_mode": "pull_request"
     }
   ]
   ```

3. **Test the configuration locally**
   ```bash
   # Validate JSON syntax
   jq . .github/rulesets/main-branch-protection.json
   
   # Note: GitHub does not currently provide a public JSON schema for rulesets.
   # The JSON structure follows the format documented in GitHub's API documentation.
   ```

4. **Create a Pull Request**
   ```bash
   git add .github/rulesets/main-branch-protection.json
   git commit -m "chore: update branch protection rules
   
   - Add security-scan to required checks
   - Require 1 approving review
   
   Co-Authored-By: Claude <noreply@anthropic.com>"
   
   git push origin chore/update-branch-protection-rules
   gh pr create
   ```

5. **Apply the updated ruleset**
   
   After PR is merged, apply via GitHub CLI:
   ```bash
   # First, get the current ruleset ID
   RULESET_ID=$(gh api repos/castor4bit/epub-image-extractor/rulesets \
     --jq '.[] | select(.name == "Main Branch Protection") | .id')
   
   # Update the existing ruleset
   gh api repos/castor4bit/epub-image-extractor/rulesets/$RULESET_ID \
     --method PUT \
     --input .github/rulesets/main-branch-protection.json
   ```

#### Method 2: Update via GitHub UI

1. Navigate to **Settings** → **Rules** → **Rulesets**
2. Find "Main Branch Protection" ruleset
3. Click **Edit** (pencil icon)
4. Make necessary changes:
   - Add/remove rules
   - Modify parameters
   - Update bypass actors
5. Click **Save changes**

#### Method 3: Update via GitHub API

```bash
# Get current ruleset
gh api repos/castor4bit/epub-image-extractor/rulesets \
  --jq '.[] | select(.name == "Main Branch Protection")' \
  > current-ruleset.json

# Edit the file
vim current-ruleset.json

# Update the ruleset
gh api repos/castor4bit/epub-image-extractor/rulesets/$RULESET_ID \
  --method PUT \
  --input current-ruleset.json
```

### Verification After Update

1. **Check ruleset status**
   ```bash
   gh api repos/castor4bit/epub-image-extractor/rulesets \
     --jq '.[] | select(.name == "Main Branch Protection") | {
       name: .name,
       enforcement: .enforcement,
       updated_at: .updated_at,
       rules_count: .rules | length
     }'
   ```

2. **Test with a dummy PR**
   ```bash
   git checkout -b test/ruleset-verification
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test: verify ruleset configuration"
   git push origin test/ruleset-verification
   gh pr create --title "Test: Verify ruleset" --body "Testing ruleset configuration"
   
   # Check if expected checks are required
   gh pr checks
   
   # Close without merging
   gh pr close
   ```

3. **Monitor ruleset activity**
   ```bash
   # View recent ruleset bypass events
   gh api /repos/castor4bit/epub-image-extractor/audit-log \
     --jq '.[] | select(.action | contains("ruleset"))'
   ```

### Common Update Scenarios

#### Scenario 1: Adding a New CI Workflow

When adding a new workflow that should block merging:

1. Create the workflow file (e.g., `.github/workflows/security-check.yml`)
2. Update ruleset to include the new check:
   ```json
   "required_status_checks": [
     { "context": "quick-validation" },
     { "context": "security-check" }  // New
   ]
   ```
3. Apply the updated ruleset

#### Scenario 2: Temporarily Disabling Rules

For maintenance or emergency situations:

1. Change enforcement to "disabled":
   ```json
   "enforcement": "disabled"  // Changed from "active"
   ```
2. Apply the change
3. Perform necessary operations
4. Re-enable: `"enforcement": "active"`

#### Scenario 3: Migrating to Team-Based Permissions

When transitioning from solo to team development:

1. Create GitHub team if not exists
2. Get team ID: `gh api orgs/ORG_NAME/teams/TEAM_SLUG --jq .id`
3. Update bypass actors:
   ```json
   "bypass_actors": [
     {
       "actor_id": TEAM_ID,
       "actor_type": "Team",
       "bypass_mode": "pull_request"
     }
   ]
   ```

### Rollback Procedures

If an update causes issues:

1. **Via GitHub UI**
   - Settings → Rules → Rulesets → History
   - Click "Revert" on the previous version

2. **Via Git**
   ```bash
   # Revert the commit that updated the JSON
   git revert <commit-hash>
   git push origin main
   
   # Re-apply the previous configuration
   gh api repos/castor4bit/epub-image-extractor/rulesets/$RULESET_ID \
     --method PUT \
     --input .github/rulesets/main-branch-protection.json
   ```

### Best Practices for Updates

1. **Always test in a fork first** (if possible)
2. **Document the reason for changes** in commit messages
3. **Keep a backup** of the current configuration before updating
4. **Coordinate with team** if multiple developers are affected
5. **Monitor after deployment** for unexpected behaviors
6. **Use gradual rollout** for major changes:
   - Start with "evaluate" mode
   - Monitor for a week
   - Switch to "active" mode

### Related Documentation
- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [CLAUDE.md Development Rules](../../CLAUDE.md)
- [CI/CD Workflow](.github/workflows/pr-validation.yml)