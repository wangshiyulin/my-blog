---
title: Syncthing 搭建 Obsidian 多端同步，无需第三方云端方案
slug: Obsidian-syncthing
date: 2026/03/22 22:43:00
updated: 2026/05/04 17:54:56
categories: 
  - 分享
tags: 
  - 软件
description: 本文介绍使用Syncthing实现跨设备文件同步的方法，涵盖PC与PC、PC与Android间的设置步骤，强调需在同一局域网下运行。
---


试过很多方式，还是感觉这个方法最好

闲话少叙，Let's begin

---

## 准备

确保设备之间处于同一局域网下

PC端：

**Github：**[Syncthing](https://github.com/syncthing/syncthing/releases/tag/v2.0.15)

**官网：**[Syncthing | Downloads](https://syncthing.net/downloads/)

Android端：

**Github（已停止维护, 仍可使用）：**[Syncthing-android](https://github.com/syncthing/syncthing-android/releases)

**F-Droid或GooglePlay商店**

获得安装包或压缩包后，找到exe文件启动即可

博主本次使用免安装压缩包方式

---

## PC & PC

安装完成后，进入文件夹找到Syncthing.exe双击启动

之后会弹出一个终端，稍等片刻会在浏览器打开WebUI

---

接收端：

右上角操作中点击显示ID，获取一串字符ID

发送端：

添加文件夹，保存即可（被添加的文件夹在之后会被自动同步到其他设备）

然后添加远程设备，保存即可。

之后接收端会弹出窗口询问是否同意请求

同意之后，会要求选择要同步到哪个文件夹

自己配置即可

---

## PC & Android

大体步骤跟上面的一样

不过Android端的Syncthing必须要在前台运行，而且不能息屏

否则会显示断开连接

至于如何解决在寻找优解

---

至此结束，不过之后会有增添

如：如何不在同一个局域网也能同步

Sayonara~
