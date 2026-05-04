# Liah React

React + TypeScript + Vite frontend for the Liah UI.

## Requirements

- Docker
- Docker Compose

## Run Project

Build and start the lightweight frontend container:

```bash
docker compose up --build frontend
```

Start it after the image already exists:

```bash
docker compose up frontend
```

Open:

```bash
http://127.0.0.1:5189/
```

Stop containers:

```bash
docker compose down
```

## Run Tests

The e2e test container is separate from the dev container. It includes Playwright browser dependencies, so the frontend container stays light.

Build the test image:

```bash
docker compose --profile test build e2e
```

Run e2e tests:

```bash
docker compose --profile test run --rm e2e
```

Pipeline command:

```bash
docker compose --profile test run --rm e2e
```

## Common Commands

```bash
docker compose up --build frontend
docker compose up frontend
docker compose down
docker compose --profile test build e2e
docker compose --profile test run --rm e2e
```

## Notes

- E2E tests use mocked API responses, so tests do not depend on the live HubDiet API.
- Do not run Playwright inside the frontend container. Browser tooling is intentionally only in the `e2e` container.
- If Docker uses old dependencies, rebuild the relevant image with `docker compose build frontend` or `docker compose --profile test build e2e`.
