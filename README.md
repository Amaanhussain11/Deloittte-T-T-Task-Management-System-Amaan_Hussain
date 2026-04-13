# Task Management System

A full-stack task management application built with **Spring Boot**, **React (Vite)**, **MySQL**, **Docker**, and **GitHub Actions**.

---

## Table of contents

1. [Architecture](#architecture)
2. [Tech stack](#tech-stack)
3. [Design decisions](#design-decisions)
4. [ERD](#erd)
5. [API reference](#api-reference)
6. [Running locally (without Docker)](#running-locally-without-docker)
7. [Running with Docker Compose](#running-with-docker-compose)
8. [Environment variables](#environment-variables)
9. [Sample users & quick-start](#sample-users--quick-start)
10. [Known limitations & next steps](#known-limitations--next-steps)

---

## Architecture

```
Browser (React SPA)
       │  HTTP/JSON + Bearer token
       ▼
Spring Boot REST API  ──►  MySQL 8 (taskdb)
  ├── Security layer (JWT filter)
  ├── Controllers  (HTTP ↔ DTO)
  ├── Services     (business rules)
  └── Repositories (JPA / Hibernate)
```

Docker Compose runs three containers on a shared internal network:
`teamflow-frontend` → `teamflow-backend` → `teamflow-db`

---

## Tech stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Axios, Tailwind CSS             |
| Backend    | Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Auth       | JWT (JJWT 0.12)                                 |
| Database   | MySQL 8.0                                       |
| Docs       | SpringDoc OpenAPI / Swagger UI                  |
| DevOps     | Docker, Docker Compose, GitHub Actions          |

---

## Design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth strategy | Stateless JWT | Works naturally with REST; no session affinity needed |
| First admin | First registered user → ADMIN | Simple bootstrap; document the email used |
| Delete rule | ADMIN only | Prevents accidental data loss by regular users |
| Update rule | Creator OR assignee (USER); any task (ADMIN) | Follows least-privilege; both roles have legitimate need |
| Unassigned tasks | Allowed (`assignedTo` nullable) | Tasks may be created before an owner is known |
| JSON casing | camelCase throughout | Consistent with React/JS conventions |

---

## ERD

```
┌─────────────────────────┐        ┌──────────────────────────────────┐
│         users           │        │              tasks                │
├─────────────────────────┤        ├──────────────────────────────────┤
│ id          BIGINT (PK) │◄───┐   │ id           BIGINT (PK)         │
│ name        VARCHAR     │    │   │ title        VARCHAR NOT NULL     │
│ email       VARCHAR UQ  │    │   │ description  TEXT                 │
│ password_hash VARCHAR   │    │   │ status       ENUM(TODO,           │
│ role        ENUM        │    │   │               IN_PROGRESS, DONE)  │
│ is_active   BOOLEAN     │    ├───│ assigned_to  BIGINT (FK, NULL)    │
│ created_at  DATETIME    │    └───│ created_by   BIGINT (FK NOT NULL) │
└─────────────────────────┘        │ created_at   DATETIME             │
                                   │ updated_at   DATETIME             │
                                   └──────────────────────────────────┘
```

---

## API reference

Swagger UI available at: **`http://localhost:8080/swagger-ui.html`**

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register. First user → ADMIN, rest → USER |
| POST | `/api/auth/login` | Public | Returns JWT |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | ADMIN | List all users |
| GET | `/api/users/{id}` | Any | Get user by ID |
| PATCH | `/api/users/{id}/deactivate` | ADMIN | Soft-deactivate account |
| PATCH | `/api/users/{id}/activate` | ADMIN | Re-activate account |

### Tasks — `/api/tasks`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/tasks` | Any | Create task |
| GET | `/api/tasks` | Any | List tasks (filter: `?status=TODO&assignedTo=1`) |
| GET | `/api/tasks/{id}` | Any | Get task by ID |
| PUT | `/api/tasks/{id}` | Any* | Update task |
| DELETE | `/api/tasks/{id}` | ADMIN | Delete task |

*Update: ADMIN can update any task; USER can only update tasks they created or are assigned to.

### HTTP status codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation error (structured field errors returned) |
| 401 | Unauthenticated (missing or invalid JWT) |
| 403 | Forbidden (authenticated but insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Unexpected server error |

---

## Running locally (without Docker)

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8 running locally (or via Docker: `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=taskdb mysql:8`)
- Node 20+

### Backend

```bash
cd backend

# Set env vars (or export them in your shell)
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/taskdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=root
export JWT_SECRET=dGVhbWZsb3ctc2VjcmV0LWtleS10aGF0LWlzLWxvbmctZW5vdWdoLWZvci1IUzI1Ng==

mvn spring-boot:run
# API ready at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### Frontend

```bash
cd frontend
cp .env.example .env          # set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
# App at http://localhost:5173
```

---

## Running with Docker Compose

```bash
# 1. Copy and edit secrets
cp .env.example .env

# 2. Start everything (builds images on first run)
docker compose up --build

# 3. Services available at:
#    Frontend → http://localhost:4173
#    Backend  → http://localhost:8080
#    Swagger  → http://localhost:8080/swagger-ui.html

# 4. Tear down
docker compose down           # keep data
docker compose down -v        # wipe MySQL volume too
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | `changeme` | MySQL root password |
| `SPRING_DATASOURCE_URL` | *(Compose sets this)* | Full JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | `changeme` | DB password |
| `JWT_SECRET` | *(base64 key)* | **Change in production.** Min 32-char decoded key |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime (24 h) |

> **Security note:** Never commit `.env` to Git. Generate a production JWT secret with `openssl rand -base64 32`.

---

## Sample users & quick-start

There are no pre-seeded users. Follow these steps after starting the app:

```bash
# 1. Register the admin (first registration always → ADMIN)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@teamflow.dev","password":"admin123"}'

# 2. Register a regular user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Dev","email":"jane@teamflow.dev","password":"jane123"}'

# 3. Login to get a token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teamflow.dev","password":"admin123"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# 4. Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Set up CI pipeline","description":"Configure GitHub Actions","assignedToId":2}'

# 5. List tasks filtered by status
curl http://localhost:8080/api/tasks?status=TODO \
  -H "Authorization: Bearer $TOKEN"
```

Or use the **Swagger UI** at `/swagger-ui.html` — click **Authorize** and paste your Bearer token.

---

## Known limitations & next steps

| Area | Current state | Next step |
|---|---|---|
| Auth | Single JWT access token (24 h) | Add refresh tokens |
| Pagination | Not implemented | Add `?page=0&size=20&sort=createdAt,desc` via Spring `Pageable` |
| Search | No full-text search | Add MySQL `FULLTEXT` index on `title`/`description` |
| Audit log | None | Add `@EntityListeners(AuditingEntityListener.class)` + audit table |
| CORS | Wildcard `*` in dev | Lock to frontend origin in production |
| Admin bootstrap | First-register-wins | Consider seeding a fixed admin via `data.sql` or a CLI flag |
| Cloud deploy | Local / Docker only | GKE deployment with Workload Identity Federation |
# Deloittte-T-T-Task-Management-System-Amaan_Hussain
