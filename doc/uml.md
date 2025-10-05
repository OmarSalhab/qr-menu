# UML & Diagrams (Text-Based)

> Diagrams are provided in Mermaid (preferred) for portability. Can be pasted into compatible renderers (e.g., MkDocs, GitHub, VS Code Mermaid preview).

## 1. Context Diagram
```mermaid
graph LR
  User((User)) -->|HTTP| Web[Next.js App]
  Web -->|Queries| DB[(PostgreSQL)]
  Web -->|Uploads| R2[(Cloudflare R2)]
  Admin((Admin User)) -->|Login & CRUD| Web
```

## 2. Container / Component Diagram
```mermaid
graph TD
  A[Next.js App Router]
  subgraph UI
    B[Server Components]
    C[Client Components]
  end
  subgraph API
    D[/api/admin/...]
  end
  subgraph Lib
    E[Auth]
    F[Working Hours]
    G[Links Fallback]
    H[R2 Wrapper]
  end
  I[Prisma Client] --> DB[(Postgres)]
  H --> R2[(R2 Bucket)]
  D --> I
  B --> I
  C --> D
  A --> B
  A --> C
```

## 3. Entity Relationship (Mermaid ER)
```mermaid
erDiagram
  STORE ||--o{ CATEGORYMODEL : has
  STORE ||--o{ ITEM : has
  STORE ||--o{ SPECIALITEM : has
  CATEGORYMODEL ||--o{ ITEM : categorizes
  CATEGORYMODEL ||--o{ SPECIALITEM : categorizes
```

## 4. Sequence: Admin Creates Item
```mermaid
sequenceDiagram
  participant Admin
  participant UI as Admin UI
  participant API as /api/admin/items
  participant Prisma
  participant DB as Postgres
  Admin->>UI: Fill form
  UI->>API: POST JSON (name, price, categoryId,...)
  API->>Prisma: create item
  Prisma->>DB: INSERT Item
  DB-->>Prisma: Row
  Prisma-->>API: Item + categoryRef
  API-->>UI: 201 JSON
  UI->>API: GET /items?page=1
```

## 5. Sequence: Public Menu Load
```mermaid
sequenceDiagram
  participant User
  participant Server as Next.js SSR
  participant Prisma
  participant DB as Postgres
  User->>Server: GET /
  Server->>Prisma: find store
  Server->>Prisma: find categories
  Server->>Prisma: find items(include category)
  Server->>Prisma: find active specials
  Prisma->>DB: queries
  DB-->>Prisma: rows
  Prisma-->>Server: data sets
  Server-->>User: HTML (SSR with props)
  User->>User: Hydrate ClientHome
```

## 6. State Diagram: Special Offer Lifecycle
```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Active: dateFrom reached & available=true
  Active --> Expired: dateTo passed
  Draft --> Deleted: admin delete
  Active --> Deleted: admin delete
  Expired --> Deleted: prune (optional)
```

## 7. Activity: Image Update
```mermaid
flowchart TD
  A[Select new image] --> B[Upload /api/admin/upload]
  B --> C[Receive URL]
  C --> D[PATCH item with new imageUrl]
  D --> E[DB update]
  E --> F{Old image?}
  F -->|Yes| G[Delete old R2 object]
  F -->|No| H[Done]
  G --> H[Done]
```

## 8. Deployment Pipeline (Conceptual)
```mermaid
graph LR
  DevPush[Git Push] --> CI[CI Build]
  CI --> Test[Type/Lint/Prisma Validate]
  Test --> Image[Build App Image]
  Image --> Deploy[Deploy to Host]
  Deploy --> Migrate[Run Migrations]
  Migrate --> Serve[Serve Traffic]
```

## 9. Open Status Minute Refresh (Future)
```mermaid
sequenceDiagram
  participant SSR as Server Render
  participant Client
  SSR->>Client: HTML with openStatus(label,nextChangeMinutes)
  Client->>Client: setTimeout(nextChangeMinutes % 60)
  Client->>Client: recompute label at aligned minute
```

---
Use these as a baseline; extend diagrams as new subsystems (orders, multi-tenant, etc.) are added.
