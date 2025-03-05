# Branching Strategy

This document outlines the branching strategy for our project using **feature branching** on GitHub. The goal is to maintain a clean, organized, and efficient workflow for development, testing, and releases.

---

## **1. Branch Types**

### **1.1. Main Branch (`main`)**
- **Purpose:** The `main` branch represents the production-ready state of the application.
- **Usage:**
  - Only updated via Pull Requests (PRs) from `release` or `hotfix` branches.
  - Direct commits to `main` are not allowed.
- **Naming Convention:** `main`

---

### **1.2. Develop Branch (`develop`)**
- **Purpose:** The `develop` branch serves as the integration branch for ongoing development.
- **Usage:**
  - All feature branches are merged into `develop` after code review and testing.
  - Used to prepare for the next release.
- **Naming Convention:** `develop`

---

### **1.3. Feature Branches (`feature/*`)**
- **Purpose:** Feature branches are used for developing new features or enhancements.
- **Usage:**
  - Created from the `develop` branch.
  - Merged back into `develop` after completion and approval via a Pull Request (PR).
  - Deleted after merging.
- **Naming Convention:** `feature/feature-name` (e.g., `feature/user-authentication`)

---

### **1.4. Bugfix Branches (`bugfix/*`)**
- **Purpose:** Bugfix branches are used to fix bugs in the `develop` or `main` branches.
- **Usage:**
  - Created from the `develop` branch (for bugs in upcoming releases) or the `main` branch (for production bugs).
  - Merged back into the originating branch after completion and approval via a Pull Request (PR).
  - Deleted after merging.
- **Naming Convention:** `bugfix/issue-description` (e.g., `bugfix/seat-booking-refresh`)

---

### **1.5. Release Branches (`release/*`)**
- **Purpose:** Release branches are used to prepare for a new production release.
- **Usage:**
  - Created from the `develop` branch when the features for a release are complete.
  - Used for final testing, bug fixes, and version tagging.
  - Merged into both `main` and `develop` after the release is complete.
  - Deleted after merging.
- **Naming Convention:** `release/version-number` (e.g., `release/v1.0.0`)

---

### **1.6. Hotfix Branches (`hotfix/*`)**
- **Purpose:** Hotfix branches are used to quickly fix critical bugs in production.
- **Usage:**
  - Created from the `main` branch.
  - Merged back into both `main` and `develop` after completion.
  - Deleted after merging.
- **Naming Convention:** `hotfix/issue-description` (e.g., `hotfix/login-error`)

---

## **2. Branch Creation and Workflow**

### **2.1. Creating a New Branch**
1. Ensure you are on the correct base branch (e.g., `develop` for features, `main` for hotfixes).
2. Create a new branch using the appropriate naming convention:
   ```bash
   git checkout -b branch-type/branch-name

# Covert Hotfix for Production

## Steps to Apply a Hotfix

### 1. Create a Hotfix Branch
```bash
git checkout -b hotfix/login-error
```

### 2. Fix the Issue and Commit Changes
```bash
git add .
git commit -m "Fix login error in production"
```

### 3. Push the Hotfix Branch to GitHub
```bash
git push origin hotfix/login-error
```

### 4. Create a Pull Request (PR)
- Open a PR targeting the `main` branch.
- Ensure the fix is reviewed and approved.

### 5. Merge the PR and Delete the Branch
```bash
git checkout main
git merge hotfix/login-error
git push origin main
git branch -d hotfix/login-error
git push origin --delete hotfix/login-error
```

### 6. Tag the Fix (If Using Semantic Versioning)
If the project follows [Semantic Versioning](https://semver.org/), tag the release:
```bash
git tag -a v1.2.4 -m "Hotfix: Fix login error"
git push origin v1.2.4
```

## References
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Semantic Versioning](https://semver.org/)
