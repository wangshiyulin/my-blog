---
title: 无需服务器！免费部署静态博客教程：从零部署到 Cloudflare Pages
slug: CloudflarePages-static-blog
date: 2026/08/17 16:49:00
updated: 2026/08/17 16:51:17
categories: 
  - 技术
tags:
  - 网站
description: 从零开始使用 GitHub 与 Cloudflare Pages 部署 Curve 静态博客，并绑定自定义域名，实现自动部署。
---

本文记录从零开始部署 Curve 静态博客的完整流程，作为例子教学，其余博客也可通过此方法部署。

## 一、准备环境

需要准备：

- Node.js
- Git
- GitHub 账号
- Cloudflare 账号
- 一个域名

确认 Node.js 与 Git 已安装：
```
node -v
npm -v
pnpm -v
git -v
```

## 二、创建 Curve 博客
克隆 Curve 项目：
```
git clone https://github.com/imsyy/vitepress-theme-curve
cd vitepress-theme-curve
```

安装依赖：
```
pnpm install
```

启动本地开发环境：
```
pnpm dev
```

浏览器访问终端显示的本地地址，确认博客正常运行。

## 三、配置博客

根据 Curve 项目的配置文件修改：

 - 博客名称
 - 作者信息
 - 网站地址
 - 头像
 - 社交链接
 - 主题样式
 - 文章内容

文章通常放在项目规定的文章目录中，并按照 Curve 的格式编写 Markdown。

完成修改后重新运行：**pnpm dev**, 确认页面和文章正常。

## 四、提交到 GitHub

初始化 Git：
```
git init
git add .
git commit -m "Initial commit"
```

在 GitHub 创建一个新的仓库，然后关联远程仓库：
```
git branch -M main
git remote add origin https://github.com/用户名/仓库名.git
git push -u origin main
```

## 五、连接 Cloudflare Pages

登录 Cloudflare，进入：

**Workers & Pages → Create application → Pages → Connect to Git**

选择 **GitHub**，并授权 Cloudflare 访问仓库。

选择刚刚创建的 Curve 仓库，进入构建配置。

## 六、配置构建

根据 Curve 项目的实际构建方式填写：

构建命令: pnpm build
构建目录: .vitepress/dist

其中 **dist** 必须与 Curve 实际生成的静态文件目录一致。

如果项目没有构建过程，而仓库本身就是完整的静态文件，则可以直接部署对应目录。Cloudflare Pages 支持直接托管静态 HTML、CSS、JavaScript 等文件。

点击 **Save and Deploy**。

等待构建完成后，Cloudflare 会分配一个：
```
https://项目名.pages.dev
```
访问该地址即可查看博客。

## 七、绑定自定义域名

进入：

**Cloudflare Pages → 项目 → Custom domains**

点击 **Set up a custom domain**，输入自己的域名。

如果域名本身已经托管在 Cloudflare，通常可以直接完成 DNS 配置。

完成后即可通过自己的域名访问博客。

## 八、如何更新博客

修改文章或博客配置后：
```
git add .
git commit -m "Update blog"
git push origin main:main
```

Cloudflare Pages 会自动检测 GitHub 仓库更新并重新构建、部署。

因此日常写作只需要：
```
修改文章
↓
git push
↓
Cloudflare 自动部署
```

## 总结

本地负责写作和修改，GitHub 负责保存源码，Cloudflare Pages 负责自动构建和部署。
