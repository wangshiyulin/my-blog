---
title: WebDAV搭建+Obsidian同步
slug: WebDav-Obsidian
date: 2026/03/25 14:39:00
updated: 2026/05/04 18:13:57
status: publish
author: 往世雨
categories: 
  - 技术
tags: 
  - 软件
desc: WebDAV搭建+Obsidian同步，极大提高效率
---


WebDAV（全称：Web Distributed Authoring and Versioning）其实就是一个“网络文件夹”的协议。

简单理解：服务器端搭建WebDAV，不同设备通过WebDAV协议，可以上传或拉取指定文件夹里的文件或数据

很多软件都可以通过WebDAV实现不同端的同步共享

本文即为搭建WebDAV并实现Obsidian的多端同步

Let's begin

---

#### 准备

**1. 一台云服务器或VPS或一台NAS**

**2. 本地电脑**

**3. 一个ssh连接软件**

**4. 一个公网IP**

---

#### 搭建服务器端WebDAV

使用ssh软件连接到云服务器

首先，创建一个运行目录，并下载WebDAV服务端：

> mkdir /home/webdav

> cd /home/webdav

> wget "https://github.com/hacdias/webdav/releases/download/v5.14.2/linux-amd64-webdav.tar.gz"

> tar -xzvf linux-amd64-webdav.tar.gz

新建配置文件_config.yaml_，并粘贴以下内容：

```
# Server related settings
address: 0.0.0.0
port: 51234
auth: true
tls: false
cert: cert.pem
key: key.pem
# Default user settings (will be merged)
scope:
modify: true
rules: []
users:

-(空格)username: user1
password: user1
scope: /home/webdav

-(空格)username: user2
password: user2
scope: /home/webdav
```
---

如果之后修改该文件内容，改写后需要运行

> systemctl restart webdav

去服务器的防火墙开启端口，还要进入服务器内部开启系统防火墙端口

使用以下命令启动WebDAV服务：

> ./webdav --config config.yaml

确认没问题后可以使用Systemd来控制开机自启和后台运行

使用vi vim nano等编辑器编辑 /lib/systemd/system/webdav.service文件写入以下内容：

注意把路径修改为你真实的可执行文件及配置文件路径

```
[Unit]
Description=WebDAV server
After=network.target
[Service]
Type=simple
User=root
ExecStart=/home/webdav/webdav --config /home/webdav/config.yaml
Restart=on-failure
[Install]
WantedBy=multi-user.target
```
---

> systemctl start webdav

启动webdav

> systemctl enable webdav

设置开机启动

此时可以通过http://公网IP:51234尝试访问webdav

包括添加的url也可以是http://公网IP:51234

---

#### Obsidian同步

obsidian下载remotely save

远程服务选择webdav

填上服务器地址，用户名，密码

检查连接，设置基本设置即可

PC：ctrl+p选择Remotelysave: 开始同步

Android：点击Remotelysave: 开始同步
