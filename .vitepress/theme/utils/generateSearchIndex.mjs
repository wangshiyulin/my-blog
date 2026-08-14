import { globby } from "globby";
import matter from "gray-matter";
import fs from "fs-extra";
import path from "path";

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
export const createSearchIndex = async () => {
  try {
    const files = await getPostFiles();

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

        const url = `/${file.replace(/\.md$/, ".html")}`;

        searchIndex.push({
          id: file,
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

    /**
     * 输出搜索索引
     */
    const outputPath =
      path.join(
        publicDir,
        "search-index.json",
      );

    await fs.writeJson(
      outputPath,
      searchIndex,
      {
        spaces: 2,
      },
    );

    console.log(
      `索引 ${searchIndex.length} 篇，${outputPath}`,
    );

    return searchIndex;
  } catch (error) {
    console.error(
      "生成搜索索引失败:",
      error,
    );

    throw error;
  }
};