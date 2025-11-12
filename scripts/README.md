# ⚓ Anclora DevOps Scripts — Reference & Usage Guide

Automated and manual tools for maintaining and deploying the **Anclora multi-environment Git structure**.

---

## 🧩 Repository Branch Structure

| Branch        | Purpose                                          | Environment            |
| :------------ | :----------------------------------------------- | :--------------------- |
| `development` | Active working branch for new features and fixes | Local / Dev            |
| `main`        | Integration branch for validated changes         | Internal / Integration |
| `preview`     | Pre-production testing branch                    | QA / Staging           |
| `production`  | Stable release branch                            | Live / Production      |

---

## 🛠️ Available Scripts

| Script                               | Purpose                                                                                                                             | Typical Use                                  |
| :----------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| **`promote.ps1`**                    | Safely promote code between environments (`development → main → preview` or `preview → production`) with confirmations and logging. | Manual promotions after validation           |
| **`anclora_sync_envs.ps1`**          | Auto-sync all environments bidirectionally. Detects branch names dynamically (`main` or `master`).                                  | Scheduled or automated sync (GitHub Actions) |
| **`anclora_git_recover_cli.ps1`**    | Fast recovery script for restoring one branch from another. CLI mode for CI/CD pipelines or headless recovery.                      | Automatic recovery or forced alignment       |
| **`anclora_git_recover.ps1`**        | Interactive recovery tool with visual confirmations and backups. Ideal for local restores.                                          | Manual recovery via terminal                 |
| _(Optional)_ **`promotion_log.txt`** | Auto-generated log of all promotions (date, target, status).                                                                        | Audit history                                |

---

## ⚙️ Typical Workflows

### 🧱 1️⃣ Development → Preview (Pre-production)

After testing locally:

```powershell
./scripts/promote.ps1 preview
```
