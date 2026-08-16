---
title: 自建 WebDAV 服务，实现 Obsidian 笔记多端同步方案
slug: cloud-WebDav-Obsidian
date: 2026/03/25 14:39:00
updated: 2026/08/12 17:01:00
categories: 
  - 技术
tags: 
  - 软件
description: WebDAV搭建+Obsidian同步，极大提高效率
---


## 使用 WebDAV 搭建自己的 Obsidian 多端同步服务

WebDAV（Web Distributed Authoring and Versioning）是一种基于 HTTP 的文件管理与协作协议。

简单来说，可以把它理解成一个可以通过网络访问的“文件夹”：

- 服务端运行 WebDAV 服务；
- 不同设备通过 WebDAV 访问指定目录；
- 客户端可以根据权限上传、下载、修改和删除文件；
- 支持 WebDAV 的软件可以利用它实现跨设备的数据同步。

本文使用 Linux 云服务器作为 WebDAV 服务端，并通过 Obsidian 的 **Remotely Save** 插件，实现 PC、Android 等设备之间的同步。

> 本文以 `hacdias/webdav` 为例。示例中的版本号、端口和用户名密码均可根据实际情况修改。

---

### 一、准备工作

你需要准备：

1. 一台 Linux 云服务器、VPS 或 NAS
2. 一个 SSH 客户端
3. 一个可以被客户端访问的**公网地址**或**已解析到服务器的域名**
4. Obsidian 社区插件 **Remotely Save**

> 如果服务器没有公网 IP，需要额外配置内网穿透、反向代理或其他网络访问方案，这里不表

---

### 二、搭建 WebDAV 服务端

#### 1. 连接服务器

使用 SSH 客户端连接 Linux 服务器。

创建 WebDAV 运行目录：
```bash
sudo mkdir -p /home/webdav
cd /home/webdav
```

#### 2. 下载 WebDAV

本文以 Linux x86_64（amd64）为例：
```bash
wget https://github.com/hacdias/webdav/releases/download/v5.14.2/linux-amd64-webdav.tar.gz
```

解压：
```bash
tar -xzvf linux-amd64-webdav.tar.gz
```

确认程序存在：
```bash
ls -l
```

应该可以看到 `webdav` 可执行文件。

> 如果你的服务器不是 amd64 架构，请根据服务器 CPU 架构下载对应版本。实际部署时，也建议查看项目 Release 页面确认最新版本。

---

### 三、配置 WebDAV

创建配置文件：
```bash
nano /home/webdav/config.yaml
```

写入：
```yaml
address: 0.0.0.0
port: 51234

auth: true
tls: false

cert: cert.pem
key: key.pem

scope:
  /home/webdav

modify: true
permissions: CRUD
rules: []

users:
  - username: obsidian
    password: 请修改为高强度密码
    directory: /home/webdav
```

保存并退出。

#### 重要配置说明

##### `address`
```yaml
address: 0.0.0.0
```
监听服务器所有网络接口，使其他设备可以连接。

##### `port`
```yaml
port: 51234
```
WebDAV 服务监听的端口，可以根据需要修改。

##### `auth`
```yaml
auth: true
```
开启用户名和密码认证。

##### `tls`
```yaml
tls: false
```
表示 WebDAV 本身暂时不启用 TLS。

##### `users`
```yaml
users:
  - username: obsidian
    password: 请修改为高强度密码
    directory: /home/webdav
```
这是 WebDAV 登录账户。

**不要使用 `user1 / user1` 这种简单密码。**

---

### 四、启动并测试 WebDAV

先直接运行 WebDAV，确认配置没有问题：

```bash
cd /home/webdav
./webdav --config /home/webdav/config.yaml
```

如果没有报错，说明服务已经启动。

此时可以使用 WebDAV 客户端测试：**http://你的公网IP:51234**

> 浏览器不一定能够正确显示 WebDAV 目录，因此不要仅通过浏览器页面判断 WebDAV 是否正常。使用 WebDAV 客户端进行连接测试更加可靠。

---

### 五、开放服务器端口

本文使用：**TCP 51234**

因此需要在云服务器控制台的**安全组 / 网络防火墙**中放行 `51234/TCP`。

如果服务器还启用了系统防火墙，也需要放行相同端口。

例如使用 UFW：

```bash
sudo ufw allow 51234/tcp
sudo ufw status
```

> 不同 Linux 发行版的防火墙管理方式不同。如果没有启用 UFW，不需要执行 UFW 命令。

---

### 六、使用 Systemd 管理 WebDAV

直接运行：

```bash
./webdav --config /home/webdav/config.yaml
```

适合测试，但不适合作为长期运行方式。

可以使用 Systemd 管理服务，使 WebDAV：

