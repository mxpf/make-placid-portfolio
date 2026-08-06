import { spawn } from "node:child_process";

const build = spawn("vinext", ["build"], {
  env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" },
  stdio: "inherit",
});

const exitCode = await new Promise((resolve, reject) => {
  build.once("error", reject);
  build.once("exit", resolve);
});

if (exitCode !== 0) process.exit(exitCode ?? 1);

await import("./prune-responsive-source-images.mjs");
