---
title: 内网穿透——注册 NetBird Cloud 并组建个人虚拟局域网
slug: netbird-cloud-guide
date: 2026/10/31 01:25:55
updated: 2026/10/31 02:02:55
categories:
  - 技术
tags:
  - NetBird
  - 内网穿透
description: 从注册 NetBird Cloud 到连接 Windows、Android 和 Linux 设备，配置 Setup Key、验证设备互通，并排查常见连接问题。
---

NetBird 是基于 WireGuard 的私有组网工具。将不同网络中的设备加入同一个 NetBird 网络后，可以使用各自分配的私有 IP 互相访问，不需要家用宽带有公网 IP，也不必自行部署 NetBird 管理服务器。

本文使用 **NetBird Cloud（官方托管版）**：NetBird 负责管理、信令和必要时的中继；设备之间优先建立 P2P 直连。与自托管版本不同，**不需要购买 VPS、准备域名、安装 Docker 或配置 HTTPS**。

相关文章：

[内网穿透——使用公网 IPv4 自托管 NetBird 组建虚拟局域网](/selfhost-netbird-ipv4)\
[内网穿透——NetBird 功能与组网原理详解](/netbird-architecture-and-features)\
[内网穿透——使用域名自托管 NetBird 组建虚拟局域网](/selfhost-netbird-domain)

## 一、注册账户

