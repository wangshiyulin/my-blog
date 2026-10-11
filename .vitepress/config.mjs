/* global self */
import { defineConfig } from "vitepress";
import { themeConfig as siteThemeConfig } from "./theme/assets/themeConfig.mjs";
import { createRssFile } from "./theme/utils/generateRSS.mjs";
import { createSearchIndex } from "./theme/utils/generateSearchIndex.mjs";
import { withPwa } from "@vite-pwa/vitepress";
import {
  getAllPosts,
  getAllType,
  getAllCategories,
  getAllArchives,
} from "./theme/utils/getPostData.mjs";
import markdownConfig from "./theme/utils/markdownConfig.mjs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import path from "path";
import { fileURLToPath } from "url";

// 获取全局数据
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const postData = await getAllPosts();
if (!postData.length) {
  throw new Error("未发现任何文章，请检查 posts 目录。");
}

// 获取主题配置
const themeConfig = structuredClone(siteThemeConfig);

// 文章源文件路径 -> 公开 URL 的映射。文章 URL 只由 frontmatter.slug 决定。
const postRouteMap = new Map(
  postData.map((post) => [post.sourcePath, `${post.regularPath.slice(1)}.md`]),
);
if (postRouteMap.size !== postData.length) {
  throw new Error("检测到重复的文章 slug，请确保每篇文章的 slug 唯一。");
}

// 生成本地搜索索引
await createSearchIndex();

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    title: themeConfig.siteMeta.title,
    description: themeConfig.siteMeta.description,
    lang: themeConfig.siteMeta.lang,
    // 简洁的 URL
    cleanUrls: true,
    // 文章目录只用于文件组织，公开 URL 不再依赖 posts 下的分类目录/文件名。
    rewrites(id) {
      const normalizedId = id.replace(/\\/g, "/");
      return postRouteMap.get(normalizedId) || id;
    },
    // 最后更新时间戳
    lastUpdated: true,
    // 主题
    appearance: "dark",
    // Head
    head: themeConfig.inject.header,
    // sitemap
    sitemap: {
      hostname: themeConfig.siteMeta.site,
    },
    // 主题配置
    themeConfig: {
      ...themeConfig,
      // 必要数据
      postData: postData,
      tagsData: getAllType(postData),
      categoriesData: getAllCategories(postData),
      archivesData: getAllArchives(postData),
    },
    // markdown
    markdown: {
      lineNumbers: true,
      toc: { level: [1, 2, 3] },
      image: {
        lazyLoading: true,
      },
      config: (md) => markdownConfig(md, themeConfig),
    },
    // 构建排除
    // AUDIT-REPORT.md 与第三方字体包自带的 CHANGELOG.md 仅供本地查阅，不作为页面发布。
    srcExclude: ["**/README.md", "**/TODO.md", "**/AUDIT-REPORT.md", "**/CHANGELOG.md"],
    // transformHead
    transformPageData: async (pageData) => {
      const pageSlug =
        typeof pageData.frontmatter.slug === "string"
          ? pageData.frontmatter.slug.trim().replace(/^\/+|\/+$/g, "")
          : "";
      const post = pageSlug ? postData.find((item) => item.slug === pageSlug) : null;
      const canonicalPath = post
        ? post.regularPath
        : `/${(pageData.relativePath || "").replace(/^\/?/, "").replace(/index\.md$/, "").replace(/\.md$/, "")}`;
      const canonicalUrl = `${themeConfig.siteMeta.site}${canonicalPath}`.replace(/([^:]\/)\/+/, "$1");
      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);
    },
    // buildEnd
    buildEnd: async (config) => {
      await createRssFile(config, themeConfig);
    },
    // vite
    vite: {
      plugins: [
        AutoImport({
          imports: ["vue", "vitepress"],
          dts: ".vitepress/auto-imports.d.ts",
        }),
        Components({
          dirs: [".vitepress/theme/components", ".vitepress/theme/views"],
          extensions: ["vue", "md"],
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          dts: ".vitepress/components.d.ts",
        }),
      ],
      resolve: {
        // 配置路径别名
        alias: {
          "@": path.resolve(__dirname, "./theme"),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["legacy-js-api"],
          },
        },
      },
      // 服务器
      server: {
        port: 9877,
      },
      // 构建
      build: {
        minify: "terser",
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"],
          },
        },
      },
    },
    // PWA
    pwa: {
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // 页面与应用核心资源预缓存；文章图片和可选字体按需缓存。
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && url.pathname.startsWith("/images/"),
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && url.pathname.startsWith("/fonts/lxgw/"),
            handler: "CacheFirst",
            options: {
              cacheName: "optional-font-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
        // 预缓存文章页面、应用资源和搜索索引；不预缓存整批文章图片与可选字体子集。
        globPatterns: [
          "**/*.{js,css,html,ico,json,webmanifest}",
          "vendor/iconfont/*.{woff,ttf}",
          "images/logo/logo.webp",
          "images/logo/logo-100.webp",
          "images/logo/github.webp",
          "images/logo/favicon-*.webp",
        ],
        // 排除路径
        navigateFallbackDenylist: [/^\/sitemap.xml$/, /^\/rss.xml$/, /^\/robots.txt$/],
      },
      manifest: {
        name: themeConfig.siteMeta.title,
        short_name: themeConfig.siteMeta.title,
        description: themeConfig.siteMeta.description,
        display: "standalone",
        start_url: "/",
        theme_color: "#fff",
        background_color: "#efefef",
        icons: [
          {
            src: "/images/logo/favicon-32x32.webp",
            sizes: "32x32",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-96x96.webp",
            sizes: "96x96",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-256x256.webp",
            sizes: "256x256",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
    },
  }),
);
