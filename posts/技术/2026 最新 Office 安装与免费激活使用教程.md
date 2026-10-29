---
title: 2026 最新 Office 安装与免费激活使用教程
slug: office-download-install-free-use
date: 2026/10/29 17:38:34
updated: 2026/10/29 17:38:34
categories:
  - 技术
tags:
  - Windows
  - Office
description: 介绍 Office 的免费使用方式，以及通过 Office Deployment Tool 自定义安装 Word、Excel 和 PowerPoint。
---

## 一、前言
Microsoft 365 或 Office 桌面版需要相应的许可证才能激活；使用产品密钥的用户，可以先兑换密钥，再安装 Office。

没有桌面版许可证时，可以免费使用 Word、Excel 和 PowerPoint 网页版：登录Microsoft 365 网站，选择对应应用即可。网页版不需要安装桌面应用。

如果不想使用网页版，也可以通过 Office Deployment Tool（ODT）自定义安装桌面版的 Word、Excel 和 PowerPoint。ODT 是微软官方提供的部署工具，可以选择安装哪些应用、语言和版本。本文将介绍如何使用 ODT 安装三件套，并说明其免费激活方法。

---

## 二、用 ODT 自定义安装三件套

Office Deployment Tool（ODT）可以根据 XML 配置选择 Office 版本、语言和要安装的应用。ODT 本身是部署工具，不提供 Office 许可证。

[ODT 部署说明](https://learn.microsoft.com/en-us/microsoft-365-apps/insider/deploy/office-deployment-tool)\
[ODT 下载](https://officecdn.microsoft.com/pr/wsus/setup.exe)

1. 下载 ODT 并解压到一个文件夹，例如 `C:\Office`。解压后应有 `setup.exe`。
2. 打开 [Office 自定义工具](https://config.office.com/deploymentsettings)，按照自己的需求选择部署设置。
3. 在应用选项中只保留 **Word、Excel、PowerPoint**，取消其他应用；开启自动更新。
4. 导出配置文件 `Configuration.xml`，与 `setup.exe` 放在同一个文件夹。

![][1]

![][2]

5. 以**管理员身份打开命令提示符**，执行：

```cmd
cd /d C:\Office
setup.exe /configure Configuration.xml
```

安装程序会根据 XML 配置下载并安装所选应用。ODT 的命令格式和管理员权限要求见 [微软部署指南](https://learn.microsoft.com/en-us/microsoft-365-apps/insider/deploy/office-deployment-tool)。

---

## 三、激活步骤
1. 按 Win+R 打开输入 cmd 终端，输入下方命令：
```
irm https://get.activated.win | iex
```

![][3]

2. 命令注释：
Activation Methods: 激活方法

[1] HWID        |  Windows             |   Permanent 永久
[2] Ohook       |  Office              |   Permanent 永久
[3] TSforge     |  Windows/Office/ESU  |   Permanent 永久, 2025年2月19日新增，最新的3.0版才有
[4] Online KMS  |  Windows / Office    |   180 Days 180天
__________________________________________________

[5] Check Activation Status 检查激活状态
[6] Change Windows Edition 改Windows版本
[7] Change Office Edition 改Office版本
__________________________________________________

[8] Troubleshoot 疑难排解
[E] Extras 附加选项
[H] Help 帮助
[0] Exit 退出
______________________________________________________


3. 按照提示选择激活产品，这里输入 2 激活Office，在下一个页面输入 1。

![][4]

等待激活成功后，Word、Excel 和 PowerPoint 就可以正常使用了。

## 相关链接
该脚本的Github仓库：[Microsoft-Activation-Scripts](https://github.com/massgravel/Microsoft-Activation-Scripts)
其余参考链接
[微软账户与 Office 许可证说明](https://support.microsoft.com/en-us/accounts-billing/subscriptions/why-do-i-need-an-account-to-sign-in-to-microsoft-365-or-office) \
[产品密钥兑换说明](https://support.microsoft.com/en-us/microsoft-365-activation-licensing/office-install/where-to-enter-your-office-product-key)
[Microsoft 365 免费网页版说明](https://support.microsoft.com/en-us/accounts-billing/subscriptions/what-s-the-difference-between-a-microsoft-365-subscription-and-free-web-apps)


[1]: /images/uploads/2026/10/2026-10-29_17-51-07.webp
[2]: /images/uploads/2026/10/2026-10-29_17-51-48.webp
[3]: /images/uploads/2026/10/2026-10-29_17-55-47.webp
[4]: /images/uploads/2026/10/2026-10-29_17-57-19.webp