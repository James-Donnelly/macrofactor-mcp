# Personal Cloudflare deployment

This checkout is based on `chaotix345/macrofactor-mcp`. Keep `upstream` pointing at that
repository and `origin` pointing at your fork so fixes can be contributed later.

## Local files

- `wrangler.personal.jsonc`: your account, D1 binding, explicit workers.dev settings,
  and no scheduled PR-alert job. Ignored by Git.
- `.local/secrets.json`: the MCP and iPhone ingestion credentials. Private, ignored,
  and never suitable for a commit, issue, screenshot, or chat message.
- `.local/connection.json`: deployment address and timezone metadata.
- `.local/iPhone Setup.private.md`: personalized iPhone setup steps and the required
  ingestion credential. Keep this file private.
- `.local/pushcut-webhook-url.txt`: optional place to put the Pushcut `LogFood`
  notification webhook for installation as a Worker secret. Keep it private.

## Commands

```sh
npm ci
npm test
npm run type-check
npm run deploy -- --config wrangler.personal.jsonc
node scripts/check-personal.mjs
```

Use the personal account in `wrangler.personal.jsonc` when deploying. For `cf` API
commands, explicitly select that same personal account rather than inheriting another
project's account. Discover `cf` commands with anonymous action/resource searches first.

The live check uses bearer authentication and makes no food-logging calls. It checks
queue status through the read-only MCP tool and never consumes `/pending`.

## Changes from upstream

- Required MCP authentication, with a standard bearer-token endpoint in addition to
  the existing capability URL.
- Header-based authentication for iPhone queue endpoints; old query-token Shortcuts
  remain compatible.
- Empty queue replies use a valid bodyless HTTP 204 response.
- Dependency refresh, including the maintained SheetJS distribution.
- Melbourne calendar dates for this deployment.
- MCP instructions distinguish a queued food request from a confirmed MacroFactor log.

Food entries land in MacroFactor only after the iPhone Shortcut completes. Never treat
`sent` or `queued_only` as confirmation that a food was logged. Check the dispatch
acknowledgement, and keep user-reported consumption distinct from bridge delivery status.

For an upstream contribution, isolate the generally useful changes from personal
timezone/configuration changes and submit a focused pull request after reviewing the diff.
