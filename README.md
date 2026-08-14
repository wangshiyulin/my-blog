> 主题fork自https://github.com/imsyy/vitepress-theme-curve，但是经过在下的重构，保留了自己需要的，删除了很多不必要的组件和代码，并简化了一下逻辑

# 青鸾小栈

这是「青鸾小栈」的博客源码，基于 VitePress 构建，并使用 Vue 组件实现自定义主题。

## 本地开发

需要 Node.js 20+。

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm preview
```

## 目录

- `posts/`：博客文章
- `pages/`：独立页面
- `.vitepress/`：VitePress 配置、主题和构建脚本
- `public/`：静态资源

文章的 frontmatter 至少应包含：

```yaml
---
title: 文章标题
date: 2026/08/14 12:00:00
categories:
  - 技术
tags:
  - 软件
description: 文章简介
---
```

博客地址：https://qingluanx.com
