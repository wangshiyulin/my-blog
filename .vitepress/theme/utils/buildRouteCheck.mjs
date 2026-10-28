import { existsSync } from "node:fs";
import path from "node:path";
import { assertValidTaxonomyName, taxonomyHref } from "./taxonomyPaths.mjs";

/**
 * VitePress 可能只警告并跳过加载失败的动态路由。
 * 因此在静态 HTML 生成后强制核验文章、分类和标签：缺一项即阻断部署。
 */
export const expectedRoutes = (posts, categories, tags) => {
  const routes = new Map();
  const register = (route, description) => {
    if (routes.has(route)) {
      throw new Error(`路由冲突 ${route}：${routes.get(route)} 与 ${description}`);
    }
    routes.set(route, description);
  };
  for (const route of ["/", "/pages/categories", "/pages/tags", "/pages/archives"]) {
    register(route, "固定页面");
  }
  for (const post of posts) {
    if (!post.regularPath?.startsWith("/") || post.regularPath.includes("..")) {
      throw new Error(`文章 URL 非法: ${post.slug}`);
    }
    register(post.regularPath, `文章 ${post.slug}`);
  }
  for (const label of Object.keys(categories)) {
    register(taxonomyHref("categories", assertValidTaxonomyName(label)), `分类 ${label}`);
  }
  for (const label of Object.keys(tags)) {
    register(taxonomyHref("tags", assertValidTaxonomyName(label)), `标签 ${label}`);
  }
  return [...routes.keys()];
};

export const verifyBuiltRoutes = (outDir, posts, categories, tags, fileExists = existsSync) => {
  const routes = expectedRoutes(posts, categories, tags);
  const missing = [];
  for (const route of routes) {
    // URL 与输出文件系统名称有区别：HTML 文件使用原始 Unicode 文件名。
    const relative = route === "/" ? "index.html" : `${decodeURIComponent(route.slice(1))}.html`;
    if (!fileExists(path.join(outDir, relative))) missing.push(route);
  }
  if (missing.length) {
    throw new Error(`构建完成但发现 ${missing.length} 个缺失的页面，已阻断部署：\n${missing.slice(0, 20).join("\n")}`);
  }
  return { pages: routes.length, categories: Object.keys(categories).length, tags: Object.keys(tags).length };
};
