---
description: Automatically initialize a new project with Git and (optional) GitHub integration.
---
1. Create the project directory (if not already existing).
2. Run `git init` in the project directory.
3. Create a `.gitignore` (standard for the project type).
4. Run `git add .` and `git commit -m "[INIT] Automated project startup"`.
// turbo
5. If `gh auth status` is successful, run `gh repo create --private --source=. --push`.