1. 打开 [NetBird 官网](https://netbird.io/)，点击 **Get Started**，或直接访问 [NetBird Cloud Dashboard](https://app.netbird.io/)。

![][1]

2. 选择 Google、GitHub 或 Microsoft 等支持的登录方式，完成授权。使用现有 Google 账号登录即可，无需额外设置 NetBird 密码，但这仍会创建一个 NetBird 平台账户。
3. 首次登录按照向导完成基础信息填写，组网方式选择 **Peer-to-Peer Network**（设备之间互联），进入设备添加步骤。

截至 2026 年 10 月，NetBird Cloud Free 计划支持 **5 个用户、100 台设备**，包含 P2P 连接、访问策略、路由及私有 DNS。服务条款和免费额度可能变化，以 [官方计划页面](https://docs.netbird.io/manage/settings/plans-and-billing) 为准。

**注意：** NetBird Cloud 与自托管 NetBird 是不同的管理服务器。同一设备如果原本加入自托管网络，切换到 Cloud 时需要切换 Management Server，且可能需要重新注册。

---

## 二、将 Windows 加入网络

1. 在 Dashboard 的 **Peers → Add Peer** 选择 Windows，或者使用[官方 Windows 安装页面](https://docs.netbird.io/get-started/install/windows)下载安装程序。

![][2]

2. 运行安装程序，完成安装。NetBird 会安装后台服务和桌面客户端。
3. 打开 NetBird，选择 **NetBird Cloud**，点击 **Connect**。
4. 浏览器会打开登录授权页面，使用第一部分注册时的同一账号完成认证。
5. 返回客户端，确认状态为 **Connected**；Dashboard 的 Peers 页面应出现该设备及其 NetBird IP。

安装后重新打开 PowerShell，再执行：

```powershell
netbird status -d
```

该命令用于检查管理服务连接、已发现的 Peer 及实际连接方式。若提示找不到 `netbird`，先重新打开终端，确认程序已加入系统 PATH。

---

## 三、将 Android 加入网络

1. 从 [Google Play](https://play.google.com/store/apps/details?id=io.netbird.client) 或[官方 Android 安装文档](https://docs.netbird.io/get-started/install/android)提供的渠道安装 NetBird。
2. 首次启动时使用默认 **NetBird Cloud** 管理服务器，无需进入 **Change Server**。
3. 点击主界面的 NetBird 图标，允许 Android 建立 VPN 连接。
4. 按提示在浏览器中使用同一个 Google、GitHub 或 Microsoft 账号授权。
5. 返回应用，确认连接成功，在 Dashboard → Peers 中查看手机的 NetBird IP。

手机使用移动数据、Windows 使用家庭网络，也可以通过 NetBird IP 通信。NetBird 占用 Android 的系统 VPN 接口，通常不能与另一款基于系统 VPN 的客户端同时运行。

### 浏览器授权失败：改用 Setup Key

如果 Android 的浏览器登录回调异常，可以使用 Setup Key 注册设备：

1. 在 NetBird Dashboard 进入 **Settings → Setup Keys → Create Setup Key**。
2. 选择 **One-off**（一次性），设置较短有效期，创建并复制密钥。

![][3]

3. 打开 Android NetBird → 左上角菜单 → **Change Server**。
4. 管理服务器填写 `https://api.netbird.io:443`，点击 **+ Add this device with a setup key**。
5. 粘贴 Setup Key，点击 **Change** 保存，返回首页连接。

![][4]

**注意：** 更换 Management Server 会清除 Android 当前的 NetBird 配置；先确认需要切换。Setup Key 代替的是浏览器身份认证，**不能解决 HTTPS 证书错误或服务器网络不可达的问题**。密钥属于敏感凭据，不要发到公开聊天或仓库。

---

## 四、将 Linux 或 VPS 加入网络（可选）

对于无桌面环境的 Linux 服务器，Setup Key 比浏览器登录更合适。

在 Dashboard → **Settings → Setup Keys** 创建一个一次性密钥。然后通过 SSH 进入 Linux，下载安装脚本：

```bash
curl -fsSLo netbird-install.sh https://pkgs.netbird.io/install.sh
```

建议先检查下载的脚本：

```bash
less netbird-install.sh
```

执行安装：

```bash
sudo sh netbird-install.sh
```

使用 Setup Key 将服务器加入 NetBird Cloud：

```bash
sudo netbird up --setup-key '在这里填写Setup-Key'
```

检查连接：

```bash
sudo netbird status -d
```

**注意：** 安装 NetBird *客户端* 并不等于在 VPS 上自托管 NetBird Server；Linux VPS 在这里与 Windows、Android 一样，只是一台加入私有网络的 Peer。使用 Setup Key 注册的常驻服务器不依赖周期性的交互登录。

---

## 五、验证设备之间的访问

### 1. 查看 NetBird IP

打开 Dashboard → **Peers**，记录 Windows、Android、Linux 的 NetBird IP。NetBird 通常从 `100.64.0.0/10` 运营商级 NAT 地址空间为设备分配私有地址。该地址仅用于 NetBird 虚拟网络，不能直接从普通公网访问。

### 2. 测试连通性

假设 Windows 的 NetBird IP 是 `100.80.12.34`（示例地址），可以从另一台电脑执行：

```powershell
ping 100.80.12.34
```

Ping 失败不一定表示隧道不可用；也可能是对方系统防火墙禁止 ICMP。应结合实际应用端口继续测试。

例如，Windows 上运行 WebDAV 服务，监听 TCP 8080，手机可在 WebDAV 客户端中填写：

```text
http://100.80.12.34:8080
```

WebDAV 服务需要监听可由 NetBird 到达的网卡地址，Windows 防火墙和 NetBird 访问策略也必须放行该端口。仅有 NetBird 连接成功，并不代表 Windows 自动开启了 WebDAV、文件共享或远程桌面。

### 3. 检查 P2P 或 Relay

在 Windows/Linux 查看：

```bash
netbird status -d
```

如果显示 **P2P**，设备数据直接经过加密隧道传输；如果显示 **Relay**，说明无法建立直连，数据经 NetBird 中继转发。Relay 不代表连接失败，但通常增加延迟并受中继带宽影响。

---

## 六、设备分组与访问控制

NetBird 新账户通常包含允许所有 Peer 互访的 **Default** 策略，适合第一次验证设备连通性。更多设备接入后，建议改为按组授权。

例如，希望手机和笔记本仅访问 Windows 的 WebDAV：

1. 在 **Access Control → Groups** 创建 `clients` 和 `file-server` 两个 Peer Group。
2. 在 **Peers** 中把 Android、笔记本加入 `clients`，Windows 加入 `file-server`。
3. 在 **Access Control → Policies** 新建策略：来源 `clients`，目标 `file-server`，协议 TCP，端口 `8080`，允许访问。
4. 在确认新策略有效后，停用或删除允许所有设备互访的 `Default` 策略。

**关键区别：** Group 是设备集合，Policy 才决定能否通信。若默认的全互通策略仍生效，新建的限制性策略不会自动收紧现有访问权限。

---

## 七、常见问题

| 现象 | 排查方向 |
|---|---|
| Dashboard 找不到设备 | 客户端是否使用 Cloud、是否用同一账号完成注册、设备是否连接 |
| Android 浏览器登录失败 | 改用一次性 Setup Key；Cloud 的地址为 `https://api.netbird.io:443` |
| Android 提示证书错误 | 检查系统时间、网络拦截及服务器地址；Setup Key 无法绕过 TLS 验证 |
| 两台设备在线却无法访问服务 | NetBird Policy、目标系统防火墙、服务监听 IP 和端口 |
| `ping` 失败 | 尝试直接测试所需的 TCP 服务，排除 ICMP 被防火墙阻断 |
| 连接走 Relay，速度一般 | 网络 NAT/UDP 环境可能无法支持 P2P；Relay 仍是加密连接 |
| 连上后不能访问整个家庭 LAN | 默认仅互连安装了 NetBird 的设备；要访问未安装客户端的设备，需配置 Networks 和 Routing Peer |
| 手机其他 VPN 无法同时开启 | Android 通常一次仅允许一个 VPN 接口 |
| 设备频繁要求重新登录 | 查看 Peer 登录会话是否过期；常驻无头设备可使用 Setup Key |

详细诊断可从客户端执行：

```bash
netbird status -d
```

修改连接策略后，等待配置下发，再重新测试。不要为了排障直接关闭所有设备防火墙，优先只放行确实需要的端口。

---

## 八、后续可以做什么

- **远程文件访问：** Android 在移动网络下访问 Windows 的 WebDAV、SSH/SFTP 或 SMB。
- **远程桌面：** 使用 Windows 远程桌面等工具连接 NetBird 私有 IP。
- **私有开发服务：** 在笔记本上访问家里电脑的 Web API、Docker 服务或数据库。
- **整段内网访问：** 使用 **Networks** 和 Routing Peer 接入无法安装 NetBird 的 NAS、打印机或其他内网设备。
- **自定义互联网出口：** 将一台已加入 NetBird 的 VPS 配置为 **Exit Node**。仅安装 NetBird Cloud 客户端不会自动产生 VPN 公网出口。

简单设备组网只需要完成前五部分。其他功能按实际需求再配置，避免增加不必要的常驻组件和规则。

---

## 参考资料

1. [NetBird Cloud 入门教程](https://docs.netbird.io/get-started)
2. [NetBird 官方免费及付费计划](https://docs.netbird.io/manage/settings/plans-and-billing)
3. [NetBird Windows 安装](https://docs.netbird.io/get-started/install/windows)
4. [NetBird Android 安装及 Setup Key 配置](https://docs.netbird.io/get-started/install/android)
5. [NetBird Linux 安装](https://docs.netbird.io/get-started/install/linux)
6. [Setup Keys 使用与安全管理](https://docs.netbird.io/manage/peers/register-machines-using-setup-keys)
7. [设备组与访问策略](https://docs.netbird.io/manage/access-control/manage-network-access)
8. [设备与服务故障排查](https://docs.netbird.io/help/troubleshooting-client)
9. [Networks：访问远程内网](https://docs.netbird.io/manage/networks)
10. [Exit Nodes：配置互联网出口](https://docs.netbird.io/use-cases/remote-access/exit-nodes)


[1]: /images/uploads/2026/10/2026-10-31_13-16-02.webp
[2]: /images/uploads/2026/10/2026-10-31_13-17-47.webp
[3]: /images/uploads/2026/10/2026-10-31_02-07-36.webp
[4]: /images/uploads/2026/10/2026-10-31-02-04-34-57.webp
[5]: /images/uploads/2026/10/2026-10-31_13-23-39.webp




