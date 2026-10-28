import { readFileSync } from "node:fs";
import { fontCritical } from "../assets/fontCritical.mjs";

// Build-time only: inline tiny icon rules and the common glyph face, not the full font CSS.
export const createFontHead = (theme) => {
  const icons = readFileSync(
    new URL("../../../public/vendor/iconfont/iconfont.css", import.meta.url),
    "utf8",
  )
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1");
  const fontCss = theme.externalResources.fonts.lxgw;
  const iconHead =
    theme.externalResources.iconfontCss === "/vendor/iconfont/iconfont.css"
      ? [["style", {}, icons]]
      : [["link", { rel: "stylesheet", href: theme.externalResources.iconfontCss }]];
  if (fontCss !== "/fonts/lxgw/lxgwwenkaiscreen.css") {
    return [...iconHead, ["link", { rel: "stylesheet", href: fontCss }]];
  }
  return [
    [
      "link",
      { rel: "preload", href: fontCritical.href, as: "font", type: "font/woff2", crossorigin: "" },
    ],
    ["style", {}, fontCritical.css + fontCritical.supplementalCss],
    ...iconHead,
    [
      "link",
      { id: "site-full-font", rel: "stylesheet", href: fontCritical.fallbackCss, media: "print" },
    ],
    ["script", { src: "/vendor/site-font-loader.v1.js", defer: "" }],
    ["noscript", {}, `<link rel="stylesheet" href="${fontCritical.fallbackCss}">`],
  ];
};
