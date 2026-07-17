# Project Rules

- **No Local Servers**: Do not run the application on localhost or run `npm run dev`/`next dev`. The project runs on Vercel.
- **File System**: Only edit files within the desktop project folder (`c:\Users\compt\Desktop\nexx-top`).
- **Online-Only Configuration & Vercel Compatibility**:
  - Always write code and configuration assuming deployment on Vercel (Production/Preview).
  - Do not hardcode or default to `localhost` URLs or configurations (e.g., auth redirects, API endpoints, webhooks).
  - Ensure compatibility with Serverless environments (no persistent in-memory state or background loops that rely on a persistent process).
  - Validate that code will successfully compile/build under production conditions (`next build`), avoiding build-time dynamic runtime assumptions.
