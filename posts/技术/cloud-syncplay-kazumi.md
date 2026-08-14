---
title: 云服务器搭建 Syncplay 服务端，搭配 Kazumi 实现远程多人同步看番
slug: cloud-syncplay-kazumi
date: 2026/06/13 12:25:00
updated: 2026/08/12 17:10:05
categories: 
  - 技术
tags: 
  - 软件
description: 从零开始在 Ubuntu 云服务器部署 Syncplay 独立服务端，使用 systemd 管理服务并配置防火墙，再通过 Kazumi 的“一起看”功能连接自建 Syncplay 服务器，实现多人远程同步观看。
---

## 在 Ubuntu 云服务器上搭建 Syncplay 服务端，并使用 Kazumi 实现远程同步看番

和朋友异地一起看番时，真正麻烦的往往不是找到视频，而是让所有人的播放进度保持一致。

一个人暂停了，其他人还在播放；有人网络卡顿，重新播放后又需要手动调整时间轴。传统的共享屏幕、远程桌面或者“3、2、1 一起点播放”都能勉强解决问题，但体验并不理想。

**Syncplay** 提供了另一种思路：

> 它不负责传输视频，而是让多个播放器通过一个同步服务器共享播放状态。

暂停、播放、跳转进度等操作可以同步到同一个房间中的其他客户端。

而 **Kazumi** 本身提供了“一起看”功能，并使用 Syncplay 协议实现多人同步观看。因此，如果平时使用 Kazumi 看番，就不需要为了 Syncplay 再单独准备一个播放器客户端。

本文将以 Ubuntu 云服务器为例，从零部署一个自建 Syncplay 服务端，然后在 Kazumi 中连接它。

---

### 一、Syncplay 到底是什么？

Syncplay 是一个用于**同步媒体播放器状态**的软件。

它的工作方式：

```
              Syncplay Server
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
        用户 A     用户 B     用户 C
          │         │         │
       播放器     播放器     播放器
```

服务器主要负责协调房间内客户端的播放状态。

例如 A 用户执行：播放/暂停/跳转到 15:32

这些状态会同步给房间内其他客户端。**视频本身仍然由每个人自己的设备播放。**

这意味着：
- Syncplay 服务器不会替你提供番剧视频；
- 不会把视频流转发给朋友；
- 云服务器的带宽压力主要来自同步控制通信，而不是视频流量；
- 每个人仍然需要能够正常访问和播放对应的视频源。

这也是为什么一台配置并不高的 VPS 通常就可以承担个人或小规模 Syncplay 服务。

---

## 二、为什么要自己搭建 Syncplay Server？

Syncplay 有公共服务器可以使用，因此并不是必须自己部署服务器。

但是，如果只是自己和几个朋友长期使用，自建服务器仍然有一些优势。

#### 1. 地址固定

可以使用：**syncplay.example.com:8999**

而不是每次依赖公共服务器。

#### 2. 自己控制访问方式

可以设置服务器连接密码，并根据需要限制房间隔离、聊天等功能。

#### 3. 自己控制服务器位置

可以选择距离自己和朋友较近的云服务器，降低同步控制通信的网络延迟。

> Syncplay 的同步通信量很小，因此这里关注的是网络连接质量和延迟，而不是服务器带宽能否承载视频流。

#### 4. 适合长期使用

如果你本身已经有一台 VPS，用它额外运行一个 Syncplay 服务并不会占用太多资源。

---

## 三、本文最终实现的效果

完成之后，整体结构如下：
```
                 Ubuntu VPS
              Syncplay Server
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Kazumi     Kazumi     其他 Syncplay 客户端
       用户 A      用户 B          用户 C
          └──────────┼──────────┘
               同一个房间
                     │
              播放状态同步
```

最终每个人仍然使用自己的网络播放视频，而 Syncplay 负责让播放状态保持一致。

---

## 四、准备工作

本文使用以下环境：
- Ubuntu 22.04 / 24.04
- 一台具有公网 IP 的云服务器
- SSH 登录权限
- `sudo` 权限
- 一个用于连接的端口，例如 `8999`
- Kazumi 客户端

---

## 五、安装 Syncplay 服务端

Syncplay 官方项目：

