---
title: 解决Android端 Thunderbird 无法扫描二维码导入邮箱账户问题
slug: Thunderbird-Android-QR
date: 2026/07/18 17:04:18
updated: 2026/07/18 17:20:21
status: publish
author: 往世雨
categories: 
  - 解疑
tags: 
  - 解疑
desc: Thunderbird Android 端无法扫描二维码导入账户解决
---


在将Thunderbird桌面端同步到Android端时，有时会出现扫描二维码但是没有任何反应的情况。

## 问题情况：

桌面端操作： "Thunderbird设置" -> "导出到移动设备" -> 选择需要导出的邮箱 -> "导出"

Android端操作："设置" -> "导入设置" -> "扫描二维码"

问题：Android端在权限没有问题、摄像头正常时，没有任何反应

## 解决方式：

桌面端返回到 "选择需要导出的邮箱" 这一步，只选择一个邮箱，然后重新进行导出。

Android端操作不变。

这样大概率能够解决问题。