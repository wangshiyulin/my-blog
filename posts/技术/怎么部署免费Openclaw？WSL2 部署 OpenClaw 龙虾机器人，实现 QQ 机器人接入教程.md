---
title: 怎么部署免费Openclaw？WSL2 部署 OpenClaw 龙虾机器人，实现 QQ 机器人接入教程
slug: WSL2-openclaw-QQ
date: 2026/03/11 17:36:00
updated: 2026/05/04 17:50:45
categories: 
  - 技术
tags: 
  - AI
description: WSL隔离环境，安全部署Openclaw
---

原文为WSL2+Arch+Docker安装

（因为疯狂报错因此改用配置完全的Ubuntu并全局安装openclaw）

有需要可以看看，不需要直接跳过 2-4步 即可

如有疏漏，还望指出，

闲话少叙，Let's begin！

---

## 1.Windows开启WSL

点击Win键，查找”**启用或关闭Windows功能**“，

开启”**适用于Linux的Windows子系统**“和”**虚拟机平台**“

打开任务管理器->CPU->确认”虚拟化“已启用

以管理员身份运行cmd或powershell

输入`wsl --install`安装wsl 和 ubuntu

**之后在 `C:\Users\你的用户名\` 目录下新建文件 `.wslconfig`，输入：**

[wsl2]

swap=0

memory=8GB

(禁用c盘swap文件，限制wsl内存使用为8g)**（当然，电脑性能足够可以不用配置）**

之后**wsl --shutdown**，并**重启电脑**即可

---

## ~~2.WSL中安装ArchWSL~~

> 找到GitHub上的[ArchWSL](https://github.com/yuk7/ArchWSL)，下载最新版Arch.zip即可，

> 将得到的Arch.zip文件解压到D:\\WSL\\Arch，

> 右键Arch.exe以管理员身份运行，等待文件中出现ext4.vhdx，

> 安装成功。

> 重新运行 `Arch.exe` 进入系统

#### 初始化 Keyring：

**pacman-key --init**

**pacman-key --populate archlinux**

#### 创建普通用户

**pacman -S sudo**

> （安装sudo）

**useradd -m -G wheel -s /bin/bash yourname**

> （创建用户）

**passwd yourname**

> （设置密码）

**sudo EDITOR=vim visudo**

> （开启 sudo 权限，找到 %wheel ALL=(ALL:ALL) ALL，取消前面的注释）

> 之后退出

输入**wsl --shutdown**重启一下

输入**wsl -u yourname**进入用户

---

## ~~3.安装Docker~~

**sudo pacman -Syu docker**

> （更新arch并安装docker）

> 【如果出现`is unknown trust` 或 `invalid or corrupted package`：依次运行**sudo pacman-key --init**，**sudo pacman-key --populate archlinux**，**sudo pacman -S archlinux-keyring** 更新签名库】

**sudo systemctl enable --now docker**

> （设置开机自启）

**docker --version**

> （验证docker安装）

**sudo pacman -S docker-compose**

> （安装docker compose）

**docker-compose --version**

> （验证docker compose安装）

**sudo usermod -aG docker $USER**

> （把当前用户加入 docker 组，避免每次用 sudo）

---

## ~~4.Arch部署openclaw~~

！部分步骤可以取来尝试编写源文件，拥有自己的 openclaw！

在arch里运行：
```
**git clone https://github.com/openclaw/openclaw.git**
```
> 拉取openclaw源码

**cd openclaw**

**sudo pacman -S docker-buildx --noconfirm**

> 安装docker-buildx 组件

**docker buildx install**

> 初始化buildx

**docker buildx version**

> 验证是否安装成功

**sudo systemctl restart docker**

**./docker-setup.sh**

> 重启docker并运行安装脚本，会做几件事：
>
> 1.**构建镜像**：下载必要的依赖并打包成 OpenClaw 镜像。
>
> 2.**初始化向导(Onboarding)** ：终端会跳出交互界面，问你 API Key、模型提供商等信息。
>
> 3.**启动容器**：配置完成后，它会自动调用 `docker compose` 启动服务
>
> 4.**生成令牌**：它会为你生成一个访问 UI 所需的安全 Token，并保存到 `.env` 文件中。
>
> ---

## 5.Ubuntu部署openclaw

进入 WSL 的Ubuntu系统

> **cd ~**

> **sudo apt update && sudo apt upgrade -y**

更新系统

#### 安装Node.js 22
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
安装nvm

> **source ~/.bashrc**

重置配置

> **nvm install 22**

下载node.js 22

> **node --version**

> **npm --version**

检查node和npm版本

#### 配置systemd

输入：

> **sudo vim /etc/wsl.conf**

添加：

> [boot]
>
> systemd=true

退出Ubuntu

之后 **wsl --shutdown** 并 **wsl** 进入linux

#### 部署openclaw

在终端输入：**curl -fsSL https://openclaw.ai/install.sh | bash**

之后等待自动配置完成即可，若有报错大概率是网络原因，可以搜索查询，也可询问AI **(切勿全信AI)**

等待开始安装：左箭头选择yes，之后选择QuickStart


---

之后是选择模型，我这里选择智谱的了

---

接下来是远程控制的软件选择，之后可以自行填写，这里跳过了

---

联网搜索服务，之后可以自行填写，这里跳过

---

skill配置，我选yes，然后我跳过后面再装ㄟ( ▔, ▔ )ㄏ

---

这之后配置全部NONONO

---

安装完成后，TUI是文本页面，WebUI是图形化页面，选择第二个即可


---

之后会出现如下页面：选择红框圈住的网站，记住要带token，然后在浏览器打开即可

如果页面中显示“已与网关断开连接”，查看你的网址输入，”token=“的后面不能出现任何其他符号，包括 " | | " 重新进入，或者生成新token：

> openclaw doctor --generate-gateway-token

终端输入：**openclaw dashboard** 查看即可


---

之后就能看见页面：开始养龙虾之旅

**！切记，不要关闭运行Ubuntu的终端，进入webui需要终端一直启动**



---

以下是一些维护命令：

**openclaw status**

**openclaw health**

> 日常检查健康、查看状态

**openclaw logs --follow**

> 查看日志，必备，报错就看看这里

**curl -fsSL https://openclaw.ai/install.sh | bash**

> 更新openclaw

---

## （3-15新）接入QQ

腾讯提供了QQbot机器人，帮助在QQ中调用openclaw

进入QQ开放平台openclaw专用入口[QQ开放平台｜机器人列表](https://q.qq.com/qqbot/openclaw/)

使用QQ进行登录

之后点击创建机器人，此时QQ便会收到来自小龙虾的消息



---

出现以下页面：

在wsl终端里依次运行下面的三个命令即配置完成，

之后便可以在QQ中使用openclaw了


---

后记：

**这两天通宵安装、各种报错属实精神折磨**

**不过最终的结果是“好的？”**

**（我好像属于换了个方法...）**

**最后，祝你好运**
