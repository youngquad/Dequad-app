# Preview environment notes
- 2026-06: Metro crashed in a loop with ENOSPC (inotify watcher limit 12288, shared on the node; sysctl not permitted).
  Fix: `CI="true"` added to the frontend program environment in /etc/supervisor/conf.d/supervisord.conf.
  Consequence: **frontend has NO hot reload** — run `sudo supervisorctl restart frontend` after editing frontend files (~60-75s to rebuild).
- UI tests: /app/tests_ui/*.py (Playwright, mobile viewport 390x844). Platform screenshot tool is unreliable on RN-web; prefer these.
