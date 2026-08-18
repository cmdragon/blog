#!/usr/bin/env node
// 构建守卫：仅当 Tailwind 源文件内容变化时才重新编译 CSS。
// 目的：避免每次 `npm run build` 都覆盖 assets/css/tailwind.min.css，
// 从而让 Hugo 的 resources.Fingerprint 哈希保持稳定，
// 避免全站 HTML 的 <head> 引用哈希每次变化、导致 Cloudflare Pages 全量重传。

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cssDir = join(root, "assets", "css");

// 参与编译的所有源文件（tailwind.css 通过 @import 引用了其它 css）
const srcFiles = [
  "tailwind.css",
  "code-highlight.css",
  "markdown.css",
  "image-viewer.css",
].map((f) => join(cssDir, f));

const hashFile = join(cssDir, ".tailwind.src.hash");
const outFile = join(cssDir, "tailwind.min.css");

function hashSources() {
  const h = createHash("sha256");
  for (const f of srcFiles) {
    if (!existsSync(f)) continue;
    h.update(readFileSync(f));
  }
  return h.digest("hex");
}

const current = hashSources();
const previous = existsSync(hashFile) ? readFileSync(hashFile, "utf8").trim() : "";

if (current === previous && existsSync(outFile)) {
  console.log("[build:css] 源文件未变化，跳过 Tailwind 编译（保持 Fingerprint 稳定）");
  process.exit(0);
}

console.log("[build:css] 检测到源文件变化，重新编译 Tailwind CSS ...");
const binPath = join(root, "node_modules", ".bin", "tailwindcss");
const cmd = existsSync(binPath)
  ? `"${binPath}" -i ./assets/css/tailwind.css -o ./assets/css/tailwind.min.css --minify`
  : "npx tailwindcss -i ./assets/css/tailwind.css -o ./assets/css/tailwind.min.css --minify";
execSync(cmd, { cwd: root, stdio: "inherit" });
writeFileSync(hashFile, current);
console.log("[build:css] 编译完成，已更新源哈希基线");
