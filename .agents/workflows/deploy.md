---
description: Deploy the current revision to GitHub and Vercel.
---
1. Run `git add .` to stage all local iterations.
2. Run `git commit -m "[STABLE] Created major rendition version [RENDITION-NUMBER]"` (e.g., `[RENDITION-9]`).
// turbo
3. Run `git push origin master` (or current branch) to sync with GitHub.
4. Run `git tag -a v1.0.0-rendition-[NUMBER] -m "Manual rendition checkpoint"`.
// turbo
5. Run `git push --tags` to sync version markers.
// turbo
6. Navigate to `suppository/web-app` (if applicable) and run `npx -y vercel --prod` to update the live site at `suppository.vercel.app`.
