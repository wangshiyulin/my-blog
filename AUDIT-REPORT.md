# 青鸾小栈源码审计与修复记录

审计日期：2026-10-06

## 已修复

1. 修复不蒜子站点统计：改为 JSONP 请求官方接口，并保留 `counter.busuanzi.icodeq.com` 备用接口；避免重复加载统计脚本，并兼容 VitePress SPA 路由切换。
2. 修复 Twikoo 文章评论数长期为 0：通过 Twikoo `getCommentsCount` 获取当前文章评论数。
3. 修复 Twikoo 动态脚本加载竞态：同一 URL 的并发加载共享 Promise；加载失败后允许重试。
4. 修复快速评论与正文评论区重复 DOM ID 和全局输入框选择导致的互相干扰。
5. 修复元素平滑滚动在已滚动页面中的坐标计算错误。
6. 修复文章 frontmatter 中单值 `tags` / `categories` 导致的数据结构不稳定。
7. 修复可选 CSS 加载失败后永久进入“已加载”状态的问题。
8. 关闭未使用的 VitePress 数学公式支持；VitePress 的 `markdown.math: true` 依赖 `markdown-it-mathjax3`，当前项目没有数学公式内容，因此不保留该可选依赖。
9. 删除未引用且本身存在 ESM `__dirname` 问题的 `.vitepress/init.mjs`。
10. 删除已被 ESLint 10 flat config 取代的旧 `.eslintrc.js`。
11. 删除原项目中不完整/过期的 `package-lock.json` 与 `pnpm-lock.yaml`，避免锁文件与 `package.json` 不一致。
12. 修正一处 Markdown NumPy 示例中的错误链接语法。

## 依赖调整

- `@types/node`: 26.6.3 -> 26.6.4
- `sass`: 1.105.0 -> 1.105.1
- Node.js 最低版本：22.12 -> 22.13（与 ESLint 10 的运行要求匹配）
- 其余依赖在本次审计时未发现需要为升级而冒险改变兼容区间的情况。
- `public/vendor/twikoo/twikoo.all.min.js` 保持 1.6.44。当前站点 Cloudflare Twikoo 后端仍使用 `twikoo-func` 1.6.x 兼容线，因此没有仅升级前端 bundle，避免前后端版本错配。

## 静态验证

- JavaScript / MJS / CJS 语法检查：0 个失败
- Vue `<script>` 代码块语法检查：0 个失败
- 本地/别名导入检查：66 个引用，0 个断裂
- package.json / 工作区配置解析：通过
- Markdown 本地引用检查：0 个断链
- 文章数量：41
- 当前搜索索引：41 条，ID 与文章源文件一一对应，无重复
- Busuanzi JSONP 逻辑：通过本地模拟 DOM 冒烟测试

## 无法在当前执行环境完成的验证

当前执行环境没有可用的 pnpm 二进制，并且无法连接 npm registry，因此不能在这里重新执行完整的 `pnpm install`、`pnpm lint`、`pnpm build`。因此不能把“构建通过”作为已经验证的事实。代码已完成静态与无网络逻辑检查；下载到本地后应先执行 `pnpm install`，再执行 `pnpm lint:check` 和 `pnpm build`。


## 2026-10-06 访问统计二次修复

本次根据 `imsyy/vitepress-theme-curve` 原始实现重新核对访问统计逻辑。原主题的 `SiteData.vue` 使用 `loadScript()` 动态加载 `https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js`，页面只负责提供 `busuanzi_value_site_pv` 和 `busuanzi_value_site_uv` 两个 DOM ID。

上一版自定义 `busuanzi.mjs` 直接拼接 JSONP 请求，已删除。现在恢复为主题原有的 `loadScript()` 机制，并使用 Vercount 的兼容脚本 `https://events.vercount.one/js`。Vercount 官方明确说明其兼容不蒜子 span 标签，并采用更现代的 POST 统计链路。

为适配 VitePress SPA，本次增加当前路由去重：同一路由只初始化一次，路由变化时重新加载统计脚本，避免一次路由变化触发重复统计。


## 2026-10-10 全面审计与修复

本次以压缩包内实际文件为唯一基准（不再沿用此前“已修复”的结论），并用包内附带的 2026-10-06 构建产物 `.vitepress/dist` 做交叉验证。

### 逻辑缺陷

