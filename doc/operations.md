# Operations & Runbook

## Environments
Suggested tiers:
- Local Development
- Staging (optional)
- Production

## Provisioning Checklist
| Step | Action |
|------|--------|
| 1 | Create Postgres database |
| 2 | Create R2 bucket + access keys |
| 3 | Set environment variables (see below) |
| 4 | Run `npx prisma migrate deploy` |
| 5 | Run seed scripts (optional) |
| 6 | Set admin password (ENV) & restart app |

## Environment Variables
| Name | Description |
|------|-------------|
| DATABASE_URL | Postgres connection string |
| ADMIN_PASSWORD | Plain admin password (improve: hashed + secret manager) |
| R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY | R2 credentials |
| R2_BUCKET | R2 bucket name |
| R2_ENDPOINT | Custom endpoint (e.g., `https://<account>.r2.cloudflarestorage.com`) |
| R2_PUBLIC_BASE | Public URL base for objects |

## Deployment (Generic Node Host)
```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start  # behind process manager (pm2 / systemd / docker)
```

## Zero-Downtime Strategy
- Use rolling restarts (Kubernetes) or blue/green.
- Ensure migrations are backward-compatible (add columns before code uses them, remove after cleanup).

## Backups
| Asset | Approach |
|-------|----------|
| Postgres | Daily logical dump (`pg_dump`), retain 7–30 days |
| R2 Images | R2 bucket lifecycle rules + periodic copy to cold storage (optional) |

## Monitoring
| Metric | Source |
|--------|--------|
| Request latency | Reverse proxy logs / APM |
| Error rates | API 500/400 counts |
| DB connections | Postgres metrics (pg_stat_activity) |
| Storage size | R2 bucket stats |

## Incident Response Outline
1. Identify scope (API failing? Upload? DB outage?).
2. Check logs (app + DB + object storage).
3. Rollback: deploy previous image or revert last migration if needed (only if safe).
4. Communicate status.

## Secret Rotation
- Rotate R2 keys quarterly; update ENV & redeploy.
- Change `ADMIN_PASSWORD` on staff changes.

## Scaling
| Component | Scaling Path |
|-----------|--------------|
| Web App | Horizontal replicas (stateless) |
| DB | Vertical scaling first; then read replicas if read-heavy |
| Images | R2 scales automatically |

## Performance Tuning Ideas
- Cache categories/items JSON in memory with short TTL (60s) + revalidate on mutation.
- Add HTTP `etag` / `cache-control` for banner/logo assets.
- Introduce CDN in front of static assets & images.

## Logging Conventions
- Structure logs (JSON) for API requests: `{ ts, level, route, method, status, ms }`.
- Redact secrets.

## Security Hardening Backlog
| Item | Priority |
|------|----------|
| Rate limiting on login | High |
| Hash `ADMIN_PASSWORD` | High |
| CSP headers | Medium |
| Helmet-like security headers | Medium |
| Audit log for admin mutations | Medium |
| 2FA / OTP | Low |

## Disaster Recovery Drill (Quarterly)
1. Restore latest Postgres dump to staging.
2. Point a staging build at restored DB.
3. Verify latest migrations re-apply cleanly.
4. Random sample of images from R2 accessible.

## Decommissioning
- Revoke R2 keys.
- Take final Postgres snapshot.
- Archive repository & documentation export.

---
Proceed to `qa-testing.md` for a manual verification checklist.
