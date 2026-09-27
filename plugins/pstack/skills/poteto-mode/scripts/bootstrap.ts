import { existsSync } from "node:fs";
import { join } from "node:path";

const scriptsDirectory = import.meta.dir;
const commanderPackagePath = join(
  scriptsDirectory,
  "node_modules",
  "commander",
  "package.json"
);

export function ensureDependenciesInstalled(): void {
  if (existsSync(commanderPackagePath)) return;

  throw new Error(
    "P-stack script dependencies are not installed. After reviewing package.json and bun.lock, explicitly run `bun install --production --frozen-lockfile` in " +
      scriptsDirectory
  );
}
