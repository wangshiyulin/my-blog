// Shared across Search component mounts; raw index/Fuse objects are not reactive.
let cachedUrl = "";
let cachedPromise = null;

export const normalizeText = (value) => String(value || "").replace(/\s+/g, "").toLowerCase();

export const loadSearchEngine = (url = "/search-index.json") => {
  if (cachedPromise && cachedUrl === url) return cachedPromise;
  cachedUrl = url;
  const pending = (async () => {
    const [response, { default: Fuse }] = await Promise.all([fetch(url), import("fuse.js")]);
    if (!response.ok) throw new Error(`搜索索引加载失败: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("搜索索引格式不正确");
    const normalized = data.map((item) => ({
      ...item,
      _title: normalizeText(item.title),
      _description: normalizeText(item.description),
      _content: normalizeText(item.content),
      _tags: normalizeText(Array.isArray(item.tags) ? item.tags.join(" ") : item.tags),
      _categories: normalizeText(Array.isArray(item.categories) ? item.categories.join(" ") : item.categories),
    }));
    return new Fuse(normalized, {
      includeScore: true,
      shouldSort: true,
      threshold: 0.2,
      minMatchCharLength: 1,
      ignoreLocation: true,
      keys: [
        { name: "_title", weight: 4 },
        { name: "_description", weight: 2 },
        { name: "_tags", weight: 2 },
        { name: "_categories", weight: 2 },
        { name: "_content", weight: 1 },
      ],
    });
  })();
  cachedPromise = pending;
  void pending.catch(() => {
    if (cachedPromise === pending) {
      cachedPromise = null;
      cachedUrl = "";
    }
  });
  return pending;
};

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
})[character]);

const keywordRegex = (keyword) => {
  const normalized = normalizeText(keyword);
  if (!normalized) return null;
  const pattern = [...normalized].map((character) => character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*");
  return new RegExp(pattern, "giu");
};

export const highlightText = (text, keyword) => {
  const source = String(text || "");
  const regex = keywordRegex(keyword);
  if (!regex) return escapeHtml(source);
  let result = "";
  let offset = 0;
  for (const match of source.matchAll(regex)) {
    result += escapeHtml(source.slice(offset, match.index));
    result += `<mark>${escapeHtml(match[0])}</mark>`;
    offset = match.index + match[0].length;
  }
  return result + escapeHtml(source.slice(offset));
};

export const getContentSnippet = (content, keyword) => {
  const source = String(content || "");
  // Match against the original text to retain the true offset, including whitespace.
  const match = keywordRegex(keyword)?.exec(source);
  const start = match ? Math.max(0, match.index - 80) : 0;
  const end = match ? Math.min(source.length, match.index + match[0].length + 120) : Math.min(source.length, 180);
  return `${start ? "..." : ""}${source.slice(start, end)}${end < source.length ? "..." : ""}`;
};
