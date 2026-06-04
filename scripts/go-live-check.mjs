#!/usr/bin/env node
/**
 * Pre-publish / go-live checklist for @getmesslo/messlo-mcp
 *
 * Usage:
 *   MESSLO_API_KEY=xxx node scripts/go-live-check.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: pkgRoot,
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  return r.status === 0;
}

function header(title) {
  console.log(`\n=== ${title} ===\n`);
}

let failed = false;

header("1. Sync API docs bundle");
if (!run("npm", ["run", "sync-docs"])) failed = true;

header("2. Smoke tests (offline)");
if (!run("npm", ["test"])) failed = true;

header("3. Live E2E tests");
if (process.env.MESSLO_API_KEY?.trim()) {
  if (!run("npm", ["run", "test:e2e"])) failed = true;
} else {
  console.log(
    "SKIP: MESSLO_API_KEY not set — export your Integration Tools API key to run live E2E.\n"
  );
}

header("4. Package contents (dry run)");
if (!run("npm", ["pack", "--dry-run"])) failed = true;

header("Result");
if (failed) {
  console.error("\nGo-live check FAILED. Fix issues above before publishing.\n");
  process.exit(1);
}

console.log(`
Go-live check PASSED.

Next steps:
  1. npm version patch   # or minor, as appropriate
  2. npm publish --access public
  3. Verify: npx -y @getmesslo/messlo-mcp@latest (with MESSLO_API_KEY in MCP env)
  4. Restart Messlo MCP in Cursor

GitHub CI: add repository secret MESSLO_API_KEY for automated E2E on PRs.
`);
