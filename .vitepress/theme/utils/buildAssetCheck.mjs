import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

// Fail the build if generated HTML points at absent local scripts/styles.
// Deployment/CDN 503s still need investigation at the hosting layer.
export const verifyBuiltAssets = (outDir) => {
  const missing = new Set();
  let pages = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith(".html")) {
        pages++;
        const html = readFileSync(file, "utf8");
        for (const tag of html.match(/<(?:script|link)\b[^>]*>/g) || []) {
          const value = tag.match(/(?:src|href)=["']([^"']+)["']/)?.[1];
          if (!value?.startsWith("/") || value.startsWith("//")) continue;
          const relative = decodeURIComponent(value.split(/[?#]/)[0].slice(1));
          if (!/\.(?:m?js|css|woff2?)$/i.test(relative)) continue;
          if (!existsSync(path.join(outDir, relative))) missing.add(relative);
        }
      }
    }
  };
  walk(outDir);
  if (missing.size) throw new Error(`构建资源缺失，已阻断部署：\n${[...missing].join("\n")}`);
  return pages;
};
