---
title: Cloudflare Workers 怎么部署 Twikoo 评论系统？极简完整教程
slug: Cloudflare-Twikoo
date: 2026/08/09 00:25:00
updated: 2026/08/09 00:25:00
categories: 
  - 技术
tags:
  - 网站
description: 在Cloudflare Worker上部署Twikoo评论系统
---


Curve主题支持Twikoo评论系统，同时非Curve主题也推荐使用Twikoo。一来是因为简洁美观，二来使用 Cloudflare 部署的方案，也很方便。

以下是基于 Twikoo + Cloudflare D1 数据库搭建免费评论区的流程。

## 部署Twikoo

首先 [Fork](https://github.com/wangshiyulin/twikoo-cloudflare) 博主的仓库，输入名称，点击 <strong>Create fork</strong> 创建自己的仓库。

## 创建D1 SQL数据库

1. 登录 Cloudflare，点击左侧 <strong>存储与数据库</strong> - <strong>D1 SQLite数据库</strong>，点击<strong>创建数据库</strong>按钮，输入<strong>twikoo</strong>作为数据库名，提供位置提示可以选择亚太地区，之后点击<strong>创建</strong>。

![][1]

2. 创建成功后回到列表页面，可以找到对应红框中的 <strong>UUID</strong> 复制出来。

![][2]

3. 然后点击<strong>twikoo</strong>数据库，进入控制台，依次输入下面的内容并执行以完成建表：
> 创建 comment 主表：
```
CREATE TABLE IF NOT EXISTS comment (
  _id TEXT NOT NULL,
  uid TEXT NOT NULL,
  nick TEXT NOT NULL,
  mail TEXT NOT NULL,
  mailMd5 TEXT NOT NULL,
  link TEXT NOT NULL,
  ua TEXT NOT NULL,
  ip TEXT NOT NULL,
  ipRegion TEXT NOT NULL DEFAULT '',
  master INTEGER NOT NULL,
  url TEXT NOT NULL,
  href TEXT NOT NULL,
  comment TEXT NOT NULL,
  pid TEXT NOT NULL,
  rid TEXT NOT NULL,
  isSpam INTEGER NOT NULL,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL,
  like TEXT NOT NULL,
  top INTEGER NOT NULL,
  avatar TEXT NOT NULL,
  PRIMARY KEY (url, created DESC)
);
```
> 建立索引
```
CREATE INDEX IF NOT EXISTS idx_comment_created ON comment (created DESC);
CREATE INDEX IF NOT EXISTS idx_comment_ip_created ON comment (ip, created DESC);
```
> config配置表
```
CREATE TABLE IF NOT EXISTS config (value TEXT NOT NULL);
INSERT INTO config (value) SELECT '' WHERE NOT EXISTS (SELECT 1 FROM config);
```
> counter浏览统计表
```
CREATE TABLE IF NOT EXISTS counter (
  url TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  time INTEGER NOT NULL,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
```

![][3]

4. 等待数据库表创建完成，进入Github仓库，修改根目录中下的 <strong>wrangler.toml</strong> 文件中的 <strong>database_id</strong> 值。

![][4]

5. 输入 <strong>/tables</strong>，如果输出 comment、config、counter 三张表，代表建表完成。

## 创建R2存储桶
> [!WARNING]
> 这个需要绑定银行卡才能激活，R2存储桶是用来存储图床的，如果不需要，请务必查看[不需要R2存储桶](#不需要R2存储桶)\
> 此部分引用自[blog.pe.ee](https://blog.p0.ee/2024/12/15/linux/%E5%88%A9%E7%94%A8cloudflare%E6%90%AD%E5%BB%BAtwikoo%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F/index.html)

1. 点击左侧栏 <strong>R2 对象存储</strong>，点击 <strong>创建存储桶</strong>，填入 <strong>twikoo</strong> 作为存储桶名称，点击 <strong>创建存储桶</strong> 按钮。

![][5]

2. 创建成功后后回到列表页面，可以看到刚才创建的存储桶。

![][6]

3. 再点击 <strong>twikoo</strong> 进入存储桶，点击设置页签，在公开访问点击<strong>连接域</strong>， 输入你想设置的域名比如 twikoo.r2.example.org。

![][7]

4. 然后点击继续，再点击 <strong>连接域</strong> 就会回到设置页面，这时你会看到你设置的域状态为 <strong>正在初始化</strong>，过几分钟再次刷新状态就变成了 活动

![][8]

5. 接下来将刚才的域名写入Github仓库根目录下的 <strong>wrangler.toml</strong> 文件中。

![][9]


## 不需要R2存储桶

如果不需要R2存储桶，但并未进行任何更改，下一步中会导致Worker部署失败。

那么请直接<strong>注释或删除</strong>掉下面截图中这一部分，

![][9]

## 部署Cloudflare Worker
1. Cloudflare 控制台左侧找到：<strong>Workers和Pages</strong>

2. 点击 <strong>创建应用程序</strong> -> <strong>Continue with to Git</strong>

3. 选择刚才fork的仓库，下一步，保持默认配置，点击部署

4. 等待部署完成后，点击 <strong>概述</strong>

![][10]

5. 若查看到以下内容，即创建成功
```
{
    "code": 100,
    "message": "Twikoo 云函数运行正常，请参考 https://twikoo.js.org/frontend.html 完成前端的配置",
    "version": "1.6.40"
}
```

## 绑定域名
找到<strong>域</strong> - <strong>添加域名</strong>

![][11]

添加完成后域名就和部署的 Worker 绑定完毕

## 配置博客设置
1. 打开".vitepress/theme/assets/themeConfig.mjs"文件

2. 找到twikoo配置，填入域名：

![][12]

3. 修改完提交到 Github, Cloudflare Pages 会自动部署，等待部署完毕，即可在博文下方看到评论区。

## 配置评论模块
点击评论区的小齿轮图标，首次进入需要设置密码，设置完就会进入管理面板。

之后根据配置项说明进行配置即可。

如果需要图床功能，点开 <strong>隐私</strong>，在 <strong>IMAGE_CDN</strong> 处输入 <strong>cloudflare</strong>，点击 <strong>保存</strong> 启用图片上传功能。

如不需要图床功能，在 <strong>SHOW_IMAGE</strong> 中填入 false 即可。

## 阻止机器人评论
1. 发表评论时可以使用 <strong>Cloudflare Turnstile</strong> 来阻止机器人，如需要启用，首先在cloudflare左侧栏找到 <strong>Turnstile</strong> - <strong>手动添加小组件</strong>
![][13]

2. 输入小组件名称和主机名，点击 <strong>创建</strong> 即可
![][14]

3. 返回上一页，进入刚才创建的小组件，点击查看 <strong>Turnstile密钥</strong>

4. 复制这两个密钥，打开 <strong>twikoo管理面板</strong> - <strong>配置管理</strong> - <strong>反垃圾</strong>，将这两个密钥分别填写入 <strong>TURNSTILE_SITE_KEY</strong> 和 <strong>TURNSTILE_SECRET_KEY</strong>，之后点击 <strong>保存</strong> 关闭面板即可。
![][15]

![][16]

## Twikoo版本管理
1. 如果在twikoo管理面板弹出下面的警告，表明 <strong>前端（博客页面嵌入的 Twikoo 脚本）版本</strong> 和 <strong>后端 Cloudflare Workers 云函数版本</strong> 不相同。
![][17]

2. 首先进入Github twikoo-cloudflare仓库页面，编辑根目录下的 <strong>package.json</strong> 文件，将 <strong>"twikoo-func"</strong> 后的版本修改为最新版本
![][18]

3. 之后打开Github的博客仓库根目录下 <strong>".vitepress/theme/assets/themeConfig.mjs"</strong> 文件，将红框内的版本号改为最新版本
![][19]

## 建议
1. 建议使用隐藏管理面板入口，不要暴露管理面板的配置按钮。
2. 使用密码管理器设置一个复杂的密码，不要让别人猜出来。


[1]: /images/uploads/2026/08/2026-08-08_23-17-43.webp
[2]: /images/uploads/2026/08/2026-08-08_23-23-54.webp
[3]: /images/uploads/2026/08/2026-08-08_23-31-04.webp
[4]: /images/uploads/2026/08/2026-08-08_23-34-57.webp
[5]: /images/uploads/2026/08/2026-08-08_23-46-50.webp
[6]: /images/uploads/2026/08/2026-08-08_23-47-30.webp
[7]: /images/uploads/2026/08/2026-08-08_23-48-01.webp
[8]: /images/uploads/2026/08/2026-08-08_23-48-38.webp
[9]: /images/uploads/2026/08/2026-08-08_23-53-19.webp
[10]: /images/uploads/2026/08/2026-08-09_00-03-41.webp
[11]: /images/uploads/2026/08/2026-08-09_00-09-41.webp
[12]: /images/uploads/2026/08/2026-08-09_00-13-18.webp
[13]: /images/uploads/2026/08/2026-08-09_13-20-34.webp
[14]: /images/uploads/2026/08/2026-08-09_13-21-36.webp
[15]: /images/uploads/2026/08/2026-08-09_13-24-58.webp
[16]: /images/uploads/2026/08/2026-08-09_13-27-26.webp
[17]: /images/uploads/2026/08/2026-08-09_13-30-02.webp
[18]: /images/uploads/2026/08/2026-08-09_13-33-59.webp
[19]: /images/uploads/2026/08/2026-08-09_13-38-02.webp