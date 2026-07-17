<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Project Rules

- **Proactive Automation**: Always attempt to execute fixes, database migrations, deployments, and scripts programmatically using the tools available (such as direct PostgreSQL connections, Vercel deployments, or CLI commands) without asking the user to perform manual steps, unless absolutely impossible.
- **Vercel & Online Configuration**: The application runs entirely on Vercel; ensure all configurations (like proxy.ts) are optimized for serverless production environments.
