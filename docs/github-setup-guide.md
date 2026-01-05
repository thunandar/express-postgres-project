# GitHub Setup Guide - Quick Reference

## One-Time Setup (Install GitHub CLI)

### Step 1: Install GitHub CLI

```bash
winget install GitHub.cli
```

**After installation, close and reopen your terminal!**

---

### Step 2: Login to GitHub

```bash
gh auth login
```

**Follow prompts:**
1. Account: **GitHub.com**
2. Protocol: **HTTPS**
3. Authenticate Git: **Yes**
4. How to authenticate: **Login with a web browser**
5. Copy code shown (e.g., `5BE5-B078`)
6. Press Enter → Browser opens
7. Paste code in browser
8. Click **Authorize**
9. Terminal shows: ✓ Logged in as YOUR_USERNAME

---

## What `gh` CLI Does

### For You:
- ✅ Create repos from terminal
- ✅ Manage PRs and issues
- ✅ Push code easily
- ✅ View Actions status

### For Claude:
- ✅ Can run `gh` commands for you
- ✅ Create repos automatically
- ✅ Push commits
- ✅ Manage GitHub operations

---

## Common Commands

### Create Repo and Push
```bash
# Creates repo on GitHub and pushes code
gh repo create REPO_NAME --public --source=. --remote=origin --push
```

### View Workflows
```bash
# See CI/CD status
gh run list

# Watch specific run
gh run watch
```

### Create PR
```bash
gh pr create --title "Your PR title" --body "Description"
```

### View Repo
```bash
# Open repo in browser
gh repo view --web
```

---

## What I Did to Push Your Code

### Commands Run:

```bash
# 1. Check status
git status

# 2. Add all files
git add -A

# 3. Create commit
git commit -m "Add testing setup, CI/CD pipeline, and AWS deployment guide

- Configure separate test database for isolated testing
- Add Jest test configuration and 56 test cases
- Set up GitHub Actions CI/CD workflow
- Create comprehensive documentation"

# 4. Create GitHub repo and push (ONE command does it all!)
gh repo create express-postgres-project \
  --public \
  --source=. \
  --remote=origin \
  --description="Production-ready Express.js REST API with PostgreSQL, Docker, automated testing, and CI/CD pipeline" \
  --push
```


