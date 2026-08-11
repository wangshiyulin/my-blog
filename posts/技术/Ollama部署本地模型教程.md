---
title: Ollama部署本地模型教程
slug: Ollama-setup
date: 2026/03/17 13:39:00
updated: 2026/05/04 17:55:55
status: publish
author: 往世雨
categories: 
  - 技术
tags: 
  - AI
desc: 本地部署神器Ollama，推荐新手使用，简单又便捷
---


本文为Ollma使用教程，

事实上Ollama本就是为更方便地接入并使用模型准备的，

因此使用起来相当容易，

博主自己探索AI的开端就是想为VScode接入自动补全，

然后首先碰到Ollama，之后开启了AI新世界的大门，

因此，希望本文能够帮到你

---

## Ollama安装

进入Ollama官网 [Ollama](https://ollama.com/)，

点击右上角Download下载安装包并安装即可，

不过Ollama默认安装到C盘，若想移动安装位置：

进入OllamaSetup.exe的下载位置，右键在终端打开，

（这里把ollama安装在D盘）输入：

> OllamaSetup.exe /DIR=D:\Ollama

即可成功把Ollama安装在D盘

可以在终端输入 ollama -v 检查是否安装成功

---

## 部署本地模型

进入OllamaSearch页面[Ollama](https://ollama.com/search)

本次选择qwen3.5-0.8B模型安装，点击进入下一页面


---

点击进入Viewall进入models页面，本次选择q8量化的模型

---

点击即可进入下面的页面，复制CLI命令

---

按 Win+r 输入 cmd 打开终端，粘贴刚复制的命令，Enter等待拉取完成

如果出现Error，尝试切换网络重新拉取

之后会自动进入会话

---

输入 /bye 或按 Ctrl+d 退出会话页面

输入 ollama list 即可查看部署的模型

---

如果想要删除，输入 ollama rm qwen3.5:0.8b-q8_0 即可

---

自此，模型本地部署完成

之后若有需要，可以接入如Void、VScode+Countinue等编辑器

下面是Ollama的使用命令

---

> ollama serve

前台运行，关闭终端则停止；建议用系统服务自启

> ollama pull 模型名

仅下载模型到本地，不启动对话

> ollama run 模型名

（自动下载+运行）模型

> ollama list

查看本地已下载的模型

> ollama rm 模型名

删除指定模型模型

> ollama cp 旧名  新名

复制现有模型为新名称

> ollama show 模型名 --parameters --modelfile

查看模型元信息

--parameters查看模型运行参数（温度、上下文窗口等）

--modelfile  查看模型配置文件（Modelfile）

> ollama update

自动检查并更新到最新版本

> ollama ps

列出正在运行的模型

> ollama stop

停止正在运行的模型

> ollama create name -f Modelfile

将本地的一个模型连接为ollama模型

> ollama help

查看帮助
