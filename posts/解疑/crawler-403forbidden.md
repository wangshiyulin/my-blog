---
title: 搜索引擎抓取网站出现 403 Forbidden 错误排查与解决
slug: crawler-403forbidden
date: 2026/03/03 12:44:00
updated: 2026/05/21 13:29:27
status: publish
author: 往世雨
categories: 
  - 解疑
tags: 
  - 网站
desc: 搜索引擎爬取网站出现403Forbidden解决方法
---


博主网站使用了Cloudflare的CDN（开启了DNS记录里的小橙云）

如果没开，可以去查找其他解决方法了

直入主题。

---

如果Webmaster Tools的网站扫描，

和Search Console的网址检测中出现403Forbidden，

即搜索引擎的爬取被服务器拦截，

尝试**关闭cloudflare的小橙云**

等待几分钟后重新让Google和Bing搜索引擎爬取

---

博主在排除后，发现以下因素不影响搜索引擎爬取：

（后面是博主的配置，可以作为参考）

服务器安全组（防火墙），放行全部IPv4的443端口即可

1panel的WAF和防火墙，正常打开

Cloudflare的AI Crawl Control无影响，我关闭了Managed robots.txt，自己在网址根目录写了一个robots.txt

---

基本上只要关闭cloudflare代理就行，

不过这会暴露服务器真实IP，

可以在提交网站地图sitemap.xml时短暂关闭，之后开启。

可以肯定原因在cf代理上，

至于其根本原因还在寻找ing，

还请敬候佳音......