- 后台运行；
- 开机自动启动；
- 异常退出后自动重启；
- 可以使用 `systemctl` 统一管理。

#### 1. 创建服务文件

```bash
sudo nano /etc/systemd/system/webdav.service
```

写入：

```ini
[Unit]
Description=WebDAV server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/webdav
ExecStart=/home/webdav/webdav --config /home/webdav/config.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

> `ExecStart` 和 `WorkingDirectory` 必须与你实际的 WebDAV 程序路径一致。

#### 2. 加载并启动服务

重新加载 Systemd：
```bash
sudo systemctl daemon-reload
```

启动：
```bash
sudo systemctl start webdav
```

设置开机自动启动：
```bash
sudo systemctl enable webdav
```

查看状态：
```bash
sudo systemctl status webdav
```

如果看到：
```text
Active: active (running)
```

说明 WebDAV 正在运行。

#### 3. 查看日志

如果启动失败，可以查看：
```bash
sudo journalctl -u webdav -e
```

实时查看日志：
```bash
sudo journalctl -u webdav -f
```

---

### 七、修改配置后如何生效

修改文件：
```text
/home/webdav/config.yaml
```

重启服务：
```bash
sudo systemctl restart webdav
```

如果修改了：
```text
/etc/systemd/system/webdav.service
```

则需要先执行：
```bash
sudo systemctl daemon-reload
```

再重启：
```bash
sudo systemctl restart webdav
```

---

## 八、配置 Obsidian 同步

服务器端运行正常后，就可以配置 Obsidian。

#### 1. 安装 Remotely Save

打开 Obsidian：**设置 → 第三方插件 → 社区插件**

搜索：**Remotely Save**

安装并启用。

#### 2. 配置 WebDAV

打开：**设置 → Remotely Save**

远程服务类型选择：**WebDAV**

填写：
```text
WebDAV URL:
http://你的公网IP:51234

Username:
obsidian

Password:
你设置的密码
```

如果使用域名，则填写对应域名。

然后使用插件提供的连接测试功能检查连接。

---

## 九、开始同步

### PC

打开 Obsidian 命令面板：**Ctrl + P**

搜索：**Remotely Save: 开始同步**

执行即可。

### Android

在 Android 上安装 Obsidian 和 Remotely Save，使用相同的 WebDAV 地址、用户名和密码进行配置，然后执行：

**Remotely Save: 开始同步**

即可进行同步。

---

## 十、整个同步链路

整个方案可以理解为：

```text
┌──────────────┐
│  PC Obsidian │
└──────┬───────┘
       │ Remotely Save
       ▼
┌──────────────┐
│ WebDAV 服务器 │
└──────┬───────┘
       │ Remotely Save
       ▼
┌──────────────┐
│ 安卓 Obsidian │
└──────────────┘
```

WebDAV 负责提供远程文件访问能力，Remotely Save 负责 Obsidian Vault 的同步逻辑。

---

## 十一、安全性

如果 WebDAV 服务直接暴露在公网，**不建议长期使用 HTTP 明文连接**。

建议至少做到：
1. 使用域名；
2. 使用 HTTPS；
3. 使用高强度密码；
4. 防火墙只开放必要端口；
5. WebDAV 用户只访问专用的数据目录；

---

## 十二、同步时需要注意的问题

### 1. WebDAV 不等于同步软件

WebDAV 本身只是文件访问协议。

它负责：

- 上传文件；
- 下载文件；
- 创建文件；
- 修改文件；
- 删除文件；
- 访问远程目录。

真正的 Obsidian 同步逻辑由 Remotely Save 等客户端负责。

---

### 2. 同时修改同一个文件可能产生冲突
当两个或多个客户端同时修改同一份文件时，可能产生同步冲突。

因此，尽量避免在不同设备上同时编辑同一个文件。

---

### 3. 第一次同步前建议备份

在多端首次使用之前，建议先完整备份本地 Obsidian Vault。

尤其是在已有大量笔记的情况下，不要直接在所有设备上同时进行双向同步。

---

## 十三、总结

通过 WebDAV + Remotely Save，可以自己搭建一套 Obsidian 多端同步方案。

核心组件只有三个：

```text
Linux VPS / NAS
        +
      WebDAV
        +
Remotely Save
```

其中：
- **WebDAV**：提供远程文件访问；
- **服务器**：负责存储 Vault 数据；
- **Remotely Save**：负责 Obsidian 的同步。

这种方案的优点是**数据存储位置由自己控制**，不依赖专门的第三方同步服务。

但代价也很明确：服务器、安全、备份和同步冲突都需要自己负责。

如果准备长期使用，建议进一步配置 **HTTPS、域名、反向代理、独立数据目录和自动备份**，而不是长期直接将一个 HTTP WebDAV 服务暴露在公网。
