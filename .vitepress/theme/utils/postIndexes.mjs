/**
 * 文章只在 postData 中保留完整对象，分类/标签/归档仅储存文章 ID。
 * 防止随文章数量和标签数量增长而重复序列化整篇文章元数据。
 */
export const getAllType = (posts) => groupPosts(posts, (post) => post.tags);
export const getAllCategories = (posts) => groupPosts(posts, (post) => post.categories);

const groupPosts = (posts, select) => {
  const result = Object.create(null);
  for (const post of posts) {
    // 去重避免文章重复标签/分类造成统计虚高。
    const groups = [...new Set(select(post) || [])];
    for (const group of groups) {
      if (!group || typeof group !== "string") continue;
      const entry = result[group] ??= { count: 0, articles: [] };
      entry.count++;
      entry.articles.push(post.id);
    }
  }
  return result;
};

export const getAllArchives = (posts) => {
  const data = Object.create(null);
  for (const post of posts) {
    if (!Number.isFinite(post.date)) continue;
    const year = new Date(post.date).getFullYear().toString();
    const entry = data[year] ??= { count: 0, articles: [] };
    entry.count++;
    entry.articles.push(post.id);
  }
  return {
    data,
    year: Object.keys(data).sort((a, b) => Number(b) - Number(a)),
  };
};

/** 按给定 ID 顺序解析文章；缺失 ID 忽略，保持分页稳定。 */
export const resolvePostIds = (postById, ids) =>
  (ids || []).map((id) => postById.get(id)).filter(Boolean);
