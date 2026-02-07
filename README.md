# Weavy.ai Next.js Project

This is the codebase for the **Weavy.ai** web application, built with **Next.js 16**, **Tailwind CSS v4**, and **Prisma**. It features a modern, high-fidelity landing page and a node-based workflow editor for AI tasks, utilizing **Trigger.dev** for background processing and **Clerk** for authentication.

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Authentication:** [Clerk](https://clerk.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Animations:** [GSAP](https://greensock.com/gsap) & [Lenis](https://github.com/studio-freight/lenis) (Smooth Scrolling)
- **Background Jobs:** [Trigger.dev v3](https://trigger.dev/) (Worker logic for long-running tasks)
- **Workflow Editor:** React Flow / [@xyflow/react](https://reactflow.dev/)
- **Media Processing:** `fluent-ffmpeg`, `sharp`
- **Generative AI:** Google Generative AI SDK

## 📂 Project Structure

- **/app**: Next.js App Router pages and API endpoints.
  - `page.tsx`: The main landing page, featuring dynamic sections (Hero, Models, Tools, Outcome, Workflow).
- **/components**: Reusable React components.
- **/trigger**: Background job definitions for Trigger.dev.
  - `crop-image.ts`: Job for cropping images.
  - `extract-frame.ts`: Job for extracting frames from video (uses ffmpeg).
  - `generate-content.ts`: Job for generating AI content.
- **/prisma**: Database schema definition.
  - `schema.prisma`: Defines `Workflow`, `WorkflowRun`, and `WorkflowStep` models.
- **/lib**: Utility functions and shared logic.
- **/public**: Static assets.

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v20+ recommended)
- PostgreSQL Database
- Trigger.dev Account (for background jobs)
- Clerk Account (for authentication)

### 1. Clone & Install

```bash
git clone <repository-url>
cd weavy-nextjs
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory (copy from `.env.example` if available) and add the following keys:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/weavy_db"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Trigger.dev
TRIGGER_SECRET_KEY=...
```

### 3. Database Setup

Initialize the database schema with Prisma:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

Start the Next.js development server:

```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 5. Run Trigger.dev (Background Jobs)

To run the background jobs locally:

```bash
npx trigger.dev@latest dev
```

## ✨ Key Features

- **Dynamic Landing Page:** A pixel-perfect, responsive landing page with smooth scroll animations (Lenis) and interactive elements.
- **Workflow Builder:** A node-based editor allowing users to create and configure AI workflows.
- **Video & Image Processing:** automated tasks for media manipulation using server-side workers.
- **Workflow History:** Tracks execution history, status, and outputs for all workflow runs.

## 📜 Scripts

- `npm run dev`: Starts the Next.js dev server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint.
- `npm run postinstall`: Generates Prisma client (runs automatically after install).
