# AWS Course

An interactive course on AWS reliability, fault isolation, and distributed systems patterns.

![AWS Masterclass home page](public/screenshot.png)

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- npm v10+

## Local Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads on file changes.

## Production Build

```bash
npm run build
npm start
```

## Docker

Build and run with Docker Compose (recommended for production):

```bash
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

To run in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

### Docker (manual)

```bash
docker build -t aws-course .
docker run -p 3000:3000 aws-course
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint |
