import { execSync } from "node:child_process";

function hasCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!hasCommand("bun")) {
  process.exit(0);
}

try {
  execSync("npx update-browserslist-db@latest --update-db", { stdio: "inherit" });
} catch {
  process.exit(0);
}
