# AWS Builders' Library Course — Build Plan

## Vision
A premium, self-paced web course teaching AWS distributed systems best practices based on 26 Amazon Builders' Library articles. Interactive, beautifully designed, Docker-deployable.

---

## Course Structure (6 Modules, 26 Lessons)

### Module 1: Foundations of Distributed Systems
1. Challenges with Distributed Systems
2. Availability and Beyond — Improving Resilience
3. Resilience Lessons from the Lunch Rush (Mike Haken)
4. Reliability, Constant Work, and a Good Cup of Coffee (Colm MacCarthaigh)

### Module 2: Fault Isolation & Resilience Patterns
5. AWS Fault Isolation Boundaries
6. Static Stability Using Availability Zones
7. Advanced Multi-AZ Resilience Patterns
8. Minimizing Correlated Failures in Distributed Systems
9. Workload Isolation Using Shuffle-Sharding

### Module 3: Traffic Management & Overload Protection
10. Timeouts, Retries, and Backoff with Jitter
11. Making Retries Safe with Idempotent APIs (Malcolm Featonby)
12. Avoiding Overload by Putting the Smaller Service in Control (Joe Magerramov)
13. Avoiding Fallback in Distributed Systems
14. Avoiding Insurmountable Queue Backlogs
15. Caching Challenges and Strategies

### Module 4: Service Dependencies & Multi-Tenancy
16. Dependency Isolation (David Yanacek)
17. Fairness in Multi-Tenant Systems (David Yanacek)
18. Leader Election in Distributed Systems

### Module 5: Safe Deployments & CI/CD
19. Going Faster with Continuous Delivery
20. CI/CD Pipeline as Release Captain
21. Automating Safe, Hands-Off Deployments (Clare Liguori)
22. Ensuring Rollback Safety During Deployments
23. Chaos Engineering on AWS

### Module 6: Observability & Health
24. Implementing Health Checks
25. Building Dashboards for Operational Visibility (John O'Shea)
26. Instrumenting Distributed Systems for Operational Visibility

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Content | MDX (generated from PDF text extracts) |
| Animations | Framer Motion |
| Progress | localStorage-based tracking |
| Quizzes | JSON-driven, per-lesson |
| Diagrams | Mermaid.js for architecture visuals |
| Docker | Multi-stage Node.js build |

## Key Features (Premium Feel)
- **Progress tracking** — per-lesson completion, module progress bars, overall % complete
- **Interactive quizzes** — 3-5 questions per lesson with explanations
- **Architecture diagrams** — Mermaid.js visuals for each pattern
- **Key takeaways** — highlighted summary cards per lesson
- **Dark/light mode** — professional theme toggle
- **Responsive** — mobile-friendly layout
- **Certificate page** — completion summary (all modules done)
- **Search** — full-text search across all lessons

---

## Team & Agent Roles

### PM Agent (Project Manager)
**Responsibilities:**
1. Parse all 26 PDF text files and produce structured course content:
   - Extract key concepts, definitions, and examples from each article
   - Write lesson MDX files with: intro, main content (broken into sections), key takeaways, further reading
   - Create 3-5 quiz questions per lesson (JSON)
   - Define Mermaid.js diagram descriptions for architecture patterns
2. Create the course metadata (`course.json`) — modules, lessons, ordering, descriptions
3. Write marketing copy for the landing page

**Output files:**
- `content/course.json` — course structure metadata
- `content/modules/[module-slug]/[lesson-slug].mdx` — 26 lesson files
- `content/quizzes/[lesson-slug].json` — 26 quiz files
- `content/diagrams.md` — Mermaid diagram definitions per lesson

### Developer Agent
**Responsibilities:**
1. Scaffold Next.js 15 app with App Router
2. Build page routes:
   - `/` — landing page (marketing, module overview)
   - `/course` — course dashboard (modules, progress)
   - `/course/[module]/[lesson]` — lesson page (MDX renderer, quiz, diagram)
   - `/certificate` — completion certificate
3. Implement components:
   - `LessonRenderer` — MDX content display with typography
   - `Quiz` — interactive quiz with scoring and explanations
   - `ProgressTracker` — localStorage-based progress
   - `ModuleCard`, `LessonNav`, `Sidebar` — navigation
   - `MermaidDiagram` — renders Mermaid.js charts
   - `SearchDialog` — full-text lesson search
   - `ThemeToggle` — dark/light mode
4. Docker setup:
   - `Dockerfile` (multi-stage: deps → build → production)
   - `docker-compose.yml`
   - `.dockerignore`
5. Styling: professional design system, consistent spacing, readable typography

### QA Agent
**Responsibilities:**
1. Verify all 26 lessons render without errors
2. Verify all quizzes load and score correctly
3. Test progress tracking (complete lesson → progress updates)
4. Test responsive layout (mobile/tablet/desktop)
5. Test Docker build and run (`docker compose up` works)
6. Test dark/light mode toggle
7. Verify no broken links or missing content
8. Lighthouse audit (performance, accessibility)

---

## Execution Order

```
Phase 1 — Scaffold (Developer)
  ├── Initialize Next.js project, install deps
  ├── Set up Tailwind v4 + shadcn/ui
  ├── Create folder structure and Docker files
  └── Build core layout (header, sidebar, footer)

Phase 2 — Content Generation (PM, parallel with Phase 1)
  ├── Read all 26 PDF text files
  ├── Generate course.json metadata
  ├── Generate 26 MDX lesson files
  ├── Generate 26 quiz JSON files
  └── Define Mermaid diagrams

Phase 3 — Feature Development (Developer, after Phase 1 & 2)
  ├── MDX rendering pipeline
  ├── Lesson pages with navigation
  ├── Quiz component
  ├── Progress tracking
  ├── Search
  ├── Landing page
  ├── Certificate page
  └── Theme toggle

Phase 4 — QA (QA, after Phase 3)
  ├── Content verification
  ├── Functional testing
  ├── Docker build test
  ├── Responsive + accessibility audit
  └── Bug reports → Developer fixes

Phase 5 — Polish (Developer + QA)
  └── Fix issues, final Docker verification
```

---

## Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  course:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

---

## Success Criteria
- All 26 lessons accessible and beautifully rendered
- Quizzes functional with instant feedback
- Progress persists across sessions
- `docker compose up` launches the full course
- Lighthouse performance > 90, accessibility > 90
- Mobile-responsive design
- Professional look that justifies a paid course
