---
title: Typecho 博客站点地图 Sitemap 配置方法，提升收录
slug: Typecho-sitemap
date: 2026/05/04 18:16:00
updated: 2026/07/18 18:30:07
status: publish
author: 往世雨
categories: 
  - 技术
tags: 
  - 网站
desc: Typecho设置站点地图，方便google和bing提交
---


## 1. 下载 Sitemap 插件并安装启用

1. 下载 Sitemap 插件[Sitemap插件][1]
2. 解压后，复制到网站目录 /usr/plugins


----------


## 2. 设置伪静态和永久链接

如果未开启伪静态，则无法访问sitemap.xml页面，返回404
1. 1Panel中打开 **网站 - 配置 - 伪静态**
>1panel和typecho部署请看[部署指南](/posts/技术/1panel-typecho.html)
2. 下拉选择 **typecho**，保存
3. **进入Typecho后台 - 设置 - 永久链接**
4. 勾选启用功能，如果提示没有检测到也强制勾选
5. 风格推荐选择 wordpress 风格


----------


## 3. 开启插件

1. **控制台 - 插件**
2. 启用Sitemap插件


----------


至此即配置完成，访问站点地址：http://[example].com/sitemap.xml 即可查看到sitemap.xml 


  [1]: https://github.com/typecho-fans/plugins/releases/download/plugins-S_to_Z/Sitemap.zip