1. 搜索弹窗色彩失效：`Search.vue` 中 8 处 `--main-text-color` / `--main-text-second-color` 在全站从未定义，导致搜索框、结果标题与摘要文字颜色回退继承。现改为主题实际定义的 `--main-font-color` / `--main-font-second-color`。
2. 首页分页导航失效：首页场景 `routePath` 为空字符串，在 `/page/2` 点击“上一页”“1”或使用快速跳转到第 1 页时实际执行的是 `router.go('')`。`Pagination.vue` 现统一把空路径归一为 `/`。
3. 倒计时开关失效：`theme.aside.countDown.enable` 是死配置，`Aside/index.vue` 无条件渲染 `<Countdown />`，现补上 `v-if`，与同级其它挂件一致。
4. CSS 变量名拼错：`main.scss` 中 `var(--main-scrolling-bar)` 改为 `var(--main-scrollbar-bar)`。
5. `RightMenu.vue` 关闭菜单时把 `commentCopyData` 由 `false` 复位为 `null`，与其声明类型一致。

### 构建与 SEO

6. `AUDIT-REPORT.md` 与 `public/fonts/lxgw/CHANGELOG.md` 此前会被渲染成公开页面（`/AUDIT-REPORT.html`、`/public/fonts/lxgw/CHANGELOG`）并写入 sitemap。`config.mjs` 的 `srcExclude` 现增加 `**/AUDIT-REPORT.md` 与 `**/CHANGELOG.md`，两个文件仍保留在仓库供本地查阅。
7. `page.md`、`page/index.md`、`page/1.md`、`pages/index.md` 是重定向占位页，此前 `/page`、`/page/1`、`/page/`、`/pages/` 四条 URL 会进入 sitemap。现加 `sitemap: false` 与 `robots: noindex,follow`；跳转行为与文件本身均保持不变。
8. `page/[num].md` 未改动，`/page/2` 至 `/page/6` 仍正常参与索引。

### 仓库清理

9. 删除 `.vitepress/init.mjs`：无任何引用，且 ESM 下使用 `__dirname`，一旦加载必然报错。
10. 删除 `.eslintrc.js` 与 `.eslintignore`：ESLint 10 已使用 `eslint.config.js` 扁平配置接管。
11. 删除根目录重复的 `ads.txt`：只有 `public/ads.txt` 会随构建输出。
12. 删除过期且与 pnpm 冲突的 `package-lock.json`，仅保留 `pnpm-lock.yaml`。
13. 删除遗留死组件 `References.vue`（整个模板被注释、无任何引用），并同步清理 `.vitepress/components.d.ts` 中对应的一行。
14. 移除 `buildEnd` 中重复的 `createSearchIndex()` 调用；配置加载阶段的调用已保证索引在复制进 `dist` 之前生成，输出完全一致。

### 静态验证

- JavaScript / MJS / Vue `<script>` 语法解析：66 个文件，0 个失败
- 本地/别名导入检查：110 个引用，0 个断裂
- 已删除文件的残留引用：0 个（仅本文件的历史正文中提及）
- 文章数量：41，slug 唯一性校验通过

### 无法在当前执行环境完成的验证

本次执行环境无网络，且 pnpm 在该沙箱下因权限限制无法运行（`EPERM` realpath），因此未能执行 `pnpm install`、`pnpm lint:check`、`pnpm build`。构建与视觉回归比对需在本地完成，比对基准为仓库内保留的 `.vitepress/dist`。


### 2026-10-10 追加：移除 HarmonyOS Sans 字体

按站点所有者要求，“全站字体”只保留系统字体与霞鹜文楷两种，HarmonyOS Sans 的全部配置与代码已删除：

- `themeConfig.mjs`：`externalResources.fonts` 中的 `hmos` 条目（`https://s1.hdslb.com/.../regular.css`）已移除，仅保留 `lxgw`。
- `Settings.vue`：个性化配置中的“HarmonyOS Sans”选项已移除。
- `main.scss`：`html.hmos` 的 `--main-font-family` 覆盖规则已删除。
- `App.vue`：字体资源按需加载的判断由 `hmos || lxgw` 收敛为仅 `lxgw`；`changeSiteFont()` 中不再移除 `hmos` 类，并在开头增加校验——除 `lxgw` 外的任何取值一律回落到 `system`，以兼容浏览器里可能残留的 `fontFamily: "hmos"` 持久化配置。

`pnpm-lock.yaml` 中的 `openharmony-arm64` 条目是 esbuild / rollup 等依赖的平台绑定，与字体无关，未做改动。
