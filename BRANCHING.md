# Git Branching Strategy & Collaboration Workflow

This document outlines the standard Git branching strategy, pull request workflow, and release tagging rules for the **Matrix Rain Effect Page** codebase.

---

## 1. Branch Taxonomy

We follow a modified **GitFlow / Feature Branching** model designed for automated CI/CD automation via Jenkins:

| Branch Pattern | Description | Base Branch | Merge Target | CI Pipeline Action |
| :--- | :--- | :--- | :--- | :--- |
| `main` | Production code. Always stable and deployable. | N/A | Direct commit forbidden | Triggers production K8s deployment |
| `develop` | Staging / integration branch for active development. | `main` | `main` (via PR) | Triggers staging K8s deployment |
| `feature/*` | Feature development (e.g. `feature/audio-controls`) | `develop` | `develop` (via PR) | Runs unit tests & Docker build dry-run |
| `bugfix/*` | Non-critical bug fixes | `develop` | `develop` (via PR) | Runs unit tests |
| `hotfix/*` | Urgent production bug fixes | `main` | `main` & `develop` | Direct pipeline trigger to production |

---

## 2. Developer Workflow

### Step 1: Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/matrix-canvas-perf
```

### Step 2: Commit Guidelines
Follow conventional commit style:
- `feat: add custom color matrix theme options`
- `fix: resolve canvas resize flickering on mobile`
- `ci: update Jenkinsfile Docker push step`
- `docs: update deployment architecture diagram`

```bash
git add .
git commit -m "feat: enhance frame throttling logic in script.js"
```

### Step 3: Open Pull Request
1. Push your branch to GitHub:
   ```bash
   git push origin feature/matrix-canvas-perf
   ```
2. Open a Pull Request targetting `develop` (or `main` for release).
3. Ensure automated CI checks (Jenkins pipeline) pass:
   - ✅ Unit tests pass (`npm test`)
   - ✅ Docker container builds cleanly
   - ✅ Terraform validation passes (`terraform validate`)
4. Obtain at least **1 peer code review approval**.

---

## 3. Release & Tagging Convention

When merging `develop` into `main`, tag the release using Semantic Versioning (`vX.Y.Z`):

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0: Matrix Rain Canvas with DevOps Pipeline"
git push origin v1.0.0
```

---

## 4. Automated CI/CD Webhook Integration

Jenkins is configured to listen for GitHub webhooks:
- **Push Events** on `feature/*` -> Triggers Build & Test Stage.
- **Pull Request Events** -> Triggers PR validation pipeline.
- **Push Events** on `main` / Tag push -> Triggers full pipeline: Build, Push Container, Terraform Infra Sync, Ansible Config, and Kubernetes Deployment.
