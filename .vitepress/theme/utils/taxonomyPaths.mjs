/** 类别/标签的唯一 URL 生成入口，避免各组件自行拼接造成编码不一致。 */
export const assertValidTaxonomyName = (name) => {
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name !== name.trim() ||
    name.endsWith(".") ||
    /[/\\?#%:*<>|"]/.test(name) ||
    [...name].some((char) => char.charCodeAt(0) < 32)
  ) {
    throw new Error(`分类或标签名称不能作为安全路由段：${JSON.stringify(name)}`);
  }
  return name;
};

export const taxonomyHref = (type, name) => {
  if (type !== "tags" && type !== "categories") {
    throw new Error(`未知分类导航类型：${type}`);
  }
  return `/pages/${type}/${encodeURIComponent(assertValidTaxonomyName(name))}`;
};
