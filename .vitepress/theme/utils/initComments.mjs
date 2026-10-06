import { loadScript } from "@/utils/commonTools";

/**
 * Load the site's single supported comment provider: Twikoo.
 */
const initComments = async (theme) => {
  const url = theme?.comment?.twikoo?.js;
  if (!url) throw new Error("Twikoo script URL is not configured");

  await loadScript(url);

  if (typeof window !== "undefined" && typeof window.twikoo === "object") {
    return window.twikoo;
  }

  throw new Error("Twikoo 初始化失败");
};

export default initComments;
