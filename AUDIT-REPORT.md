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
