/* global self */
import { defineConfig } from "vitepress";
import { createFontHead } from "./theme/utils/fontHead.mjs";
import { createRssFile, createSearchIndex, verifyBuiltRoutes, verifyBuiltAssets } from "./theme/utils/build.mjs";
import { themeConfig as siteThemeConfig } from "./theme/assets/themeConfig.mjs";
import { withPwa } from "@vite-pwa/vitepress";
import { getAllPosts } from "./theme/utils/getPostData.mjs";
import { getAllType, getAllCategories, getAllArchives } from "./theme/utils/postIndexes.mjs";
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

const postBySlug = new Map(postData.map((post) => [post.slug, post]));
const categoriesData = getAllCategories(postData);
const tagsData = getAllType(postData);
const archivesData = getAllArchives(postData);
// 源文件路径只供构建使用，不向每位访客重复序列化本地文件路径。
const publicPostData = postData.map(({ sourcePath: _sourcePath, ...publicFields }) => publicFields);

// 生成本地搜索索引
const searchIndex = await createSearchIndex(postData);

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
    appearance: false,
    // Avoid requesting every visible taxonomy route during initial rendering.
    router: { prefetchLinks: false },
    // Head
    head: [
      ...themeConfig.inject.header,
      ["style", {}, `html { font-size: ${themeConfig.display.fontSize}px; }`],
      ...createFontHead(themeConfig),
    ],
    // sitemap
    sitemap: {
      hostname: themeConfig.siteMeta.site,
    },
    // 主题配置
    themeConfig: {
      ...themeConfig,
      // 必要数据
      postData: publicPostData,
      searchIndexUrl: searchIndex.url,
      tagsData,
      categoriesData,
      archivesData,
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
    // 使用手册、README 与第三方字体更新记录仅供本地查阅，不作为页面发布。
    srcExclude: ["**/README.md", "**/TODO.md", "**/WEBSITE-GUIDE.md", "**/CHANGELOG.md"],
    // transformHead
    transformPageData: async (pageData) => {
      const pageSlug =
        typeof pageData.frontmatter.slug === "string"
          ? pageData.frontmatter.slug.trim().replace(/^\/+|\/+$/g, "")
          : "";
      const post = pageSlug ? postBySlug.get(pageSlug) : null;
      const canonicalPath = post
        ? post.regularPath
        : `/${(pageData.relativePath || "")
            .replace(/^\/?/, "")
            .replace(/index\.md$/, "")
            .replace(/\.md$/, "")}`;
      const canonicalUrl = `${themeConfig.siteMeta.site}${canonicalPath}`.replace(
        /([^:]\/)\/+/,
        "$1",
      );
      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);
    },
    // buildEnd
    buildEnd: async (config) => {
      const checked = verifyBuiltRoutes(config.outDir, postData, categoriesData, tagsData);
      console.log(
        `路由完整性检查通过：${checked.pages} 个页面（${checked.categories} 分类、${checked.tags} 标签）`,
      );
      console.log(`静态资源检查通过：${verifyBuiltAssets(config.outDir)} 个 HTML 页面`);
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
            // Cache visited page chunks lazily instead of fetching every article on install.
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith("/assets/") &&
              /\.(?:m?js|css)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "visited-route-assets",
              expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/vendor\/(?:twikoo|fancybox)\//.test(url.pathname),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "optional-vendor-assets",
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Workbox serializes this function; it must not capture config variables.
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/search-index\.[a-f0-9]{16}\.json$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "versioned-search-index-cache",
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && url.origin === self.location.origin,
            handler: "NetworkFirst",
            options: {
              cacheName: "recent-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && url.pathname === "/search-index.json",
            handler: "NetworkFirst",
            options: {
              cacheName: "search-index-cache",
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith("/images/") &&
              /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(url.pathname),
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
        // 不随文章数量增长预缓存每篇 HTML 与搜索全文 JSON。
        // 站点脚本/样式仍预缓存；页面和搜索 JSON 在访问时进入有上限的运行时缓存。
        // No install-time fetch storm for all route chunks and optional vendors.
        globIgnores: ["**/*.md.*.js", "vendor/twikoo/**", "vendor/fancybox/**", "fonts/lxgw/**"],
        globPatterns: [
          "**/*.{js,css,ico,webmanifest}",
          "vendor/iconfont/*.{woff,ttf}",
          "images/logo/logo.webp",
          "images/logo/logo-100.webp",
          "images/logo/github.webp",
          "images/logo/favicon-*.webp",
        ],
        // 本站是多页面静态站点，不将未预缓存的文章/分类/标签导航回退到首页。
        // VitePress 的 HTML 在页面渲染阶段才生成，不能在 Workbox 扫描阶段预缓存它们。
        // 页面改由上方有容量限制的 NetworkFirst 规则在访问时缓存。
        navigateFallback: null,
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
