---
title: Windows11 推出新版开始菜单，如何返回旧版菜单
slug: Windows11-new-menu
date: 2026/06/11 19:22:00
updated: 2026/06/11 19:38:28
status: publish
author: 往世雨
categories: 
  - 解疑
tags: 
  - 解疑
desc: Windows11新版本开始菜单难用？这里教你改回原版效果
---


Windows11系统升级至26200.8655之后开始菜单增加了【全部】这一栏目

![][1]

虽然看着更方便了，不用来回切换'全部'和'固定的应用'

但对于我这种桌面干净，应用启动全在开始菜单的使用者来说，非常影响日常使用

这里提供一些解决方式。

----------

无论Windows11的家庭版还是其他版本，都可以采用如下方式：

以管理员身份打开 cmd 并运行以下命令：

要移除新的开始菜单：

>reg add “HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer” /v NoStartMenuMorePrograms /t REG_DWORD /d 1 /f && taskkill /f /im explorer.exe && start explorer.exe

如果你想恢复：

>reg add “HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer” /v NoStartMenuMorePrograms /t REG_DWORD /d 0 /f && taskkill /f /im explorer.exe && start explorer.exe

----------

如果非Windows11家庭版，还可以采用下面的方式：

**Win+R 输入 gpedit.msc 回车打开本地组策略编辑器**

左侧路径：

**用户配置 → 管理模板 → 开始菜单和任务栏**

右侧找到：

**从「开始」菜单删除所有程序列表，双击打开**

**选择「已启用」，下拉选项选 删除并禁用设置**

**点「应用」→「确定」**

**重启电脑 / 重启资源管理器生效**

ps：
折叠：按钮还在，点一下才展开应用列表
折叠并禁用设置：按钮保留，设置里关不掉显示应用列表
删除并禁用设置：完全移除「全部」按钮

----------

修改之后的效果如下：

![][2]


  [1]: /images/uploads/2026/06/533672256.webp
  [2]: /images/uploads/2026/06/892525766.webp