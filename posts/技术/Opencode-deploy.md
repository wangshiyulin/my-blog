---
title: AI 编程代理 Opencode 部署教程，本地搭建代码智能助手
slug: Opencode-deploy
date: 2026/03/26 21:35:00
updated: 2026/05/04 13:25:17
status: publish
author: 往世雨
categories: 
  - 技术
tags: 
  - AI
desc: Opencode部署及使用指南
---


本文为opencode及omc插件安装

opencode作为AI编程代理工具，一定程度上对标ClaudeCode

闲话少叙，Let's begin

---

### 准备

1. **有powershell的本地电脑**
2. **模型API，如siliconflow、deepseek等**
3. **Anaconda或Miniconda作为环境隔离**
4. **此为opencode的官网**[OpenCode | 开源 AI 编程代理](https://opencode.ai/zh)

---

### OpenCode部署

#### 1.在终端使用TUI页面

GUI的opencode较新，使用体验远不如终端TUI

win+r输入cmd打开终端

> cd C:\Desktop\opencode

进入opencode的工作目录

> conda create -n opencode nodejs -c conda-forge -y

创建空conda环境

> conda activate opencode

进入opencode环境

> npm i -g opencode-ai

安装opencode

> opencode

进入opencode页面即可开始使用

---

临时指定编辑器（对于非文本编辑器，后面加上 --wait）：

Linux：

指定nano：export EDITOR=nano

指定vscode编辑器：export EDITOR="code --wait"

windows：

指定notepad：set EDITOR=notepad

指定vscode编辑器：set EDITOR=code --wait

env:EDITOR = "notepad"指定vscode：指定vscode：$env:EDITOR = "code --wait"

使其永久生效请将其加入电脑 环境变量 中

---

#### 2.在浏览器中使用web页面：

cd到项目目录，进入conda环境，

输入 opencode web --port 4096

会弹出web端（--port默认在4096端口）

如果想要让opencode在同一网络下多人访问：

输入 opencode web --hostname 0.0.0.0 会出现：

> Local access: localhost:4096

> Network access: 192.168.1.100:4096

之后第三方在其浏览器中输入：192.168.1.100:4096 即可访问

当然，有风险，可以通过环境变量设置密码：

> OPENCODE_SERVER_PASSWORD=<自定义密码> opencode web --hostname 0.0.0.0

用户名默认为opencode，可以通过 `OPENCODE_SERVER_USERNAME` 进行更改

---

#### 3.集成到vscode系列使用：

在扩展商店搜索 opencode 下载

或者：打开vscode的集成终端，运行opencode，扩展将自动安装

---

#### 4.常用命令

> /help    查看帮助

> /connect    选择OpencodeZen模型或选择自定义模型提供商，输入key，enter即可

> /models    查看模型列表

> /init     为项目初始化opencode

> /undo    当你让opencode对文件做出了一些修改，后悔了，可以输入该命令撤销修改。之后opencode会还原做的修改

> /repo    /undo之后，可以用该命令回到撤回前

> /share    该命令会生成对话链接URL并复制到剪切板

> /unshare    移除分享链接并删除与该对话相关的数据，并将其从公开访问中移除

> /compact    压缩当前会话

> /new   新开一个会话，相当于浏览器的新建标签页

> /sessions    查看当前存在的会话并进行切换

> /themes    列出可用主题

> /thinking   启用后，可以看到支持扩展思考的模型的推理过程

> !+命令    以 `!` 开头的消息会作为 shell 命令执行，命令的输出会作为工具结果添加到对话中

> /exit   退出opencode

---

#### 5.opencode使用：

1.提问：让opencode讲解不明白的代码库，可以用"@"键模糊搜索项目种文件，如@program/index.js

2.添加功能：按Tab键，可以切换到计划模式，该模式下输入提示词不会进行修改，而是建议如何实现某个功能提供足够细节有时可以事半功倍。再次Tab键可以回到构建模式，然后让其开始实施

3.拖动图片到终端可以自动识别路径，将其添加到提示词

---

#### 6.opencode配置：

opencode支持json和jsonc格式，

位置：

全局设置opencode.json，在"~/.config/opencode/opencode.json",

项目设置opencode.json，在"项目根目录opencode/opencode.json"

顺序（最下面为第一优先级，最上面为最后优先级）：

**远程配置**（来自 `.well-known/opencode`）- 组织默认值

1. **全局配置**（`~/.config/opencode/opencode.json`）- 用户偏好
2. **自定义配置**（`OPENCODE_CONFIG` 环境变量）- 自定义覆盖
3. **项目配置**（项目中的 `opencode.json`）- 项目特定设置
4. **`.opencode` 目录** - 代理、命令、插件
5. **内联配置**（`OPENCODE_CONFIG_CONTENT` 环境变量）- 运行时覆盖

---

### oh-my-opencode插件安装

进入powershell终端，进入conda环境

运行npx oh-my-opencode install等待安装完成

之后根据情况选择配置的模型

如果都没有，可以全部选择no，

之后到C:\Users\用户\.config\opencode目录下找到oh-my-opencode.json

在里面修改想要改的模型即可

---

**祝各位一切顺利**
