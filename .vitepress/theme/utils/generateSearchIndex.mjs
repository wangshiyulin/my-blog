import { globby } from "globby";
import matter from "gray-matter";
import fs from "fs-extra";
import path from "path";
import { createHash } from "node:crypto";

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
    await fs.ensureDir(publicDir);

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