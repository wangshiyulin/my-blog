import { loadScript, loadCSS } from "./commonTools.mjs";

const initFancybox = (themeConfig) => {
  const noop = () => {};
  if (typeof window === "undefined") return noop;
  const option = themeConfig?.fancybox;
  const container = document.getElementById("page-content");
  if (!option?.enable || !container?.querySelector("[data-fancybox]")) return noop;
  let cancelled = false;
  let bound = false;
  void Promise.all([loadCSS(option.css), loadScript(option.js)]).then(() => {
    if (cancelled || !container.isConnected) return;
    if (!window.Fancybox?.bind) throw new Error("图片灯箱资源不可用");
      window.Fancybox.bind(container, "[data-fancybox]", {
          hideScrollbar: true,
          Carousel: {
            transition: "slide",
          },
          Hash: false,
          Toolbar: {
            display: {
              left: ["infobar"],
              middle: [
                "zoomIn",
                "zoomOut",
                "toggle1to1",
                "rotateCCW",
                "rotateCW",
                "flipX",
                "flipY",
              ],
              right: ["slideshow", "thumbs", "close"],
            },
          },
          l10n: {
            PANUP: "上移",
            PANDOWN: "下移",
            PANLEFT: "左移",
            PANRIGHT: "右移",
            ZOOMIN: "放大",
            ZOOMOUT: "缩小",
            TOGGLEZOOM: "切换缩放级别",
            TOGGLE1TO1: "切换缩放级别",
            ITERATEZOOM: "切换缩放级别",
            ROTATECCW: "逆时针旋转",
            ROTATECW: "顺时针旋转",
            FLIPX: "水平翻转",
            FLIPY: "垂直翻转",
            FITX: "水平适应",
            FITY: "垂直适应",
            RESET: "重置",
            TOGGLEFS: "切换全屏",
            CLOSE: "关闭",
            NEXT: "上一个",
            PREV: "下一个",
            MODAL: "使用 ESC 键关闭",
            ERROR: "发生了错误，请稍后再试",
            IMAGE_ERROR: "找不到图像",
            ELEMENT_NOT_FOUND: "找不到 HTML 元素",
            AJAX_NOT_FOUND: "载入 AJAX 时出错: 未找到",
            AJAX_FORBIDDEN: "载入 AJAX 时出错: 被阻止",
            IFRAME_ERROR: "加载页面出错",
            TOGGLE_ZOOM: "切换缩放级别",
            TOGGLE_THUMBS: "切换缩略图",
            TOGGLE_SLIDESHOW: "切换幻灯片",
            TOGGLE_FULLSCREEN: "切换全屏",
            DOWNLOAD: "下载",
          },
        });
    bound = true;
  }).catch((error) => {
    if (!cancelled) console.error("图片灯箱初始化失败", error);
  });
  return () => {
    cancelled = true;
    if (bound) {
      window.Fancybox?.unbind(container);
      window.Fancybox?.close();
      bound = false;
    }
  };
};

export default initFancybox;
