import { loadScript } from "@/utils/commonTools.mjs";

/**
 * Load the site's single supported comment provider: Twikoo.
 */
const initComments = async (theme) => {
  const url = theme?.comment?.twikoo?.js;
  if (!url) throw new Error("Twikoo script URL is not configured");

  return new Promise((resolve, reject) => {
    loadScript(url, {
      callback: () => {
        if (typeof window !== "undefined" && typeof window.twikoo === "object") {
          resolve(window.twikoo);
        } else {
          reject(new Error("Twikoo 初始化失败"));
        }
      },
    });
  });
};

export default initComments;
