> 原主题 fork 自 [vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)，在此基础上进行了重构与自定义。

# 青鸾小栈

这是「青鸾小栈」的博客源码，基于 VitePress 构建，使用 Vue 组件实现自定义主题，通过 Pinia 管理页面状态。

博客地址：[qingluanx.com](https://qingluanx.com)

文章编写、正文扩展、站点配置和日常维护的详细说明见 [网站使用手册](./WEBSITE-GUIDE.md)。

## 本地开发

需要 Node.js 22.13+、pnpm 11.25.0。在源码根目录运行：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的本地地址即可预览网站。修改文章、页面或主题代码后，开发预览通常会自动刷新。

代码检查与生产构建：

```bash
pnpm lint:check
pnpm build
pnpm preview
```

构建产物位于 `.vitepress/dist/`。部署时使用完整构建产物，不能直接上传源码目录，也不要混用不同构建的 HTML 与资源文件。

## 显示与背景

显示配置集中在 `.vitepress/theme/assets/themeConfig.mjs` 的 `display` 中：

```js
display: {
  fontSize: 16,
  backgroundImage: "/images/background/fantasy-cosmos.webp",
  backgroundEnabled: true,
},
```

- `fontSize`：全站基础字号。
- `backgroundImage`：全站静态背景图片地址。
- `backgroundEnabled`：每次打开网站时是否默认显示背景。

中控台可以临时开启或关闭背景，并切换亮暗模式。开启背景时统一使用深色，亮暗切换按钮不可用；关闭背景后，可以切换亮暗模式。外层底色随亮暗模式切换，浅色模式与内容面板使用一致的米白色底色。

这些选择在本次访问内生效，刷新后按源码中的默认配置初始化。当前仅支持静态图片，不加载 HTML 壁纸、动画或视频。替换图片后，可以给链接增加版本参数，例如 `?v=3`，帮助更新浏览器缓存。

首页欢迎横幅保持桌面 300px、手机 240px 的高度，尺寸在 `Banner.vue` 中维护，不再通过 `bannerHeight` 配置。首页一言按需获取，站点描述作为备用文案。

个性化面板、自定义右键菜单、横幅封面图与横幅底部补充区域均已移除。

## 玻璃视觉与主题

`.vitepress/theme/style/main.scss` 集中维护深浅色变量、玻璃表面和全站交互效果；`post.scss` 维护正文排版与 Markdown 扩展样式。

文章列表避免逐卡片使用大范围背景模糊，模糊效果主要用于桌面弹窗及小范围交互区域。支持系统的减少动态偏好，并在浏览器支持时响应减少透明效果偏好。

全局消息采用顶部玻璃胶囊展开、提示后收回的效果。正文中的长文件路径允许换行，代码块保留内部横向滚动。

## 文章与正文功能

博客文章放在 `posts/` 中，可以使用子文件夹整理。文章开头建议填写：

```yaml
---
title: 文章标题
slug: unique-post-slug
date: 2026/10/25 12:00:00
categories:
  - 技术
tags:
  - 软件
description: 文章简介
top: false
---
```

`slug` 必须全站唯一，它决定文章公开地址，例如 `/unique-post-slug`。分类和标签由文章配置生成，不由文章所在文件夹决定。`top: true` 表示置顶，其余文章按日期倒序排列。

当前保留的正文功能包括：

- 普通 Markdown 标题、列表、引用、链接、图片、表格和代码高亮。
- 图片懒加载与灯箱，点击图片可以放大、切换同页图片。
- 普通提示块 `::: tip`、`::: info`、`::: warning`、`::: danger`。
- GitHub 风格提示块，例如 `> [!NOTE]`。
- Obsidian Admonition 的 `ad-*` 提示块兼容语法。
- 标签切换、时间轴和折叠详情。

上述提示块使用共用样式，因此不同写法可能显示相似的效果。具体语法与使用限制见网站使用手册。

圆点标记、属性扩展、按钮容器和正文内容卡片已移除；演示页面及演示图片不再保留。全站正常使用的玻璃卡片不受影响。

## 导航、友链与站点功能

主要设置位于 `.vitepress/theme/assets/themeConfig.mjs`：

- `siteMeta`：网站名称、描述、域名与作者信息。
- `nav`、`navMore`：顶部导航及左侧更多内容。
- `aside`：作者简介、社交链接、文章目录、热门标签与站点数据。
- `search`：全站搜索入口。
- `comment`：Twikoo 评论服务。
- `footer`：页脚链接与“下一站”列表。

友情链接数据在 `.vitepress/theme/assets/linkData.mjs` 中维护，申请规则位于 `pages/link.md`。友链需要手动添加，评论申请不会自动写入源码。

关于页面的卡片内容主要位于 `.vitepress/theme/views/About.vue`。评论审核、通知与反垃圾等设置需要在 Twikoo 后端管理环境中配置。

网站还保留文章归档、分类与标签分页、随机文章、相关推荐、手机菜单、返回顶部、联系弹窗及 RSS 订阅。

## 页脚“下一站”

在主题配置的 `footer.activity.items` 中填写单一事项列表：

```js
items: [
  { text: "事项名称" },
  { text: "另一项计划", link: "/pages/about" },
],
```

`link` 可以省略。空列表显示“暂无公开事项”，不区分“正在做”和“接下来”。

## 目录

| 路径 | 用途 |
| --- | --- |
| `posts/` | 博客文章 |
| `pages/` | 关于、友链、隐私政策等独立页面，以及分类标签模板 |
| `page/`、`page.md` | 首页分页相关模板与兼容入口 |
| `.vitepress/config.mjs` | VitePress 构建、路由、SEO、PWA 与资源检查 |
| `.vitepress/theme/` | 主题组件、配置、样式与工具 |
| `public/` | 图片、字体、浏览器端依赖与托管配置 |
| `WEBSITE-GUIDE.md` | 网站功能与维护手册，不作为网页发布 |

依赖、缓存、构建产物、搜索索引与自动生成的类型声明不需要纳入源码交付；开发和构建时会重新生成。必要的字体分片、浏览器端第三方资源、原始图片和许可文件应保留。

## 加载与缓存优化

- 保留霞鹜文楷。首页与常用界面字形使用约 100 KB 的合并字体并提前加载，其余字符通过完整字形回退资源补充。资源位于 `public/fonts/lxgw/optimized/`，字体加载声明位于 `.vitepress/theme/utils/fontHead.mjs`。新增文章无需重新生成字体才能构建。
- 图标规则加入页面，图标字体使用 `font-display: swap`；自定义字体和图标样式地址仍可在主题配置中修改。
- 全文搜索界面与索引按需加载，索引由文章源码生成。修改文章后应重新构建，不能直接编辑生成的搜索 JSON。
- 关闭 VitePress 批量链接预取，页面脚本按访问加载。PWA 缓存部分核心资源及已访问资源，不代表首次访问就能离线浏览全部文章。
- 构建检查文章、分类、标签路由，并检查 HTML 引用的本地资源是否存在。这些检查不能代替线上 CDN、防火墙及外部服务检查。
- `public/_headers` 提供静态资源与 Service Worker 的缓存配置。使用 Cloudflare Pages 时，应确认控制台额外设置的规则没有覆盖预期响应头。

线上出现旧页面或资源加载异常时，先确认部署版本与产物完整性，再检查浏览器、Service Worker 和 CDN 缓存。若仍有 503 等错误，需要核查托管平台的安全事件、限流及缓存规则。本地构建通过不等于线上服务已验证，也不代表新的 PageSpeed 分数。

## 隐私、广告与许可

隐私政策位于 `pages/privacy.md`，文章版权协议位于 `pages/cc.md`，代码许可见根目录 `LICENSE`。

当前保留 `public/ads.txt`，但它本身不会展示广告。启用 AdSense 前，需要核对自己的发布商 ID、后台实际提供的接入代码、适用地区的同意管理要求，并同步更新隐私政策中的广告状态。普通提示胶囊不能代替同意管理平台，政策文字也不能保证广告审核通过。

代码、文章、字体、图标和图片的许可分别遵守对应声明；素材放入源码目录不代表自动适用代码许可证。
