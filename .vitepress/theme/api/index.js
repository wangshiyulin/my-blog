/**
 * 获取首页一言。
 */
export const getHitokoto = async () => {
  const response = await fetch("https://v1.hitokoto.cn");
  if (!response.ok) throw new Error(`一言请求失败: ${response.status}`);
  return response.json();
};
