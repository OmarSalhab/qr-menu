# Performance & Future Roadmap

## Current State
- SSR home each request (no caching) – acceptable for low to moderate traffic.
- No image optimization / resizing.
- Prisma queries simple & indexed by primary keys.

## Low-Hanging Optimizations
| Area | Action | Impact |
|------|--------|--------|
| Specials filtering | Add composite index `(storeId, available, dateFrom, dateTo)` | Faster active window scans |
| Categories/items fetch | In-memory cache 30–60s | Reduce DB hits on bursts |
| Images | Add `next/image` or CDN variant sizes | Page weight reduction |
| CSS | Purge unused utility classes (if Tailwind-like) | Smaller CSS payload |

## Medium-Term Enhancements
| Area | Action |
|------|--------|
| Open status recompute | Server snapshot + minute-level client refresh only | Eliminate drift & CPU cycles |
| Incremental static regeneration | Cache home for short TTL + revalidate on mutations | Reduce compute cost |
| Edge distribution | Deploy on edge nodes (vercel / cloudflare workers) | Latency reduction |
| DB connection pooling | Use pgBouncer if concurrency grows | Stability |

## Long-Term Roadmap
| Feature | Description |
|---------|-------------|
| Order capture | Add persisted cart → checkout flow |
| Multi-store tenancy | Host multiple restaurant menus under one deployment |
| Observability | Structured logs + tracing (OpenTelemetry) |
| Role-based access | Multiple admin roles (editor, owner) |
| i18n | Add English / bilingual display |
| Analytics dashboard | Track item views, conversions, offer performance |

## Scalability Considerations
- Stateless web tier enables horizontal scaling easily.
- Watch out for hot category: if one category accumulates thousands of items, add pagination or lazy loading.

## Performance Budget Targets (Initial)
| Metric | Target |
|--------|--------|
| TTFB (menu) | < 500ms regional |
| LCP | < 2.5s on 4G |
| CLS | < 0.05 |
| Bundle (client) | Keep < 200KB gz main route |

## Monitoring Wish List
| Metric | Tool |
|--------|------|
| Query latency | Prisma middleware + logs |
| Cache hit ratio | Custom metric if caching added |
| Image bandwidth | R2/CDN analytics |

---
See `architecture.md` for core design and `operations.md` for runbook.
