import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { Feed } from "feed";
import { globby } from "globby";
import matter from "gray-matter";
import * as fs from "node:fs/promises";
import { getAllPosts } from "./getPostData.mjs";
import { assertValidTaxonomyName, taxonomyHref } from "./taxonomyPaths.mjs";

/**
 * 生成 RSS
 * @param {*} config VitePress buildEnd
 * @param {*} themeConfig 主题配置
 */
export const createRssFile = async (config, themeConfig) => {
  // 配置信息
  const siteMeta = themeConfig.siteMeta;
  const hostLink = siteMeta.site;
  const sinceYear = new Date(themeConfig.since).getFullYear();
  // Feed 实例
  const feed = new Feed({
    title: siteMeta.title,
    description: siteMeta.description,
    id: hostLink,
    link: hostLink,
    language: "zh",
    generator: siteMeta.author.name,
    favicon: siteMeta.author.cover,
    copyright: `Copyright © ${sinceYear}-present ${siteMeta.author.name}`,
    updated: new Date(),
  });
  // 加载文章
  const posts = await getAllPosts();
  for (const post of posts) {
    // 仅保留最近 10 篇文章
    if (feed.items.length >= 10) break;
    // 文章信息
    const { title, description } = post;
    const date = new Date(post.date);
    // 添加文章
    feed.addItem({
      title,
      id: `${hostLink}${post.regularPath}`,
      link: `${hostLink}${post.regularPath}`,
      description,
      date,
      // updated,
      author: [
        {
          name: siteMeta.author.name,
          email: siteMeta.author.email,
          link: siteMeta.author.link,
        },
      ],
    });
  }
  // 写入文件
  writeFileSync(path.join(config.outDir, "rss.xml"), feed.rss2(), "utf-8");
};

/**
 * 获取所有文章 Markdown 文件
 */
const getPostFiles = async () => {
  const files = await globby(["**/*.md"], {
    ignore: [
      "node_modules/**",
      "pages/**",
      ".vitepress/**",
      "README.md",
      "TODO.md",
    ],
  });

  return files.filter((file) => file.startsWith("posts/"));
};

/**
 * 清理 Markdown 内容
 *
 * 搜索不需要 Markdown 语法，
 * 所以把一些常见 Markdown 标记去掉。
 */
const cleanMarkdown = (content) => {
  return content
    // 删除 front matter
    .replace(/^---[\s\S]*?---/, "")
    // 删除代码块
    .replace(/```[\s\S]*?```/g, " ")
    // 删除图片
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    // Markdown 链接只保留文字
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // HTML 标签
    .replace(/<[^>]*>/g, " ")
    // 标题符号
    .replace(/^#{1,6}\s+/gm, "")
    // 引用符号
    .replace(/^>\s?/gm, "")
    // 无序列表
    .replace(/^[-*+]\s+/gm, "")
    // 有序列表
    .replace(/^\d+\.\s+/gm, "")
    // 粗体、斜体、删除线
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    // 行内代码
    .replace(/`([^`]+)`/g, "$1")
    // 多余空白
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * 生成搜索索引
 *
 * 索引统一生成到项目根目录的 public/
 *
 * 这样：
 *
 * pnpm dev
 *     ↓
 * public/search-index.json
 *
 * pnpm build
 *     ↓
 * public/search-index.json
 *     ↓
 * .vitepress/dist/search-index.json
 */
export const createSearchIndex = async (posts = null) => {
  try {
    // 与首页/动态路由使用同一批文章源，避免再次扫描时遗漏新增文件。
    const files = posts ? posts.map(post => post.sourcePath) : await getPostFiles();

    const searchIndex = [];

    for (const file of files) {
      try {
        const fileContent = await fs.readFile(
          file,
          "utf-8",
        );

        const { data, content } =
          matter(fileContent);

        const title =
          data.title || "未命名文章";

        const description =
          data.description || "";

        const cleanContent =
          cleanMarkdown(content);

        const slug = typeof data.slug === "string" ? data.slug.trim().replace(/^\/+|\/+$/g, "") : "";
      if (!slug) {
        throw new Error(`文章缺少有效 slug：${file}`);
      }
      const url = `/${slug}`;

        searchIndex.push({
          id: file,
          slug,
          title,
          description,
          content: cleanContent,
          url,
          tags: data.tags || [],
          categories:
            data.categories || [],
        });
      } catch (error) {
        console.error(
          `生成文章搜索索引失败: ${file}`,
          error,
        );
        // 不允许悄悄生成缺少文章的索引；构建失败比发布不完整搜索结果更安全。
        throw error;
      }
    }

    if (posts) {
      const expectedSlugs = new Set(posts.map(post => post.slug));
      const actualSlugs = new Set(searchIndex.map(item => item.slug));
      if (expectedSlugs.size !== actualSlugs.size ||
          [...expectedSlugs].some(slug => !actualSlugs.has(slug))) {
        throw new Error("搜索索引与文章数据不一致，已阻断发布");
      }
    }

    /**
     * 项目根目录
     */
    const projectRoot =
      process.cwd();

    /**
     * 搜索索引目录
     */
    const publicDir =
      path.join(
        projectRoot,
        "public",
      );

    /**
     * 确保 public 目录存在
     */
    await fs.mkdir(publicDir, { recursive: true });

    // The version describes the exact JSON bytes, and is available before Vite copies public/.
    const serialized = JSON.stringify(searchIndex);
    const version = createHash("sha256").update(serialized).digest("hex").slice(0, 16);
    const filename = `search-index.${version}.json`;
    await fs.writeFile(path.join(publicDir, filename), serialized, "utf-8");
    // Keep the previous address available for already-open older clients.
    await fs.writeFile(path.join(publicDir, "search-index.json"), serialized, "utf-8");
    return { url: `/${filename}`, version };
  } catch (error) {
    console.error(
      "生成搜索索引失败:",
      error,
    );

    throw error;
  }
};

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