[Syncplay GitHub](https://github.com/Syncplay/syncplay)

截至本文整理时，Syncplay 最新稳定版本为 **1.7.6**。如果你在以后阅读本文，建议先查看官方 Releases 页面确认最新版本。

---

### 1. 安装基础依赖

首先更新软件源：
```bash
sudo apt update
```

安装 Git、Python 和虚拟环境工具：
```bash
sudo apt install -y git python3 python3-venv python3-pip
```

检查 Python：
```bash
python3 --version
```

Syncplay 当前服务端源码要求 Python 3.4 或更高版本。

---

### 2. 创建专用运行用户

不建议长期使用 `root` 运行 Syncplay。

创建一个专门的系统用户：
```bash
sudo useradd --system --create-home --home-dir /opt/syncplay --shell /usr/sbin/nologin syncplay
```

创建完成后，`syncplay` 用户的工作目录为：
```text
/opt/syncplay
```

---

### 3. 下载 Syncplay

切换到目录：
```bash
cd /opt
```

克隆官方仓库：
```bash
sudo git clone https://github.com/Syncplay/syncplay.git
```

修改目录所有者：
```bash
sudo chown -R syncplay:syncplay /opt/syncplay
```

进入目录：
```bash
cd /opt/syncplay
```

---

### 4. 创建 Python 虚拟环境

使用虚拟环境可以避免 Syncplay 的 Python 依赖与系统 Python 环境发生冲突。

执行：
```bash
sudo -u syncplay python3 -m venv /opt/syncplay/venv
```

安装项目依赖：
```bash
sudo -u syncplay /opt/syncplay/venv/bin/pip install --upgrade pip
sudo -u syncplay /opt/syncplay/venv/bin/pip install -r /opt/syncplay/requirements.txt
```

Syncplay 当前源码的服务端依赖文件包含 `twisted[tls]`、`certifi`、`pem` 等依赖。

---

## 六、先手动启动 Syncplay 测试

在正式配置 Systemd 之前，建议先手动启动一次。

执行：
```bash
cd /opt/syncplay
sudo -u syncplay /opt/syncplay/venv/bin/python /opt/syncplay/syncplayServer.py --port 8999
```

如果启动成功，终端会显示 Syncplay Server 的启动信息。

默认端口为: 8999

当前源码中，如果没有指定 `--port`，服务端会使用 Syncplay 定义的默认端口。

确认没有报错后，可以按：**Ctrl + C**停止服务。

> 第一次启动时，如果没有指定 `--salt`，Syncplay 会生成并提示一个服务器 salt。官方源码也明确提示，为了让服务器生成的受控房间密码在服务重启后继续有效，应固定使用 `--salt`。

---

## 七、配置 Systemd

手动运行适合测试，但不适合作为长期服务。

我们使用 Systemd 管理 Syncplay，使它能够：
- 后台运行；
- 开机自动启动；
- 服务异常退出后自动重启；
- 使用 `systemctl` 统一管理；
- 使用 `journalctl` 查看日志。

---

### 1. 创建服务文件

创建：
```bash
sudo nano /etc/systemd/system/syncplay.service
```

写入：
```ini
[Unit]
Description=Syncplay Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=syncplay
Group=syncplay
WorkingDirectory=/opt/syncplay
ExecStart=/opt/syncplay/venv/bin/python /opt/syncplay/syncplayServer.py --port 8999 --password "请修改为强密码" --salt "请修改为随机字符串"
Restart=on-failure
RestartSec=15

[Install]
WantedBy=multi-user.target
```

然后保存。

---

## 八、配置服务器密码和 Salt

上面的服务文件包含：
```
--password
--salt
```

例如：
```
ExecStart=/opt/syncplay/venv/bin/python /opt/syncplay/syncplayServer.py --port 8999 --password "你的强密码" --salt "一串随机字符串"
```

### `--password` 是什么？

它用于设置**连接 Syncplay 服务器时需要提供的服务器密码**。

如果你希望这个服务器只给自己和朋友使用，建议设置密码。

例如: **--password "A-Strong-Random-Password"**

---

### `--salt` 是什么？

`--salt` 不应该简单理解成“服务器登录密码”。

它是 Syncplay 用来生成受控房间密码相关数据的服务器级随机字符串。

官方源码中，如果没有手动指定 salt，服务器会随机生成一个；如果希望服务器重启后由该服务器生成的受控房间密码继续有效，就应该固定保存这个值。

因此建议：
```
password = 自己设置的服务器连接密码
salt     = 一串随机且长期保持不变的字符串
```

例如：
```
--password "ChangeThisToAStrongPassword"
--salt "8f1e0d6c9a4b7e2f5d3c1a9b"
```

> `salt` 不需要频繁修改。如果修改它，依赖旧 salt 生成的受控房间密码可能无法继续使用。

---

## 九、启动 Syncplay 服务

修改完成后，重新加载 Systemd：
```bash
sudo systemctl daemon-reload
```

启动服务：
```bash
sudo systemctl start syncplay
```

设置开机自动启动：
```bash
sudo systemctl enable syncplay
```

查看状态：
```bash
sudo systemctl status syncplay
```

如果看到：**Active: active (running)**

说明服务已经正常运行。

---

## 十、查看 Syncplay 日志

如果服务没有正常启动，不要直接重复执行启动命令。

首先查看日志：
```bash
sudo journalctl -u syncplay -e
```

实时查看：
```bash
sudo journalctl -u syncplay -f
```

---

## 十一、开放服务器防火墙

Syncplay 默认使用 TCP 8999。

因此至少需要处理两层防火墙：**云厂商安全组+Ubuntu 本机防火墙**

---

### 1. Ubuntu UFW

如果你使用 UFW：
```bash
sudo ufw allow 8999/tcp
```

查看：
```bash
sudo ufw status
```

如果 UFW 尚未启用，不要为了这一步盲目执行：
```bash
sudo ufw enable
```

因为错误配置 UFW 可能导致 SSH 连接中断。

---

### 2. 云服务器安全组

如果使用腾讯云、阿里云、华为云、AWS 等云服务器，还需要在云平台控制台的安全组 / 防火墙中添加入方向规则：
```
协议：TCP
端口：8999
来源：根据自己的需求设置
```

如果只是和固定朋友使用，可以进一步限制来源 IP。

如果朋友的 IP 经常变化，则通常需要开放公网访问，再依靠 Syncplay 密码和其他访问控制手段进行保护。

---

## 十二、在 Kazumi 中连接自建 Syncplay Server

Kazumi 官方项目：

[GitHub - Predidit/Kazumi](https://github.com/Predidit/Kazumi)

Kazumi 是一个跨平台的番剧采集与在线观看程序，当前项目包含“一起看”功能，并在项目说明中注明使用 Syncplay 协议实现相关功能

---

### 1. 打开 Kazumi

在 Kazumi 中选择一部番剧并进入播放页面。

找到一起看, 进入 Syncplay 相关功能。

> Kazumi 的界面可能会随着版本更新发生变化，因此具体按钮位置以你当前版本为准。

---

### 2. 设置自定义服务器

选择自定义 Syncplay 服务器，然后填写： **你的服务器IP:8999**

然后填写服务器密码。

连接成功后，加入一个房间。

你的朋友也需要**相同操作**

这样才能进入同一个 Syncplay 房间。

---

## 十三、常用 Syncplay Server 参数

可以使用：
```bash
python3 syncplayServer.py --help
```

查看当前版本支持的完整参数。

常用参数包括：

| 参数 | 作用 |
| --- | --- |
| `--port` | 修改监听端口 |
| `--password` | 设置服务器连接密码 |
| `--salt` | 指定服务器 salt |
| `--isolate-rooms` | 隔离房间，限制不同房间之间的用户可见性 |
| `--disable-ready` | 禁用准备状态功能 |
| `--disable-chat` | 禁用聊天 |
| `--max-chat-message-length` | 限制聊天消息最大长度 |
| `--max-username-length` | 限制用户名最大长度 |
| `--motd-file` | 指定进入房间时显示的 MOTD 文件 |
| `--rooms-db-file` | 保存持久化房间数据的 SQLite 数据库 |
| `--permanent-rooms-file` | 指定永久房间列表 |
| `--stats-db-file` | 保存服务器统计数据的 SQLite 数据库 |
| `--tls` | 指定 TLS 证书目录 |
| `--ipv4-only` | 仅监听 IPv4 |
| `--ipv6-only` | 仅监听 IPv6 |
| `--interface-ipv4` | 指定 IPv4 监听接口 |
| `--interface-ipv6` | 指定 IPv6 监听接口 |

这些参数来自当前 Syncplay 服务端源码；如果以后版本发生变化，应以 `syncplayServer.py --help` 和官方源码为准。

---

### 相关项目

- [Syncplay GitHub](https://github.com/Syncplay/syncplay)
- [Syncplay Releases](https://github.com/Syncplay/syncplay/releases)
- [Syncplay 官网](https://syncplay.pl/)
- [Kazumi GitHub](https://github.com/Predidit/Kazumi)
