import { generateId } from "./commonTools.mjs";
import { globby } from "globby";
import matter from "gray-matter";
import * as fs from "node:fs/promises";

/**
 * 将旧式 #Uxxxx 路径编码还原为 Unicode。
 * 某些旧压缩包在 Windows 解压时会留下这种文件名；标准化后可避免同一文章出现两份路径。
 * @param {string} value 文件路径
 * @returns {string} 标准化后的路径
 */
const decodeLegacyUnicodePath = (value) =>
  value.replace(/#U([0-9A-Fa-f]{4})/g, (_, codePoint) =>
    String.fromCodePoint(parseInt(codePoint, 16)),
  );

/**
 * 获取 posts 目录下所有 Markdown 文件的路径，并处理旧式文件名编码。
 * 如果同一个标准化路径存在两份完全相同的文件，只保留正常 Unicode 路径；
 * 如果内容不同，则主动报错，避免静默覆盖真正不同的文章。
 * @returns {Promise<string[]>} 文件路径数组
 */
const getPostMDFilePaths = async () => {
  try {
    const paths = await globby(["posts/**/*.md"], {
      ignore: ["**/README.md", "**/TODO.md"],
      onlyFiles: true,
    });

    const normalizedMap = new Map();
    for (const item of paths) {
      const normalizedPath = decodeLegacyUnicodePath(item.replace(/\\/g, "/"));
      const existing = normalizedMap.get(normalizedPath);
      if (!existing) {
        normalizedMap.set(normalizedPath, item);
        continue;
      }

      const [existingContent, currentContent] = await Promise.all([
        fs.readFile(existing),
        fs.readFile(item),
      ]);
      if (!existingContent.equals(currentContent)) {
        throw new Error(
          `发现重复文章路径且内容不同：\n- ${existing}\n- ${item}\n标准化路径：${normalizedPath}`,
        );
      }
      if (existing.includes("#U") && !item.includes("#U")) {
        normalizedMap.set(normalizedPath, item);
      }
    }

    return Array.from(normalizedMap.entries())
      .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "zh-CN"))
      .map(([, filePath]) => filePath);
  } catch (error) {
    console.error("获取文章路径时出错:", error);
    throw error;
  }
};

/**
 * 基于 frontMatter 日期降序排序文章
 * @param {Object} obj1 - 第一篇文章对象
 * @param {Object} obj2 - 第二篇文章对象
 * @returns {number} - 比较结果
 */
const compareDate = (obj1, obj2) => obj2.date - obj1.date;
const comparePostPriority = (a, b) => {
  if (a.top && !b.top) {
    return -1;
  }
  if (!a.top && b.top) {
    return 1;
  }
  return compareDate(a, b);
};

/**
 * 获取所有文章，读取其内容并解析 front matter
 * @returns {Promise<Object[]>} - 文章对象数组
 */
export const getAllPosts = async () => {
  try {
    // 获取所有 Markdown 文件的路径
    const paths = await getPostMDFilePaths();
    // 读取和处理每个 Markdown 文件的内容
    const posts = [];
    // 分批并发读取，文章数量很大时避免同时发起数千次文件系统请求。
    for (let start = 0; start < paths.length; start += 32) {
      const batch = await Promise.all(
        paths.slice(start, start + 32).map(async (item) => {
          try {
            // 读取文件内容
            const content = await fs.readFile(item, "utf-8");
            // 文件的元数据
            const stat = await fs.stat(item);
            // 获取文件创建时间和最后修改时间
            const { birthtimeMs, mtimeMs } = stat;
            // 解析 front matter
            const { data } = matter(content);
            const { title, date, categories, description, tags, top, slug } = data;
            const normalizedSlug = typeof slug === "string" ? slug.trim().replace(/^\/+|\/+$/g, "") : "";
            if (!normalizedSlug) {
              throw new Error(`文章缺少有效 slug：${item}`);
            }
            if (normalizedSlug.includes("..") || normalizedSlug.includes("\\") || /[#?]/.test(normalizedSlug)) {
              throw new Error(`文章 slug 含有非法路径：${item} -> ${normalizedSlug}`);
            }
            // 校验并规范化文章日期
            const parsedDate = date ? new Date(date).getTime() : birthtimeMs;
            if (!Number.isFinite(parsedDate)) {
              throw new Error(`文章日期无效：${item} -> ${date}`);
            }
            // 计算文章的过期天数
            const expired = Math.floor((Date.now() - parsedDate) / (1000 * 60 * 60 * 24));
            // 返回文章对象
            return {
              id: generateId(item),
              sourcePath: item.replace(/\\/g, "/"),
              slug: normalizedSlug,
              title: title || "未命名文章",
              date: parsedDate,
              lastModified: mtimeMs,
              expired,
              tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
              categories: Array.isArray(categories) ? categories : categories ? [categories] : [],
              description,
              regularPath: `/${normalizedSlug}`.replace(/\/+/g, "/"),
              top,
            };
          } catch (error) {
            console.error(`处理文章文件 '${item}' 时出错:`, error);
            throw error;
          }
        }),
      );
      posts.push(...batch);
    }
    // 检查 slug 和轻量文章 ID 的唯一性，避免大规模文章时哈希碰撞污染分类/标签索引。
    const idMap = new Map();
    for (const post of posts) {
      if (idMap.has(post.id)) {
        throw new Error(`文章 ID 冲突：${post.sourcePath} 与 ${idMap.get(post.id)}，请调整文章文件名`);
      }
      idMap.set(post.id, post.sourcePath);
    }
    const slugMap = new Map();
    for (const post of posts) {
      const previous = slugMap.get(post.slug);
      if (previous) {
        throw new Error(
          `发现重复 slug：${post.slug}\n- ${previous.sourcePath}\n- ${post.sourcePath}`,
        );
      }
      slugMap.set(post.slug, post);
    }
    // 根据日期排序文章
    posts.sort(comparePostPriority);
    return posts;
  } catch (error) {
    console.error("获取所有文章时出错:", error);
    throw error;
  }
};
