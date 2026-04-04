---
description: Create a git tag to save a major rendition or milestone.
---
1. Run `git add .` to stage all current changes.
2. Run `git commit -m "[STABLE] Created major rendition version"` (or a context-specific message).
3. Determine next tag name (e.g. `v1.0.0-rendition-1`).
4. Run `git tag -a [tag_name] -m "Manual rendition checkpoint"`.
// turbo
5. If a remote exists, run `git push --tags`.
